#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, vec,
    Address, Bytes, BytesN, Env, Symbol, Vec,
};

use lean_imt_bn254::{LeanIMTBN254, TREE_DEPTH_KEY, TREE_LEAVES_KEY, TREE_ROOT_KEY};

#[cfg(test)]
mod test;

// Storage keys
const ADMIN_KEY: Symbol = symbol_short!("admin");
const VERIFIER_KEY: Symbol = symbol_short!("verifier");
const ELIGIBILITY_VK_KEY: Symbol = symbol_short!("elig_vk");
const PARTICIPANTS_KEY: Symbol = symbol_short!("parts");
const ASSETS_KEY: Symbol = symbol_short!("assets");

// Merkle tree depth for whitelist
const WHITELIST_TREE_DEPTH: u32 = 20;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum RegistryError {
    OnlyAdmin = 1,
    ParticipantAlreadyExists = 2,
    ParticipantNotFound = 3,
    AssetAlreadyExists = 4,
    AssetNotFound = 5,
    TreeAtCapacity = 6,
    InvalidKYCExpiry = 7,
    ParticipantNotActive = 8,
    AssetNotActive = 9,
}

/// Participant category for institutional classification
#[derive(Clone, Copy, PartialEq, Eq)]
#[contracttype]
#[repr(u32)]
pub enum ParticipantCategory {
    BrokerDealer = 0,
    AssetManager = 1,
    Bank = 2,
    InsuranceCompany = 3,
    PensionFund = 4,
    HedgeFund = 5,
    SovereignWealth = 6,
    Other = 7,
}

/// RWA Asset type classification
#[derive(Clone, Copy, PartialEq, Eq)]
#[contracttype]
#[repr(u32)]
pub enum AssetType {
    TreasuryBond = 0,
    CorporateBond = 1,
    MunicipalBond = 2,
    Equity = 3,
    RealEstate = 4,
    Commodity = 5,
    Other = 6,
}

/// Whitelisted participant information
#[derive(Clone)]
#[contracttype]
pub struct Participant {
    pub id_hash: BytesN<32>,
    pub trading_address: Address,
    pub category: ParticipantCategory,
    pub kyc_expiry: u64,
    pub is_active: bool,
    pub tree_index: u32,
}

/// Registered RWA asset
#[derive(Clone)]
#[contracttype]
pub struct RWAAsset {
    pub token_address: Address,
    pub symbol: Symbol,
    pub asset_type: AssetType,
    pub min_trade_size: i128,
    pub max_order_size: i128,
    pub is_active: bool,
}

#[contract]
pub struct DarkPoolRegistry;

#[contractimpl]
impl DarkPoolRegistry {
    /// Initialize the registry contract
    ///
    /// # Arguments
    /// * `admin` - Admin address with management privileges
    /// * `verifier_address` - Address of the Groth16 verifier contract
    /// * `eligibility_vk_bytes` - Serialized verification key for eligibility proofs
    pub fn __constructor(
        env: Env,
        admin: Address,
        verifier_address: Address,
        eligibility_vk_bytes: Bytes,
    ) {
        // Store admin
        env.storage().instance().set(&ADMIN_KEY, &admin);

        // Store verifier address
        env.storage().instance().set(&VERIFIER_KEY, &verifier_address);

        // Store eligibility verification key
        env.storage().instance().set(&ELIGIBILITY_VK_KEY, &eligibility_vk_bytes);

        // Initialize empty merkle tree for whitelist
        let tree = LeanIMTBN254::new(&env, WHITELIST_TREE_DEPTH);
        let (leaves, depth, root) = tree.to_storage();
        env.storage().instance().set(&TREE_LEAVES_KEY, &leaves);
        env.storage().instance().set(&TREE_DEPTH_KEY, &depth);
        env.storage().instance().set(&TREE_ROOT_KEY, &root);

        // Initialize empty participants and assets lists
        let participants: Vec<Participant> = vec![&env];
        let assets: Vec<RWAAsset> = vec![&env];
        env.storage().instance().set(&PARTICIPANTS_KEY, &participants);
        env.storage().instance().set(&ASSETS_KEY, &assets);
    }

    /// Register a new participant in the whitelist
    ///
    /// # Arguments
    /// * `admin` - Must be the admin address
    /// * `participant` - Participant details to register
    ///
    /// # Returns
    /// * The tree index where the participant was added
    pub fn register_participant(
        env: Env,
        admin: Address,
        participant: Participant,
    ) -> Result<u32, RegistryError> {
        admin.require_auth();
        Self::require_admin(&env, &admin)?;

        // Check participant doesn't already exist
        let mut participants: Vec<Participant> = env
            .storage()
            .instance()
            .get(&PARTICIPANTS_KEY)
            .unwrap_or(vec![&env]);

        for p in participants.iter() {
            if p.trading_address == participant.trading_address {
                return Err(RegistryError::ParticipantAlreadyExists);
            }
        }

        // Validate KYC expiry is in the future
        let current_time = env.ledger().timestamp();
        if participant.kyc_expiry <= current_time {
            return Err(RegistryError::InvalidKYCExpiry);
        }

        // Add participant's id_hash to the Merkle tree
        let tree_index = Self::add_to_whitelist_tree(&env, participant.id_hash.clone())?;

        // Store participant with tree index
        let mut new_participant = participant.clone();
        new_participant.tree_index = tree_index;
        participants.push_back(new_participant);
        env.storage().instance().set(&PARTICIPANTS_KEY, &participants);

        Ok(tree_index)
    }

    /// Deactivate a participant (soft delete)
    ///
    /// # Arguments
    /// * `admin` - Must be the admin address
    /// * `trading_address` - Address of the participant to deactivate
    pub fn deactivate_participant(
        env: Env,
        admin: Address,
        trading_address: Address,
    ) -> Result<(), RegistryError> {
        admin.require_auth();
        Self::require_admin(&env, &admin)?;

        let participants: Vec<Participant> = env
            .storage()
            .instance()
            .get(&PARTICIPANTS_KEY)
            .unwrap_or(vec![&env]);

        let mut found = false;
        let mut updated_participants: Vec<Participant> = vec![&env];

        for p in participants.iter() {
            if p.trading_address == trading_address {
                let mut updated = p.clone();
                updated.is_active = false;
                updated_participants.push_back(updated);
                found = true;
            } else {
                updated_participants.push_back(p);
            }
        }

        if !found {
            return Err(RegistryError::ParticipantNotFound);
        }

        env.storage().instance().set(&PARTICIPANTS_KEY, &updated_participants);
        Ok(())
    }

    /// Register a new RWA asset
    ///
    /// # Arguments
    /// * `admin` - Must be the admin address
    /// * `asset` - Asset details to register
    pub fn register_asset(
        env: Env,
        admin: Address,
        asset: RWAAsset,
    ) -> Result<(), RegistryError> {
        admin.require_auth();
        Self::require_admin(&env, &admin)?;

        let mut assets: Vec<RWAAsset> = env
            .storage()
            .instance()
            .get(&ASSETS_KEY)
            .unwrap_or(vec![&env]);

        // Check asset doesn't already exist
        for a in assets.iter() {
            if a.token_address == asset.token_address {
                return Err(RegistryError::AssetAlreadyExists);
            }
        }

        assets.push_back(asset);
        env.storage().instance().set(&ASSETS_KEY, &assets);
        Ok(())
    }

    /// Deactivate an RWA asset
    pub fn deactivate_asset(
        env: Env,
        admin: Address,
        token_address: Address,
    ) -> Result<(), RegistryError> {
        admin.require_auth();
        Self::require_admin(&env, &admin)?;

        let assets: Vec<RWAAsset> = env
            .storage()
            .instance()
            .get(&ASSETS_KEY)
            .unwrap_or(vec![&env]);

        let mut found = false;
        let mut updated_assets: Vec<RWAAsset> = vec![&env];

        for a in assets.iter() {
            if a.token_address == token_address {
                let mut updated = a.clone();
                updated.is_active = false;
                updated_assets.push_back(updated);
                found = true;
            } else {
                updated_assets.push_back(a);
            }
        }

        if !found {
            return Err(RegistryError::AssetNotFound);
        }

        env.storage().instance().set(&ASSETS_KEY, &updated_assets);
        Ok(())
    }

    /// Get the current whitelist Merkle root
    pub fn get_whitelist_root(env: Env) -> BytesN<32> {
        env.storage()
            .instance()
            .get(&TREE_ROOT_KEY)
            .unwrap_or(BytesN::from_array(&env, &[0u8; 32]))
    }

    /// Get all registered participants
    pub fn get_participants(env: Env) -> Vec<Participant> {
        env.storage()
            .instance()
            .get(&PARTICIPANTS_KEY)
            .unwrap_or(vec![&env])
    }

    /// Get active participants only
    pub fn get_active_participants(env: Env) -> Vec<Participant> {
        let participants: Vec<Participant> = env
            .storage()
            .instance()
            .get(&PARTICIPANTS_KEY)
            .unwrap_or(vec![&env]);

        let mut active: Vec<Participant> = vec![&env];
        for p in participants.iter() {
            if p.is_active {
                active.push_back(p);
            }
        }
        active
    }

    /// Get a specific participant by trading address
    pub fn get_participant(env: Env, trading_address: Address) -> Option<Participant> {
        let participants: Vec<Participant> = env
            .storage()
            .instance()
            .get(&PARTICIPANTS_KEY)
            .unwrap_or(vec![&env]);

        for p in participants.iter() {
            if p.trading_address == trading_address {
                return Some(p);
            }
        }
        None
    }

    /// Check if a participant is eligible (active and KYC not expired)
    pub fn is_participant_eligible(env: Env, trading_address: Address) -> bool {
        if let Some(participant) = Self::get_participant(env.clone(), trading_address) {
            let current_time = env.ledger().timestamp();
            return participant.is_active && participant.kyc_expiry > current_time;
        }
        false
    }

    /// Get all registered assets
    pub fn get_assets(env: Env) -> Vec<RWAAsset> {
        env.storage()
            .instance()
            .get(&ASSETS_KEY)
            .unwrap_or(vec![&env])
    }

    /// Get active assets only
    pub fn get_active_assets(env: Env) -> Vec<RWAAsset> {
        let assets: Vec<RWAAsset> = env
            .storage()
            .instance()
            .get(&ASSETS_KEY)
            .unwrap_or(vec![&env]);

        let mut active: Vec<RWAAsset> = vec![&env];
        for a in assets.iter() {
            if a.is_active {
                active.push_back(a);
            }
        }
        active
    }

    /// Get a specific asset by token address
    pub fn get_asset(env: Env, token_address: Address) -> Option<RWAAsset> {
        let assets: Vec<RWAAsset> = env
            .storage()
            .instance()
            .get(&ASSETS_KEY)
            .unwrap_or(vec![&env]);

        for a in assets.iter() {
            if a.token_address == token_address {
                return Some(a);
            }
        }
        None
    }

    /// Check if an asset is eligible for trading
    pub fn is_asset_eligible(env: Env, token_address: Address) -> bool {
        if let Some(asset) = Self::get_asset(env, token_address) {
            return asset.is_active;
        }
        false
    }

    /// Get the admin address
    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&ADMIN_KEY).unwrap()
    }

    /// Get the verifier contract address
    pub fn get_verifier(env: Env) -> Address {
        env.storage().instance().get(&VERIFIER_KEY).unwrap()
    }

    /// Get the whitelist tree depth
    pub fn get_whitelist_depth(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&TREE_DEPTH_KEY)
            .unwrap_or(WHITELIST_TREE_DEPTH)
    }

    /// Get the number of participants in the whitelist tree
    pub fn get_whitelist_count(env: Env) -> u32 {
        let leaves: Vec<BytesN<32>> = env
            .storage()
            .instance()
            .get(&TREE_LEAVES_KEY)
            .unwrap_or(vec![&env]);
        leaves.len() as u32
    }

    // Internal helper functions

    /// Verify caller is admin
    fn require_admin(env: &Env, caller: &Address) -> Result<(), RegistryError> {
        let admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        if *caller != admin {
            return Err(RegistryError::OnlyAdmin);
        }
        Ok(())
    }

    /// Add an ID hash to the whitelist Merkle tree
    fn add_to_whitelist_tree(env: &Env, id_hash: BytesN<32>) -> Result<u32, RegistryError> {
        // Load current tree state
        let leaves: Vec<BytesN<32>> = env
            .storage()
            .instance()
            .get(&TREE_LEAVES_KEY)
            .unwrap_or(vec![&env]);
        let depth: u32 = env
            .storage()
            .instance()
            .get(&TREE_DEPTH_KEY)
            .unwrap_or(WHITELIST_TREE_DEPTH);
        let root: BytesN<32> = env
            .storage()
            .instance()
            .get(&TREE_ROOT_KEY)
            .unwrap_or(BytesN::from_array(&env, &[0u8; 32]));

        // Create tree and insert
        let mut tree = LeanIMTBN254::from_storage(env, leaves, depth, root);
        tree.insert(id_hash).map_err(|_| RegistryError::TreeAtCapacity)?;

        // Get the leaf index
        let leaf_index = tree.get_leaf_count() - 1;

        // Store updated tree state
        let (new_leaves, new_depth, new_root) = tree.to_storage();
        env.storage().instance().set(&TREE_LEAVES_KEY, &new_leaves);
        env.storage().instance().set(&TREE_DEPTH_KEY, &new_depth);
        env.storage().instance().set(&TREE_ROOT_KEY, &new_root);

        Ok(leaf_index)
    }
}
