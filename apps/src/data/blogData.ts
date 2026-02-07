// This file is auto-generated from markdown files in docs/
// Do not edit manually - run 'pnpm run process-blog' to regenerate

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    "id": "introducing-duskpool",
    "title": "Introducing Duskpool: Private RWA Trading on Stellar",
    "excerpt": "A zero-knowledge dark pool for institutional-grade real-world asset trading on the Stellar network.",
    "content": "# Introducing Duskpool\n\nTraditional dark pools solved a real problem: institutional traders needed a way to execute large orders without moving the market against them. But they came with a cost—opacity that bred distrust and, occasionally, abuse.\n\nDuskpool takes the core value proposition of dark pools and rebuilds it with cryptographic guarantees. Every trade is verifiable. Every settlement is atomic. And your order details remain private until execution.\n\n## The Problem with Transparent Markets\n\nWhen you place a large order on a public order book, you signal your intentions to every other participant. Algorithms front-run your trades. Market makers adjust their quotes. By the time your order fills, you've paid an implicit tax to everyone who saw you coming.\n\nFor institutional traders dealing in real-world assets—treasury bills, tokenized real estate, commodity-backed tokens—this information leakage is unacceptable.\n\n## How Duskpool Works\n\nDuskpool uses Protocol 25's zero-knowledge proof capabilities on Stellar to create a trading environment where:\n\n1. **Order Privacy**: Your buy/sell intentions remain hidden until matched\n2. **Atomic Settlement**: Trades execute in a single transaction—no counterparty risk\n3. **Regulatory Compliance**: KYC verification via Merkle tree proofs, without revealing identity on-chain\n\nThe math behind this is elegant. When you place an order, you submit a cryptographic commitment:\n\n$$\nC = \\text{Poseidon}(asset, amount, price, nonce)\n$$\n\nThis commitment reveals nothing about your order. But when two orders match, the ZK-verifier contract can confirm validity without exposing the underlying data.\n\n## Settlement Flow\n\nThe settlement process uses a matching engine that operates on encrypted order data:\n\n```typescript\ninterface EncryptedOrder {\n  commitment: Field;\n  proof: Groth16Proof;\n  timestamp: number;\n}\n\n// Orders are matched based on commitment compatibility\n// without revealing price or quantity\nfunction matchOrders(buy: EncryptedOrder, sell: EncryptedOrder): Match | null {\n  // ZK verification ensures orders are valid and compatible\n  const isValid = verifyMatchProof(buy.proof, sell.proof);\n  if (!isValid) return null;\n\n  return { buyer: buy.commitment, seller: sell.commitment };\n}\n```\n\n## Supported Assets\n\nAt launch, Duskpool supports:\n\n- **US Treasury Bills** (tokenized via regulated issuers)\n- **PAXG** (gold-backed tokens)\n- **Select Commercial Real Estate** tokens\n\nAll assets are issued by partners with proper regulatory frameworks on the Stellar network.\n\n## What's Next\n\nWe're building Duskpool in public. The contracts are audited. The matching engine is live on testnet. And we're onboarding our first institutional partners.\n\nIf you're interested in trading RWAs with privacy guarantees, [connect your wallet](/trade) and explore the terminal.\n\n---\n\n> Duskpool is currently in testnet. All trades are simulated with test assets.",
    "date": "2026-02-06",
    "author": "Duskpool Team",
    "readTime": "6 min read",
    "category": "Protocol",
    "tags": [
      "announcement",
      "stellar",
      "privacy",
      "rwa"
    ]
  },
  {
    "id": "zk-proofs-explained",
    "title": "Zero-Knowledge Proofs in RWA Trading",
    "excerpt": "A technical deep-dive into how Duskpool uses ZK proofs to enable private trading of real-world assets.",
    "content": "# Zero-Knowledge Proofs in RWA Trading\n\nZero-knowledge proofs allow you to prove something is true without revealing *why* it's true. In the context of trading, this means proving your order is valid without revealing its price, quantity, or direction.\n\nThis isn't just a nice-to-have for privacy. It's a fundamental shift in how markets can operate.\n\n## The Core Idea\n\nConsider a simple statement: \"I want to buy 100 treasury bills at $98 each.\"\n\nIn a ZK system, you can prove:\n- You have sufficient collateral locked\n- Your order conforms to protocol rules\n- You're authorized to trade (KYC verified)\n\nAll without revealing the `100`, the `$98`, or even that you're buying rather than selling.\n\n## The Mathematics\n\nDuskpool uses Groth16 proofs over the BN254 curve—the same proving system used by Ethereum's zkSync and Polygon's zkEVM. The proofs are small (128 bytes) and verification is fast enough for on-chain execution.\n\n### Commitment Scheme\n\nOrders are hidden behind Poseidon hash commitments. Poseidon is a ZK-friendly hash function optimized for arithmetic circuits:\n\n$$\nC = \\text{Poseidon}(pk, asset\\_id, amount, price, side, nonce)\n$$\n\nWhere:\n- $pk$ is the trader's public key\n- $asset\\_id$ identifies the token pair\n- $amount$ is the order quantity\n- $price$ is the limit price\n- $side \\in \\{0, 1\\}$ indicates buy or sell\n- $nonce$ prevents replay attacks\n\n### Match Verification\n\nWhen two orders potentially match, the ZK circuit verifies:\n\n$$\n\\text{verify}(C_{buy}, C_{sell}, \\pi) =\n\\begin{cases}\n1 & \\text{if } price_{buy} \\geq price_{sell} \\\\\n0 & \\text{otherwise}\n\\end{cases}\n$$\n\nThe proof $\\pi$ demonstrates the match is valid without revealing the actual prices.\n\n## Circuit Architecture\n\nOur Circom circuits are structured around three main components:\n\n```circom\ntemplate OrderCommitment() {\n    signal input pk;\n    signal input assetId;\n    signal input amount;\n    signal input price;\n    signal input side;  // 0 = buy, 1 = sell\n    signal input nonce;\n\n    signal output commitment;\n\n    // Poseidon hash with 6 inputs\n    component hasher = Poseidon(6);\n    hasher.inputs[0] <== pk;\n    hasher.inputs[1] <== assetId;\n    hasher.inputs[2] <== amount;\n    hasher.inputs[3] <== price;\n    hasher.inputs[4] <== side;\n    hasher.inputs[5] <== nonce;\n\n    commitment <== hasher.out;\n}\n\ntemplate MatchVerifier() {\n    signal input buyCommitment;\n    signal input sellCommitment;\n    signal input buyPrice;\n    signal input sellPrice;\n\n    // Verify price compatibility\n    signal priceDiff;\n    priceDiff <== buyPrice - sellPrice;\n\n    // buyPrice >= sellPrice (difference is non-negative)\n    component isValid = GreaterEqThan(64);\n    isValid.in[0] <== buyPrice;\n    isValid.in[1] <== sellPrice;\n\n    signal output valid;\n    valid <== isValid.out;\n}\n```\n\n## KYC Without Identity Exposure\n\nThe KYC system uses Merkle tree inclusion proofs. Authorized traders are added to a whitelist Merkle tree. To trade, you prove your address is in the tree without revealing which leaf you are:\n\n$$\n\\text{MerkleProof}(leaf, path, root) = 1 \\iff leaf \\in Tree(root)\n$$\n\nThis means the protocol knows you're authorized, but on-chain observers can't link your trades to your KYC identity.\n\n## Gas Costs and Verification\n\nOn Stellar (via Protocol 25), BN254 operations are native:\n\n| Operation | Gas Cost |\n|-----------|----------|\n| Poseidon Hash | ~2,000 |\n| Groth16 Verify | ~200,000 |\n| Full Match Verification | ~250,000 |\n\nThis is significantly cheaper than Ethereum L1 verification, making ZK-verified trading economically viable.\n\n## Security Considerations\n\nThe security of this system relies on:\n\n1. **Discrete Log Hardness**: Breaking BN254 would require solving ECDLP\n2. **Knowledge Soundness**: Groth16 proofs can only be generated with valid witnesses\n3. **Collision Resistance**: Poseidon commitments cannot be forged\n\nThe trusted setup for our circuits was performed with 50+ participants. Even if all but one colluded, the system remains secure.\n\n## Looking Forward\n\nWe're actively exploring:\n\n- **Recursive proofs** for batch settlement (PLONK-based)\n- **Threshold FHE** for encrypted order matching\n- **Cross-chain bridges** with ZK state verification\n\nThe goal is a trading system where privacy is the default, not an afterthought.\n\n---\n\n> For the complete circuit implementations, see our [GitHub repository](https://github.com/duskpool/circuits).",
    "date": "2026-02-05",
    "author": "Duskpool Team",
    "readTime": "10 min read",
    "category": "Technical",
    "tags": [
      "zk-proofs",
      "cryptography",
      "technical",
      "groth16"
    ]
  }
];

export function getBlogPostById(id: string): BlogPost | undefined {
  return blogPosts.find(post => post.id === id);
}

export function searchBlogPosts(query: string): BlogPost[] {
  const lowerQuery = query.toLowerCase();
  return blogPosts.filter(post =>
    post.title.toLowerCase().includes(lowerQuery) ||
    post.content.toLowerCase().includes(lowerQuery) ||
    post.excerpt.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
