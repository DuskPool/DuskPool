#![no_std]

use soroban_poseidon::{poseidon2_hash, Poseidon2Sponge};
use soroban_sdk::{
    crypto::bn254::Fr as Bn254Scalar, symbol_short, vec, BytesN, Env, Map, Symbol, Vec, U256,
};

/// Storage keys for the LeanIMT
pub const TREE_ROOT_KEY: Symbol = symbol_short!("root");
pub const TREE_DEPTH_KEY: Symbol = symbol_short!("depth");
pub const TREE_LEAVES_KEY: Symbol = symbol_short!("leaves");

/// Converts u64 to Bn254Scalar
pub fn u64_to_bn254_scalar(env: &Env, value: u64) -> Bn254Scalar {
    Bn254Scalar::from_u256(U256::from_u128(env, value as u128))
}

/// Converts Bn254Scalar to BytesN<32> for Soroban storage
pub fn bn254_scalar_to_bytes(scalar: &Bn254Scalar) -> BytesN<32> {
    scalar.to_bytes()
}

/// Converts BytesN<32> to Bn254Scalar for computation
pub fn bytes_to_bn254_scalar(bytes_n: &BytesN<32>) -> Bn254Scalar {
    Bn254Scalar::from_bytes(bytes_n.clone())
}

/// Lean Incremental Merkle Tree implementation for BN254 curve
/// Uses Poseidon2 hash function optimized for BN254 scalar field
pub struct LeanIMTBN254 {
    env: Env,
    leaves: Vec<BytesN<32>>,
    depth: u32,
    capacity: u32,
    root: BytesN<32>,
    subtree_cache: Map<u32, Bn254Scalar>,
    sparse_cache: Map<(u32, u32), Bn254Scalar>,
}

impl LeanIMTBN254 {
    /// Creates a new LeanIMT with a fixed depth
    pub fn new(env: &Env, depth: u32) -> Self {
        let capacity = 1u32.checked_shl(depth).unwrap_or(u32::MAX);
        let env_clone = env.clone();
        let mut tree = Self {
            env: env_clone.clone(),
            leaves: vec![&env_clone],
            depth,
            capacity,
            root: BytesN::from_array(&env_clone, &[0u8; 32]),
            subtree_cache: Map::new(&env_clone),
            sparse_cache: Map::new(&env_clone),
        };
        tree.recompute_tree();
        tree
    }

    /// Inserts a new leaf into the tree
    pub fn insert(&mut self, leaf: BytesN<32>) -> Result<(), &'static str> {
        let current_count = self.leaves.len() as u32;

        if current_count >= self.capacity {
            return Err("Tree is at capacity: cannot insert more leaves");
        }

        self.leaves.push_back(leaf);
        self.incremental_update();
        Ok(())
    }

    /// Gets the current root of the tree
    pub fn get_root(&self) -> BytesN<32> {
        self.root.clone()
    }

    /// Gets the current root as Bn254Scalar
    pub fn get_root_scalar(&self) -> Bn254Scalar {
        bytes_to_bn254_scalar(&self.root)
    }

    /// Gets the current depth of the tree
    pub fn get_depth(&self) -> u32 {
        self.depth
    }

    /// Gets the number of leaves that have been explicitly inserted
    pub fn get_leaf_count(&self) -> u32 {
        self.leaves.len() as u32
    }

    /// Gets the maximum capacity of the tree (2^depth)
    pub fn get_capacity(&self) -> u32 {
        self.capacity
    }

    /// Checks if the tree is at capacity
    pub fn is_full(&self) -> bool {
        self.get_leaf_count() >= self.get_capacity()
    }

    /// Generates a merkle proof for a given leaf index
    pub fn generate_proof(&self, leaf_index: u32) -> Option<(Vec<Bn254Scalar>, u32)> {
        if leaf_index >= self.leaves.len() as u32 {
            return None;
        }

        let mut siblings = vec![&self.env];

        if self.depth == 1 && self.leaves.len() == 2 {
            if leaf_index == 0 {
                let sibling_bytes = self.leaves.get(1).unwrap();
                siblings.push_back(bytes_to_bn254_scalar(&sibling_bytes));
            } else {
                let sibling_bytes = self.leaves.get(0).unwrap();
                siblings.push_back(bytes_to_bn254_scalar(&sibling_bytes));
            }
        } else {
            let mut current_index = leaf_index;
            let mut current_depth = 0;

            while current_depth < self.depth {
                let sibling_index = if current_index % 2 == 0 {
                    current_index + 1
                } else {
                    current_index - 1
                };

                let sibling_scalar = if current_depth == 0 {
                    if sibling_index < self.leaves.len() as u32 {
                        let sibling_bytes = self.leaves.get(sibling_index).unwrap();
                        bytes_to_bn254_scalar(&sibling_bytes)
                    } else {
                        Bn254Scalar::from_u256(U256::from_u32(&self.env, 0))
                    }
                } else {
                    self.compute_node_at_level_scalar(sibling_index, current_depth)
                };

                siblings.push_back(sibling_scalar);
                current_index = current_index / 2;
                current_depth += 1;
            }
        }

        Some((siblings, self.depth))
    }

    /// Computes the value of an internal node at a specific level
    fn compute_node_at_level_scalar(&self, node_index: u32, target_level: u32) -> Bn254Scalar {
        if target_level > self.depth {
            return Bn254Scalar::from_u256(U256::from_u32(&self.env, 0));
        }

        if let Some(cached_value) = self.get_cached_node(target_level, node_index) {
            return cached_value;
        }

        if target_level == 0 {
            if node_index < self.leaves.len() as u32 {
                let leaf_bytes = self.leaves.get(node_index).unwrap();
                bytes_to_bn254_scalar(&leaf_bytes)
            } else {
                Bn254Scalar::from_u256(U256::from_u32(&self.env, 0))
            }
        } else {
            let left_child_index = node_index * 2;
            let right_child_index = left_child_index + 1;

            let left_scalar = self.compute_node_at_level_scalar(left_child_index, target_level - 1);
            let right_scalar =
                self.compute_node_at_level_scalar(right_child_index, target_level - 1);

            self.hash_pair(left_scalar, right_scalar)
        }
    }

    /// Incremental update using path recomputation
    fn incremental_update(&mut self) {
        let leaf_index = (self.leaves.len() - 1) as u32;

        let leaf_bytes = self.leaves.get(leaf_index).unwrap();
        let leaf_scalar = bytes_to_bn254_scalar(&leaf_bytes);
        self.cache_sparse_node(0, leaf_index, leaf_scalar);

        self.root = self.recompute_path_to_root_with_cache_update(leaf_index);
    }

    /// Recomputes only the path from a specific leaf to the root
    fn recompute_path_to_root_with_cache_update(&mut self, leaf_index: u32) -> BytesN<32> {
        let leaf_bytes = self.leaves.get(leaf_index).unwrap();
        let leaf_scalar = bytes_to_bn254_scalar(&leaf_bytes);

        let mut sponge = Poseidon2Sponge::<3, Bn254Scalar>::new(&self.env);

        let mut current_index = leaf_index;
        let mut current_level = 0;
        let mut current_scalar = leaf_scalar;

        while current_level < self.depth {
            let sibling_index = if current_index % 2 == 0 {
                current_index + 1
            } else {
                current_index - 1
            };

            let sibling_scalar = if current_level == 0 {
                if sibling_index < self.leaves.len() as u32 {
                    let sibling_bytes = self.leaves.get(sibling_index).unwrap();
                    bytes_to_bn254_scalar(&sibling_bytes)
                } else {
                    Bn254Scalar::from_u256(U256::from_u32(&self.env, 0))
                }
            } else {
                if let Some(cached_value) = self.get_cached_node(current_level, sibling_index) {
                    cached_value
                } else {
                    self.compute_node_at_level_scalar(sibling_index, current_level)
                }
            };

            let parent_scalar = if current_index % 2 == 0 {
                self.hash_pair_with_sponge(&mut sponge, current_scalar, sibling_scalar)
            } else {
                self.hash_pair_with_sponge(&mut sponge, sibling_scalar, current_scalar)
            };

            let parent_index = current_index / 2;
            let parent_level = current_level + 1;
            self.cache_sparse_node(parent_level, parent_index, parent_scalar.clone());

            current_index = current_index / 2;
            current_level = parent_level;
            current_scalar = parent_scalar;
        }

        bn254_scalar_to_bytes(&current_scalar)
    }

    fn get_cached_subtree_level(&self, level: u32) -> Option<Bn254Scalar> {
        self.subtree_cache.get(level)
    }

    fn cache_subtree_level(&mut self, level: u32, hash: Bn254Scalar) {
        self.subtree_cache.set(level, hash);
    }

    fn get_cached_node(&self, level: u32, node_index: u32) -> Option<Bn254Scalar> {
        if let Some(cached_value) = self.sparse_cache.get((level, node_index)) {
            return Some(cached_value);
        }
        self.get_cached_subtree_level(level)
    }

    fn cache_sparse_node(&mut self, level: u32, node_index: u32, hash: Bn254Scalar) {
        self.sparse_cache.set((level, node_index), hash);
    }

    /// Rebuilds the cache from the current leaves
    fn rebuild_cache_from_leaves(&mut self) {
        if self.leaves.is_empty() {
            self.recompute_tree();
            return;
        }
        self.subtree_cache = Map::new(&self.env);
        self.sparse_cache = Map::new(&self.env);
    }

    /// Recomputes the entire tree using dynamic programming for empty trees
    fn recompute_tree(&mut self) {
        if self.depth == 0 {
            self.root = BytesN::from_array(&self.env, &[0u8; 32]);
            return;
        }

        let mut sponge = Poseidon2Sponge::<3, Bn254Scalar>::new(&self.env);

        let zero_scalar = Bn254Scalar::from_u256(U256::from_u32(&self.env, 0));
        let mut current_level_hash = zero_scalar.clone();

        for level in 0..=self.depth {
            if level == 0 {
                current_level_hash = zero_scalar.clone();
            } else {
                current_level_hash = self.hash_pair_with_sponge(
                    &mut sponge,
                    current_level_hash.clone(),
                    current_level_hash,
                );
            }
            self.cache_subtree_level(level, current_level_hash.clone());
        }

        self.root = bn254_scalar_to_bytes(&current_level_hash);
    }

    /// Hashes two Bn254Scalar values using Poseidon2 hash function
    fn hash_pair(&self, left: Bn254Scalar, right: Bn254Scalar) -> Bn254Scalar {
        let left_u256 = Bn254Scalar::to_u256(&left);
        let right_u256 = Bn254Scalar::to_u256(&right);
        let inputs = Vec::from_array(&self.env, [left_u256, right_u256]);
        let result_u256 = poseidon2_hash::<3, Bn254Scalar>(&self.env, &inputs);
        Bn254Scalar::from_u256(result_u256)
    }

    /// Hashes using a pre-initialized sponge for efficiency
    fn hash_pair_with_sponge(
        &self,
        sponge: &mut Poseidon2Sponge<3, Bn254Scalar>,
        left: Bn254Scalar,
        right: Bn254Scalar,
    ) -> Bn254Scalar {
        let left_u256 = Bn254Scalar::to_u256(&left);
        let right_u256 = Bn254Scalar::to_u256(&right);
        let inputs = Vec::from_array(&self.env, [left_u256, right_u256]);
        let result_u256 = sponge.compute_hash(&inputs);
        Bn254Scalar::from_u256(result_u256)
    }

    /// Serializes the tree state for storage
    pub fn to_storage(&self) -> (Vec<BytesN<32>>, u32, BytesN<32>) {
        (self.leaves.clone(), self.depth, self.root.clone())
    }

    /// Deserializes the tree state from storage
    pub fn from_storage(env: &Env, leaves: Vec<BytesN<32>>, depth: u32, root: BytesN<32>) -> Self {
        let capacity = 1u32.checked_shl(depth).unwrap_or(u32::MAX);
        let env_clone = env.clone();
        let mut tree = Self {
            env: env_clone.clone(),
            leaves,
            depth,
            capacity,
            root,
            subtree_cache: Map::new(&env_clone),
            sparse_cache: Map::new(&env_clone),
        };
        tree.rebuild_cache_from_leaves();
        tree
    }

    /// Gets all leaves in the tree
    pub fn get_leaves(&self) -> &Vec<BytesN<32>> {
        &self.leaves
    }

    /// Checks if the tree is empty
    pub fn is_empty(&self) -> bool {
        self.leaves.is_empty()
    }

    /// Gets a leaf at a specific index
    pub fn get_leaf(&self, index: usize) -> Option<BytesN<32>> {
        match self.leaves.get(index.try_into().unwrap()) {
            Some(leaf) => Some(leaf.clone()),
            None => None,
        }
    }

    /// Gets a leaf as Bn254Scalar at a specific index
    pub fn get_leaf_scalar(&self, index: usize) -> Option<Bn254Scalar> {
        self.get_leaf(index)
            .map(|leaf_bytes| bytes_to_bn254_scalar(&leaf_bytes))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_tree() {
        let env = Env::default();
        let tree = LeanIMTBN254::new(&env, 10);
        assert_eq!(tree.get_depth(), 10);
        assert_eq!(tree.get_leaf_count(), 0);
        assert!(!tree.is_full());
    }

    #[test]
    fn test_insert_leaf() {
        let env = Env::default();
        let mut tree = LeanIMTBN254::new(&env, 10);

        let leaf = BytesN::from_array(&env, &[1u8; 32]);
        tree.insert(leaf).unwrap();

        assert_eq!(tree.get_leaf_count(), 1);
    }

    #[test]
    fn test_root_changes_on_insert() {
        let env = Env::default();
        let mut tree = LeanIMTBN254::new(&env, 10);

        let initial_root = tree.get_root();

        let leaf = BytesN::from_array(&env, &[1u8; 32]);
        tree.insert(leaf).unwrap();

        let new_root = tree.get_root();
        assert_ne!(initial_root, new_root);
    }

    #[test]
    fn test_generate_proof() {
        let env = Env::default();
        let mut tree = LeanIMTBN254::new(&env, 3);

        let leaf = BytesN::from_array(&env, &[1u8; 32]);
        tree.insert(leaf).unwrap();

        let proof = tree.generate_proof(0);
        assert!(proof.is_some());

        let (siblings, depth) = proof.unwrap();
        assert_eq!(depth, 3);
        assert_eq!(siblings.len() as u32, 3);
    }
}
