#![no_std]

use soroban_sdk::{
    contracterror, contracttype, Bytes, BytesN, Env, Vec, U256,
};

/// Size of serialized BN254 G1 affine point (32 bytes x + 32 bytes y)
pub const BN254_G1_SERIALIZED_SIZE: usize = 64;

/// Size of serialized BN254 G2 affine point (64 bytes x + 64 bytes y for Fp2)
pub const BN254_G2_SERIALIZED_SIZE: usize = 128;

/// Size of BN254 scalar field element (Fr)
pub const BN254_FR_SIZE: usize = 32;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ZkError {
    MalformedVerificationKey = 1,
    MalformedProof = 2,
    MalformedPublicSignals = 3,
    InvalidInputLength = 4,
}

/// BN254 Groth16 Verification Key
/// 
/// The verification key contains curve points used to verify proofs:
/// - alpha: G1 point from trusted setup
/// - beta, gamma, delta: G2 points from trusted setup  
/// - ic: G1 points for public input linear combination
#[derive(Clone)]
#[contracttype]
pub struct VerificationKeyBN254 {
    pub alpha: BytesN<64>,      // G1 affine point (x, y) each 32 bytes
    pub beta: BytesN<128>,      // G2 affine point (x.c0, x.c1, y.c0, y.c1) each 32 bytes
    pub gamma: BytesN<128>,     // G2 affine point
    pub delta: BytesN<128>,     // G2 affine point
    pub ic: Vec<BytesN<64>>,    // G1 affine points for public inputs
}

impl VerificationKeyBN254 {
    /// Serialize verification key to bytes
    pub fn to_bytes(&self, env: &Env) -> Bytes {
        let mut bytes = Bytes::new(env);
        bytes.append(&Bytes::from_slice(env, self.alpha.to_array().as_slice()));
        bytes.append(&Bytes::from_slice(env, self.beta.to_array().as_slice()));
        bytes.append(&Bytes::from_slice(env, self.gamma.to_array().as_slice()));
        bytes.append(&Bytes::from_slice(env, self.delta.to_array().as_slice()));
        // Serialize ic length as u32 (big endian)
        let ic_len = self.ic.len() as u32;
        let ic_len_bytes = ic_len.to_be_bytes();
        bytes.append(&Bytes::from_slice(env, &ic_len_bytes));
        for g1 in self.ic.iter() {
            bytes.append(&Bytes::from_slice(env, g1.to_array().as_slice()));
        }
        bytes
    }

    /// Deserialize verification key from bytes
    pub fn from_bytes(env: &Env, bytes: &Bytes) -> Result<Self, ZkError> {
        let mut pos = 0usize;
        
        fn take<const N: usize>(bytes: &Bytes, pos: &mut usize) -> Result<[u8; N], ZkError> {
            if *pos + N > bytes.len() as usize {
                return Err(ZkError::InvalidInputLength);
            }
            let start = *pos as u32;
            let end = (*pos + N) as u32;
            let mut arr = [0u8; N];
            bytes.slice(start..end).copy_into_slice(&mut arr);
            *pos += N;
            Ok(arr)
        }

        let alpha = BytesN::from_array(env, &take::<64>(bytes, &mut pos)?);
        let beta = BytesN::from_array(env, &take::<128>(bytes, &mut pos)?);
        let gamma = BytesN::from_array(env, &take::<128>(bytes, &mut pos)?);
        let delta = BytesN::from_array(env, &take::<128>(bytes, &mut pos)?);
        
        let ic_len_bytes = take::<4>(bytes, &mut pos)?;
        let ic_len = u32::from_be_bytes(ic_len_bytes) as usize;
        let mut ic = Vec::new(env);
        for _ in 0..ic_len {
            let g1 = BytesN::from_array(env, &take::<64>(bytes, &mut pos)?);
            ic.push_back(g1);
        }
        
        Ok(VerificationKeyBN254 {
            alpha,
            beta,
            gamma,
            delta,
            ic,
        })
    }
}

/// BN254 Groth16 Proof
/// 
/// The proof contains three curve points:
/// - a: G1 point
/// - b: G2 point
/// - c: G1 point
#[derive(Clone)]
#[contracttype]
pub struct ProofBN254 {
    pub a: BytesN<64>,      // G1 affine point
    pub b: BytesN<128>,     // G2 affine point
    pub c: BytesN<64>,      // G1 affine point
}

impl ProofBN254 {
    /// Serialize proof to bytes
    pub fn to_bytes(&self, env: &Env) -> Bytes {
        let mut bytes = Bytes::new(env);
        bytes.append(&Bytes::from_slice(env, self.a.to_array().as_slice()));
        bytes.append(&Bytes::from_slice(env, self.b.to_array().as_slice()));
        bytes.append(&Bytes::from_slice(env, self.c.to_array().as_slice()));
        bytes
    }

    /// Deserialize proof from bytes
    pub fn from_bytes(env: &Env, bytes: &Bytes) -> Result<Self, ZkError> {
        let mut pos = 0usize;
        
        fn take<const N: usize>(bytes: &Bytes, pos: &mut usize) -> Result<[u8; N], ZkError> {
            if *pos + N > bytes.len() as usize {
                return Err(ZkError::MalformedProof);
            }
            let start = *pos as u32;
            let end = (*pos + N) as u32;
            let mut arr = [0u8; N];
            bytes.slice(start..end).copy_into_slice(&mut arr);
            *pos += N;
            Ok(arr)
        }

        let a = BytesN::from_array(env, &take::<64>(bytes, &mut pos)?);
        let b = BytesN::from_array(env, &take::<128>(bytes, &mut pos)?);
        let c = BytesN::from_array(env, &take::<64>(bytes, &mut pos)?);
        
        Ok(ProofBN254 { a, b, c })
    }
}

/// Public signals for ZK proof verification
/// 
/// Wraps a vector of scalar field elements (Fr)
#[derive(Clone)]
#[contracttype]
pub struct PublicSignalsBN254 {
    pub signals: Vec<BytesN<32>>,  // Each signal is a 32-byte scalar
}

impl PublicSignalsBN254 {
    /// Create new public signals from a vector of 32-byte scalars
    pub fn new(signals: Vec<BytesN<32>>) -> Self {
        Self { signals }
    }

    /// Serialize public signals to bytes
    pub fn to_bytes(&self, env: &Env) -> Bytes {
        let mut bytes = Bytes::new(env);
        let len = self.signals.len() as u32;
        let len_bytes = len.to_be_bytes();
        bytes.append(&Bytes::from_slice(env, &len_bytes));
        for signal in self.signals.iter() {
            bytes.append(&Bytes::from_slice(env, signal.to_array().as_slice()));
        }
        bytes
    }

    /// Deserialize public signals from bytes
    pub fn from_bytes(env: &Env, bytes: &Bytes) -> Result<Self, ZkError> {
        let mut pos = 0usize;
        
        fn take<const N: usize>(bytes: &Bytes, pos: &mut usize) -> Result<[u8; N], ZkError> {
            if *pos + N > bytes.len() as usize {
                return Err(ZkError::MalformedPublicSignals);
            }
            let start = *pos as u32;
            let end = (*pos + N) as u32;
            let mut arr = [0u8; N];
            bytes.slice(start..end).copy_into_slice(&mut arr);
            *pos += N;
            Ok(arr)
        }

        let len_bytes = take::<4>(bytes, &mut pos)?;
        let len = u32::from_be_bytes(len_bytes) as usize;
        let mut signals = Vec::new(env);
        for _ in 0..len {
            let signal = BytesN::from_array(env, &take::<32>(bytes, &mut pos)?);
            signals.push_back(signal);
        }
        
        Ok(PublicSignalsBN254 { signals })
    }

    /// Get the number of public signals
    pub fn len(&self) -> u32 {
        self.signals.len()
    }

    /// Check if empty
    pub fn is_empty(&self) -> bool {
        self.signals.is_empty()
    }

    /// Get a signal by index
    pub fn get(&self, index: u32) -> Option<BytesN<32>> {
        self.signals.get(index)
    }
}

/// Convert U256 to BytesN<32> in big-endian format
pub fn u256_to_bytes32(env: &Env, value: &U256) -> BytesN<32> {
    let bytes = value.to_be_bytes();
    let mut arr = [0u8; 32];
    bytes.copy_into_slice(&mut arr);
    BytesN::from_array(env, &arr)
}

/// Convert BytesN<32> to U256 (big-endian)
pub fn bytes32_to_u256(env: &Env, bytes: &BytesN<32>) -> U256 {
    U256::from_be_bytes(env, &Bytes::from_slice(env, bytes.to_array().as_slice()))
}

/// Helper to create a zero scalar
pub fn zero_scalar(env: &Env) -> BytesN<32> {
    BytesN::from_array(env, &[0u8; 32])
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_public_signals_roundtrip() {
        let env = Env::default();
        
        let mut signals = Vec::new(&env);
        signals.push_back(BytesN::from_array(&env, &[1u8; 32]));
        signals.push_back(BytesN::from_array(&env, &[2u8; 32]));
        
        let pub_signals = PublicSignalsBN254::new(signals);
        let bytes = pub_signals.to_bytes(&env);
        let decoded = PublicSignalsBN254::from_bytes(&env, &bytes).unwrap();
        
        assert_eq!(decoded.len(), 2);
    }

    #[test]
    fn test_proof_roundtrip() {
        let env = Env::default();
        
        let proof = ProofBN254 {
            a: BytesN::from_array(&env, &[1u8; 64]),
            b: BytesN::from_array(&env, &[2u8; 128]),
            c: BytesN::from_array(&env, &[3u8; 64]),
        };
        
        let bytes = proof.to_bytes(&env);
        let decoded = ProofBN254::from_bytes(&env, &bytes).unwrap();
        
        assert_eq!(decoded.a, proof.a);
        assert_eq!(decoded.b, proof.b);
        assert_eq!(decoded.c, proof.c);
    }
}
