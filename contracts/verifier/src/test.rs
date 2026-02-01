#![cfg(test)]

use super::*;
use soroban_sdk::Env;

#[test]
fn test_verifier_contract_deploys() {
    let env = Env::default();
    let contract_id = env.register(Groth16VerifierBN254, ());

    // Contract should deploy successfully
    assert!(!contract_id.to_string().is_empty());
}
