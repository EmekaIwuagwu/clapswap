# 🏆 Clapswap Master Protocol Report

## 🌐 Network: Flare Coston2 Testnet
Clapswap is a premium decentralized exchange and token launchpad built on the Flare Network. It features advanced routing, yield farming, and real-time oracle integrations.

---

## 📍 Core Contract Addresses

| Contract | Address | Purpose |
| :--- | :--- | :--- |
| **Clapswap Factory** | `0xb18398735D57570394678934157D5Bfb2a3e2B37` | Core pool & pair generator |
| **Clapswap Router** | `0xA73CA124552D62c167e1233Fa46680b768f8337A` | Trade execution & liquidity routing |
| **WFLR Wrapper** | `0x59A68F2390Aafde7a3B888FB29d708D696De440c` | Standard ERC20 wrapper for FLR |
| **Clapswap Launchpad** | `0x8d56967BeCAD5c112F3Fda236a6a4B31F1E6031D` | Permissionless token creation factory |
| **MasterChef** | `0xEC3dFdD29ef3C09183D5f1A0Ace9F85AbDE907C9` | Yield farming & reward distribution |
| **CLAP Token** | `0x0A73ABF26e1e8dEE7380B804112f072224add49A` | Native protocol reward token |

---

## 🚀 Feature Set

### 1. Advanced Trading (Swap)
*   **Smart Routing**: Multi-hop engine that automatically scans multiple paths (e.g., `USDC -> FLR -> LEGEND`) to find the best output for the user.
*   **Oracle Integration**: Uses **Flare FTSO** prices to provide real-time USD valuations.
*   **Slippage Protection**: Fully configurable slippage settings for secure trading.

### 2. Yield Farming & Staking
*   **Dual-Incentive Pools**: Users earn both 0.3% trading fees and bonus **CLAP** rewards.
*   **Weighting System**: Rewards are weighted by allocation points (e.g., community tokens like LEGEND get 2x rewards).

### 3. Permissionless Launchpad
*   **Instant Deployment**: Deploy a verified ERC20 token in seconds with custom name, symbol, and supply.
*   **Ecosystem Integration**: Automated "Add Liquidity" prompts to take tokens from launch to live trading in minutes.

### 4. Portfolio Dashboard
*   **Net Worth Tracker**: A unified view of wallet tokens, unstaked LP positions, and staked farm values.
*   **Real-time Profits**: Harvest rewards from all active farms with a single click.

---

## 🛠️ Developer Guide (Contract Verification)

To verify these contracts on the [Coston2 Explorer](https://coston2-explorer.flare.network/), run the following commands in the `contracts` directory:

```bash
# Verify Launchpad
npx hardhat verify --network flare_coston2 0x8d56967BeCAD5c112F3Fda236a6a4B31F1E6031D

# Verify MasterChef
npx hardhat verify --network flare_coston2 0xEC3dFdD29ef3C09183D5f1A0Ace9F85AbDE907C9 0x0A73ABF26e1e8dEE7380B804112f072224add49A 1000000000000000000 <START_BLOCK>

# Verify CLAP Token
npx hardhat verify --network flare_coston2 0x0A73ABF26e1e8dEE7380B804112f072224add49A
```

---

## 💎 Future Vision
*   **Governance (DAO)**: Implement voting for CLAP holders.
*   **Analytics Subgraph**: Detailed historical volume and TVL tracking.
*   **Limit Orders**: On-chain order book functionality via Flare's fast finality.

**Clapswap - The Future of Swap.**
