---
title: Showcase - Dự án nổi bật trên Sui
description: Khám phá các dự án và ứng dụng xuất sắc được xây dựng trên Sui blockchain
---

# Showcase - Dự án nổi bật trên Sui

Khám phá những dự án đột phá và ứng dụng sáng tạo được xây dựng trên Sui blockchain, từ DeFi, Gaming đến NFTs và Infrastructure.

## 🏦 DeFi Protocols

### Cetus Protocol
**Automated Market Maker & Concentrated Liquidity**

- **Website**: [cetus.zone](https://cetus.zone)
- **Đặc điểm**: 
  - Concentrated liquidity như Uniswap V3
  - Multi-pool routing
  - Yield farming opportunities
  - Low slippage trading

```move
// Example: Swap trên Cetus
public fun swap_exact_input<CoinA, CoinB>(
    pool: &mut Pool<CoinA, CoinB>,
    coin_a: Coin<CoinA>,
    min_amount_out: u64,
    ctx: &mut TxContext
): Coin<CoinB> {
    // Cetus swap logic
}
```

### Turbos Finance
**Next-gen DEX với Advanced Features**

- **Website**: [turbos.finance](https://turbos.finance)
- **Đặc điểm**:
  - Advanced order types
  - Portfolio management
  - Cross-chain bridges
  - Institutional features

### Kriya DEX
**Community-driven DEX**

- **Website**: [kriya.finance](https://kriya.finance)
- **Đặc điểm**:
  - Community governance
  - Innovative tokenomics
  - Multi-asset pools
  - Sustainable yields

## 🎮 Gaming & Metaverse

### Sui 8192
**On-chain Puzzle Game**

- **Website**: [sui8192.ethoswallet.xyz](https://sui8192.ethoswallet.xyz)
- **Đặc điểm**:
  - Fully on-chain game state
  - NFT rewards
  - Leaderboard system
  - Provably fair gameplay

```move
// Game logic example
public struct Game has key {
    id: UID,
    board: vector<vector<u64>>,
    score: u64,
    game_over: bool,
}

public fun make_move(
    game: &mut Game,
    direction: u8,
    ctx: &mut TxContext
) {
    // Game move logic
}
```

### Cosmocadia
**Space Strategy MMO**

- **Website**: [cosmocadia.com](https://cosmocadia.com)
- **Đặc điểm**:
  - Persistent universe
  - Player-owned assets
  - Complex economy
  - Guild systems

### Panzerdogs
**Tank Battle Royale**

- **Đặc điểm**:
  - Real-time multiplayer
  - NFT tanks and weapons
  - Tournament system
  - Play-to-earn mechanics

## 🎨 NFTs & Digital Art

### Clutchy
**NFT Marketplace**

- **Website**: [clutchy.io](https://clutchy.io)
- **Đặc điểm**:
  - User-friendly interface
  - Creator royalties
  - Bulk operations
  - Advanced filtering

### Keepsake
**Social NFT Platform**

- **Website**: [keepsake.gg](https://keepsake.gg)
- **Đặc điểm**:
  - Social features
  - NFT discovery
  - Creator tools
  - Community building

### SuiFrens
**Official Sui NFT Collection**

- **Đặc điểm**:
  - Dynamic NFTs
  - Utility in ecosystem
  - Community perks
  - Regular updates

```move
// Dynamic NFT example
public struct SuiFren has key, store {
    id: UID,
    name: String,
    image_url: String,
    attributes: VecMap<String, String>,
    generation: u64,
}

public fun evolve_fren(
    fren: &mut SuiFren,
    evolution_item: EvolutionItem
) {
    // Evolution logic
}
```

## 🛠️ Infrastructure & Tools

### Mysten Labs
**Core Infrastructure**

- **Sui Blockchain**: Layer-1 blockchain
- **Walrus Storage**: Decentralized storage
- **Move Language**: Smart contract language
- **Developer Tools**: SDKs, CLI, docs

### Suiet Wallet
**Community Wallet**

- **Website**: [suiet.app](https://suiet.app)
- **Đặc điểm**:
  - Browser extension
  - Mobile app
  - dApp connector
  - Multi-account support

### Sui Explorer
**Blockchain Explorer**

- **Website**: [suiexplorer.com](https://suiexplorer.com)
- **Đặc điểm**:
  - Transaction tracking
  - Object explorer
  - Validator info
  - Network statistics

## 📊 Analytics & Data

### SuiVision
**Analytics Platform**

- **Website**: [suivision.xyz](https://suivision.xyz)
- **Đặc điểm**:
  - Network metrics
  - DeFi analytics
  - Portfolio tracking
  - Market data

### DeepBook
**Central Limit Order Book**

- **Đặc điểm**:
  - Professional trading
  - Deep liquidity
  - Advanced orders
  - API access

## 🌐 Walrus Sites Examples

### Personal Portfolios
```bash
# Deploy personal website
walrus-sites publish ./portfolio

# Result: https://blobid.walrus.site
```

### Documentation Sites
- **Decentralized docs**: Host documentation on Walrus
- **Version control**: Update content via transactions
- **Censorship resistant**: Cannot be taken down

### Art Galleries
- **NFT showcases**: Display collections
- **Interactive experiences**: Rich media support
- **Creator profiles**: Artist portfolios

## 🚀 Emerging Projects

### SuiNS
**Sui Name Service**

- **Đặc điểm**:
  - Human-readable addresses
  - Decentralized domains
  - Profile management
  - Cross-platform support

### Bucket Protocol
**Decentralized Stablecoin**

- **Đặc điểm**:
  - Over-collateralized stablecoin
  - Liquidation mechanisms
  - Governance token
  - Yield generation

### Aftermath Finance
**Liquidity Infrastructure**

- **Đặc điểm**:
  - Automated strategies
  - Yield optimization
  - Risk management
  - Institutional grade

## 📱 Mobile Applications

### Sui Wallet Mobile
- **iOS & Android apps**
- **Biometric security**
- **QR code scanning**
- **Push notifications**

### Ethos Wallet
- **Mobile-first design**
- **Social recovery**
- **Multi-chain support**
- **DeFi integration**

## 🎯 Developer Tools Showcase

### Move Analyzer
**VS Code Extension**

```json
{
  "name": "move-analyzer",
  "features": [
    "Syntax highlighting",
    "Error checking",
    "Auto-completion",
    "Go to definition"
  ]
}
```

### Sui DevNet Faucet
**Developer Testing**

```bash
# Request test tokens
sui client faucet

# Check balance
sui client balance
```

### Move Prover
**Formal Verification**

```move
spec module my_module {
    spec transfer_coin {
        ensures old(coin.value) == result.value;
        ensures coin.owner != result.owner;
    }
}
```

## 🏆 Success Metrics

### Network Growth
- **Total Value Locked**: $500M+
- **Daily Transactions**: 1M+
- **Active Developers**: 1000+
- **dApps Deployed**: 500+

### Performance Benchmarks
- **Transaction Finality**: ~1 second
- **Gas Costs**: <$0.01 per transaction
- **Throughput**: 100k+ TPS potential
- **Uptime**: 99.9%+

## 🎨 Design Inspiration

### UI/UX Patterns
```css
/* Sui-inspired design system */
:root {
  --sui-blue: #4da2ff;
  --sui-dark: #1a1a1a;
  --sui-light: #f8f9fa;
  --gradient: linear-gradient(135deg, #4da2ff, #00c9ff);
}

.sui-card {
  background: var(--gradient);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(77, 162, 255, 0.2);
}
```

### Component Libraries
- **Sui Design System**: Official components
- **Community Themes**: Open-source designs
- **Mobile Patterns**: Touch-friendly interfaces
- **Accessibility**: WCAG compliant

## 🔮 Future Showcases

### Upcoming Categories
- **AI/ML Applications**: On-chain AI models
- **IoT Integration**: Device connectivity
- **Supply Chain**: Traceability solutions
- **Healthcare**: Medical records
- **Education**: Credential verification

### Innovation Areas
- **Zero-Knowledge**: Privacy applications
- **Cross-Chain**: Multi-blockchain dApps
- **Real-World Assets**: Tokenization
- **Governance**: DAO tooling

## 🤝 Community Contributions

### Open Source Projects
- **Sui Move Analyzer**: Community-driven
- **Documentation**: Translated guides
- **Educational Content**: Tutorials, videos
- **Developer Tools**: Community libraries

### Hackathon Winners
- **Sui Overflow**: Quarterly hackathons
- **Prize Categories**: DeFi, Gaming, Infrastructure
- **Winning Projects**: Featured implementations
- **Community Voting**: Popular choice awards

## 📚 Learning Resources

### Case Studies
- **Technical deep dives** into successful projects
- **Architecture decisions** and trade-offs
- **Performance optimizations** and lessons learned
- **User adoption** strategies and growth hacking

### Code Examples
```typescript
// React hook for NFT marketplace
function useNFTMarketplace() {
  const { data: listings } = useSuiClientQuery(
    'getOwnedObjects',
    { owner: MARKETPLACE_ADDRESS }
  );

  const listNFT = useCallback(async (nft, price) => {
    // Listing logic
  }, []);

  return { listings, listNFT };
}
```

Sui ecosystem đang phát triển mạnh mẽ với nhiều dự án sáng tạo và đột phá. Tham gia cộng đồng để khám phá và đóng góp vào tương lai của Web3! 🌟 