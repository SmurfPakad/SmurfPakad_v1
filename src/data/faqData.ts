export const faqItems = [
  {
    question: "What is Smurfing and how does SmurfPakad detect it?",
    answer: "Smurfing or Layering is a money laundering technique where large sums of illicit funds are broken into hundreds of small transactions through multiple wallets (Fan-Out), then re-aggregated into clean wallets (Fan-In). SmurfPakad uses Graph Neural Networks to identify these suspicious topologies in blockchain transaction graphs."
  },
  {
    question: "What data format does SmurfPakad require?",
    answer: "SmurfPakad accepts transaction edge lists in CSV format with columns: Source_Wallet_ID, Dest_Wallet_ID, Amount, Timestamp, and Token_Type. You can also provide a list of known illicit wallet addresses to improve detection accuracy."
  },
  {
    question: "How accurate is the detection system?",
    answer: "On the Elliptic2 benchmark our Temperature-Gated GATv2 reaches F1 0.564 and PR-AUC 0.604 on held-out data, beating the published GATv2 baseline (0.556 / 0.591). We report F1 and PR-AUC instead of accuracy because only 2.27% of subgraphs are suspicious. On payment ledgers every flagged wallet comes with the red flags that triggered it, so analysts can verify each alert."
  },
  {
    question: "What blockchain networks are supported?",
    answer: "SmurfPakad supports all major blockchain networks including Ethereum, Bitcoin, Binance Smart Chain, Solana, and Polygon. Our graph analysis works on any blockchain with transaction ledger data."
  },
  {
    question: "Can SmurfPakad handle Peeling Chains?",
    answer: "Yes, our advanced algorithms can detect obfuscation techniques like Peeling Chains where small amounts are gradually peeled off during the laundering process. The system accounts for these variations in pattern recognition."
  },
  {
    question: "Is SmurfPakad compliant with AML regulations?",
    answer: "Absolutely. SmurfPakad is designed specifically for RegTech and Crypto-Forensics applications, providing comprehensive reports that meet Anti-Money Laundering (AML) regulatory requirements. Our visualizations and suspicion scoring help regulators and compliance officers make informed decisions."
  }
];
