# RWA Dark Pool

A private trading venue for tokenized real-world assets on Stellar using zero-knowledge proofs. Built with the X-Ray Protocol (Protocol 25) using BN254 curve for Groth16 proof verification.

## Overview

This project enables institutional trading of tokenized assets (bonds, treasuries) with privacy-preserving order matching and settlement. Participants prove their KYC whitelist membership and order validity without revealing trading details.

The system uses Poseidon hashes for order commitments and Merkle tree proofs for whitelist verification. Settlement happens atomically on-chain after ZK proof verification.

## Project Structure

```
rwa-darkpool/
├── contracts/       Soroban smart contracts (verifier, registry, orderbook, settlement)
├── circuits/        Circom ZK circuits for settlement proof
├── prover/          TypeScript library for proof generation
├── matching-engine/ Off-chain order matching engine
├── scripts/         Deployment and testing scripts
└── libs/            Shared Rust libraries
```

## Components

The **contracts** directory contains four Soroban contracts: a generic BN254 Groth16 verifier, a participant and asset registry with Merkle tree whitelist, an orderbook for hidden order commitments, and a settlement contract that verifies ZK proofs and executes atomic swaps.

The **circuits** directory contains Circom circuits that prove valid settlement: both parties are whitelisted, orders match on asset/quantity/price, and commitments are valid. The proof prevents double-settlement via nullifiers.

The **prover** library generates order commitments, builds whitelist Merkle trees, and produces Groth16 proofs compatible with the on-chain verifier.

The **matching-engine** runs off-chain to match buy and sell orders by comparing hidden commitments.

## Testnet Deployment

All contracts are deployed on Stellar testnet. See contracts/README.md for addresses.

## Quick Start

Build contracts:
```bash
stellar contract build
```

Build circuits (requires circom and snarkjs), see circuits/README.md for steps.

Run prover tests:
```bash
cd prover && pnpm install && pnpm test
```

## Requirements

Rust with wasm32 target, Stellar CLI, Node.js, circom, and snarkjs. Building circuits also requires downloading a powers of tau file (1.1 GB), see circuits/README.md.
