#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Bytes, BytesN, Env, Symbol};

fn create_test_participant(env: &Env) -> Participant {
    Participant {
        id_hash: BytesN::from_array(env, &[1u8; 32]),
        trading_address: Address::generate(env),
        category: ParticipantCategory::BrokerDealer,
        kyc_expiry: env.ledger().timestamp() + 31536000, // 1 year from now
        is_active: true,
        tree_index: 0,
    }
}

fn create_test_asset(env: &Env) -> RWAAsset {
    RWAAsset {
        token_address: Address::generate(env),
        symbol: Symbol::new(env, "TBOND25"),
        asset_type: AssetType::TreasuryBond,
        min_trade_size: 1_000_000,
        max_order_size: 100_000_000_000,
        is_active: true,
    }
}

#[test]
fn test_constructor() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let verifier = Address::generate(&env);
    let vk_bytes = Bytes::from_slice(&env, &[0u8; 100]);

    let contract_id = env.register(DarkPoolRegistry, (&admin, &verifier, &vk_bytes));
    let client = DarkPoolRegistryClient::new(&env, &contract_id);

    assert_eq!(client.get_admin(), admin);
    assert_eq!(client.get_verifier(), verifier);
    assert_eq!(client.get_whitelist_count(), 0);
}

#[test]
fn test_register_participant() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let verifier = Address::generate(&env);
    let vk_bytes = Bytes::from_slice(&env, &[0u8; 100]);

    let contract_id = env.register(DarkPoolRegistry, (&admin, &verifier, &vk_bytes));
    let client = DarkPoolRegistryClient::new(&env, &contract_id);

    let participant = create_test_participant(&env);
    let tree_index = client.register_participant(&admin, &participant);

    assert_eq!(tree_index, 0);
    assert_eq!(client.get_whitelist_count(), 1);

    let retrieved = client.get_participant(&participant.trading_address);
    assert!(retrieved.is_some());
    assert_eq!(retrieved.unwrap().trading_address, participant.trading_address);
}

#[test]
fn test_register_asset() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let verifier = Address::generate(&env);
    let vk_bytes = Bytes::from_slice(&env, &[0u8; 100]);

    let contract_id = env.register(DarkPoolRegistry, (&admin, &verifier, &vk_bytes));
    let client = DarkPoolRegistryClient::new(&env, &contract_id);

    let asset = create_test_asset(&env);
    client.register_asset(&admin, &asset);

    let retrieved = client.get_asset(&asset.token_address);
    assert!(retrieved.is_some());
    assert_eq!(retrieved.unwrap().token_address, asset.token_address);
}

#[test]
fn test_deactivate_participant() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let verifier = Address::generate(&env);
    let vk_bytes = Bytes::from_slice(&env, &[0u8; 100]);

    let contract_id = env.register(DarkPoolRegistry, (&admin, &verifier, &vk_bytes));
    let client = DarkPoolRegistryClient::new(&env, &contract_id);

    let participant = create_test_participant(&env);
    client.register_participant(&admin, &participant);

    assert!(client.is_participant_eligible(&participant.trading_address));

    client.deactivate_participant(&admin, &participant.trading_address);

    assert!(!client.is_participant_eligible(&participant.trading_address));
}

#[test]
fn test_whitelist_root_changes() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let verifier = Address::generate(&env);
    let vk_bytes = Bytes::from_slice(&env, &[0u8; 100]);

    let contract_id = env.register(DarkPoolRegistry, (&admin, &verifier, &vk_bytes));
    let client = DarkPoolRegistryClient::new(&env, &contract_id);

    let initial_root = client.get_whitelist_root();

    let participant = create_test_participant(&env);
    client.register_participant(&admin, &participant);

    let new_root = client.get_whitelist_root();
    assert_ne!(initial_root, new_root);
}
