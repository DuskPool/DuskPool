#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, vec,
    crypto::bn254::{Fr, Bn254G1Affine, Bn254G2Affine},
    Bytes, BytesN, Env, Vec,
};

// Type aliases for cleaner code
type G1Affine = Bn254G1Affine;
type G2Affine = Bn254G2Affine;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VerifierError {
    MalformedVerificationKey = 1,
    MalformedProof = 2,
    InvalidPublicSignals = 3,
    PairingCheckFailed = 4,
}

/// BN254 G1 Affine point size (64 bytes: 32 for x, 32 for y)
pub const G1_SIZE: usize = 64;
/// BN254 G2 Affine point size (128 bytes: 64 for x (Fp2), 64 for y (Fp2))
pub const G2_SIZE: usize = 128;
/// BN254 Fr scalar size
pub const FR_SIZE: usize = 32;

/// Groth16 Verification Key for BN254 curve
#[derive(Clone)]
#[contracttype]
pub struct VerificationKey {
    pub alpha: G1Affine,
    pub beta: G2Affine,
    pub gamma: G2Affine,
    pub delta: G2Affine,
    pub ic: Vec<G1Affine>,
}

/// Groth16 Proof for BN254 curve
#[derive(Clone)]
#[contracttype]
pub struct Proof {
    pub a: G1Affine,
    pub b: G2Affine,
    pub c: G1Affine,
}

#[contract]
pub struct Groth16VerifierBN254;

#[contractimpl]
impl Groth16VerifierBN254 {
    /// Verifies a Groth16 proof using BN254 curve
    ///
    /// # Arguments
    /// * `vk` - The verification key
    /// * `proof` - The Groth16 proof (A, B, C points)
    /// * `pub_signals` - Public input signals as Fr scalars
    ///
    /// # Returns
    /// * `true` if the proof is valid, `false` otherwise
    pub fn verify_proof(
        env: Env,
        vk: VerificationKey,
        proof: Proof,
        pub_signals: Vec<Fr>,
    ) -> Result<bool, VerifierError> {
        let bn254 = env.crypto().bn254();

        // Verify IC length matches public signals + 1
        if pub_signals.len() + 1 != vk.ic.len() {
            return Err(VerifierError::MalformedVerificationKey);
        }

        // Compute vk_x = ic[0] + sum(pub_signals[i] * ic[i+1])
        let mut vk_x = vk.ic.get(0).unwrap();
        for (s, v) in pub_signals.iter().zip(vk.ic.iter().skip(1)) {
            let prod = bn254.g1_mul(&v, &s);
            vk_x = bn254.g1_add(&vk_x, &prod);
        }

        // Pairing check: e(-A, B) * e(alpha, beta) * e(vk_x, gamma) * e(C, delta) == 1
        let neg_a = -proof.a;
        let g1_points = vec![&env, neg_a, vk.alpha, vk_x, proof.c];
        let g2_points = vec![&env, proof.b, vk.beta, vk.gamma, vk.delta];

        Ok(bn254.pairing_check(g1_points, g2_points))
    }

    /// Verifies a proof from serialized bytes
    ///
    /// # Arguments
    /// * `vk_bytes` - Serialized verification key
    /// * `proof_bytes` - Serialized proof
    /// * `pub_signals_bytes` - Serialized public signals
    pub fn verify_proof_bytes(
        env: Env,
        vk_bytes: Bytes,
        proof_bytes: Bytes,
        pub_signals_bytes: Bytes,
    ) -> Result<bool, VerifierError> {
        let vk = Self::parse_verification_key(&env, &vk_bytes)?;
        let proof = Self::parse_proof(&env, &proof_bytes)?;
        let pub_signals = Self::parse_public_signals(&env, &pub_signals_bytes)?;

        Self::verify_proof(env, vk, proof, pub_signals)
    }

    /// Parse verification key from bytes
    fn parse_verification_key(env: &Env, bytes: &Bytes) -> Result<VerificationKey, VerifierError> {
        let mut pos = 0usize;

        fn take_g1(env: &Env, bytes: &Bytes, pos: &mut usize) -> Result<G1Affine, VerifierError> {
            if *pos + G1_SIZE > bytes.len() as usize {
                return Err(VerifierError::MalformedVerificationKey);
            }
            let start = *pos as u32;
            let end = (*pos + G1_SIZE) as u32;
            let mut arr = [0u8; G1_SIZE];
            bytes.slice(start..end).copy_into_slice(&mut arr);
            *pos += G1_SIZE;
            Ok(G1Affine::from_array(env, &arr))
        }

        fn take_g2(env: &Env, bytes: &Bytes, pos: &mut usize) -> Result<G2Affine, VerifierError> {
            if *pos + G2_SIZE > bytes.len() as usize {
                return Err(VerifierError::MalformedVerificationKey);
            }
            let start = *pos as u32;
            let end = (*pos + G2_SIZE) as u32;
            let mut arr = [0u8; G2_SIZE];
            bytes.slice(start..end).copy_into_slice(&mut arr);
            *pos += G2_SIZE;
            Ok(G2Affine::from_array(env, &arr))
        }

        let alpha = take_g1(env, bytes, &mut pos)?;
        let beta = take_g2(env, bytes, &mut pos)?;
        let gamma = take_g2(env, bytes, &mut pos)?;
        let delta = take_g2(env, bytes, &mut pos)?;

        // Read IC length
        if pos + 4 > bytes.len() as usize {
            return Err(VerifierError::MalformedVerificationKey);
        }
        let mut ic_len_bytes = [0u8; 4];
        bytes.slice(pos as u32..(pos + 4) as u32).copy_into_slice(&mut ic_len_bytes);
        pos += 4;
        let ic_len = u32::from_be_bytes(ic_len_bytes) as usize;

        let mut ic = Vec::new(env);
        for _ in 0..ic_len {
            let g1 = take_g1(env, bytes, &mut pos)?;
            ic.push_back(g1);
        }

        Ok(VerificationKey {
            alpha,
            beta,
            gamma,
            delta,
            ic,
        })
    }

    /// Parse proof from bytes
    fn parse_proof(env: &Env, bytes: &Bytes) -> Result<Proof, VerifierError> {
        if bytes.len() as usize != G1_SIZE + G2_SIZE + G1_SIZE {
            return Err(VerifierError::MalformedProof);
        }

        let mut pos = 0usize;

        let mut a_arr = [0u8; G1_SIZE];
        bytes.slice(pos as u32..(pos + G1_SIZE) as u32).copy_into_slice(&mut a_arr);
        pos += G1_SIZE;
        let a = G1Affine::from_array(env, &a_arr);

        let mut b_arr = [0u8; G2_SIZE];
        bytes.slice(pos as u32..(pos + G2_SIZE) as u32).copy_into_slice(&mut b_arr);
        pos += G2_SIZE;
        let b = G2Affine::from_array(env, &b_arr);

        let mut c_arr = [0u8; G1_SIZE];
        bytes.slice(pos as u32..(pos + G1_SIZE) as u32).copy_into_slice(&mut c_arr);
        let c = G1Affine::from_array(env, &c_arr);

        Ok(Proof { a, b, c })
    }

    /// Parse public signals from bytes
    fn parse_public_signals(env: &Env, bytes: &Bytes) -> Result<Vec<Fr>, VerifierError> {
        let mut pos = 0usize;

        // Read length
        if bytes.len() < 4 {
            return Err(VerifierError::InvalidPublicSignals);
        }
        let mut len_bytes = [0u8; 4];
        bytes.slice(0..4).copy_into_slice(&mut len_bytes);
        pos += 4;
        let len = u32::from_be_bytes(len_bytes) as usize;

        let mut signals = Vec::new(env);
        for _ in 0..len {
            if pos + FR_SIZE > bytes.len() as usize {
                return Err(VerifierError::InvalidPublicSignals);
            }
            let mut fr_arr = [0u8; FR_SIZE];
            bytes.slice(pos as u32..(pos + FR_SIZE) as u32).copy_into_slice(&mut fr_arr);
            pos += FR_SIZE;

            let fr_bytes = BytesN::from_array(env, &fr_arr);
            let fr = Fr::from_bytes(fr_bytes);
            signals.push_back(fr);
        }

        Ok(signals)
    }
}

#[cfg(test)]
mod test;
