# 🛡️ ShieldAI - AI-Powered Wallet Guardian

**Autonomous AI agent that monitors token approvals in real-time and automatically revokes malicious transactions before they drain your funds.**

🔗 **[Live Demo](https://shieldai-monad.netlify.app)** | 🎥 **[Video Demo](#)** | 📊 **[Architecture](#architecture)**

[![Monad](https://img.shields.io/badge/Monad-Testnet-purple)](https://testnet.monad.xyz) [![MetaMask](https://img.shields.io/badge/MetaMask-Smart_Accounts-orange)](https://metamask.io) [![Envio](https://img.shields.io/badge/Envio-HyperIndex-blue)](https://envio.dev)

> ⚠️ **DISCLAIMER**: This project uses MetaMask Hybrid Smart Accounts on Monad Testnet. Delagetions can't be signed by an EOA, so we use MetaMask Delegation Toolkit to create a smart account with full delegation support. Unfortunately, we can't use EIP-7702 authorization for this demo due to viem not supporting JSON-RPC requests for EIP-7702 authorization.

## 🎯 The Problem

Every year, **$1.7+ billion** is lost to crypto phishing attacks. The most common vector? **Unlimited token approvals** to malicious contracts.

**Current solutions fail because:**
- ❌ Manual revocation tools require constant vigilance
- ❌ Users don't understand approval risks
- ❌ By the time you notice, your funds are gone

## 💡 Our Solution

**ShieldAI** is an autonomous AI agent that protects your wallet 24/7:

1. 🔍 **Monitors** all your token approvals in real-time using Envio HyperIndex
2. 🤖 **Analyzes** contract bytecode with AI to detect malicious patterns
3. ⚡ **Revokes** dangerous approvals automatically via MetaMask Delegations
4. 🛡️ **Protects** you continuously without any manual intervention

### How It Works

```mermaid
User approves tokens → Envio detects instantly → AI analyzes bytecode
    ↓
Threat detected? → Backend redeems delegation → Approval auto-revoked
    ↓
User stays safe! 🎉
```

**Set it up once. Protected forever.**

---

## ✨ Key Features

### 🚀 For Users
- **Zero-Friction Onboarding**: Connect any external wallet (MetaMask, WalletConnect, etc.)
- **One-Click Protection**: Create MetaMask Smart Account in seconds
- **AI-Powered Detection**: GPT-4 analyzes contract bytecode for malicious patterns
- **Auto-Revocation**: Dangerous approvals cancelled instantly via delegations
- **Real-Time Dashboard**: Monitor all approvals with live updates via GraphQL subscriptions
- **Beautiful UI**: Modern, responsive design built with Next.js + TailwindCSS

### 🛠️ Technical Highlights
- **MetaMask Hybrid Smart Accounts**: Full delegation support with browser wallet compatibility
- **Envio Effect API**: Real-time webhooks for instant threat response
- **AI Bytecode Analysis**: Detects transferFrom calls, owner privileges, honeypots, and backdoors
- **Monad Testnet**: Leverages high-performance EVM for sub-second transaction finality
- **ERC-4337 UserOps**: Gasless transactions with Pimlico bundler integration
- **Type-Safe**: End-to-end TypeScript across frontend, backend, and indexer

## 🏗️ Technical Innovation

### Key Technologies

- **MetaMask Smart Accounts**: Hybrid implementation with EOA owner + advanced features
- **MetaMask Delegation Toolkit**: Grants ShieldAI limited revocation powers
- **Envio HyperIndex**: Real-time blockchain event monitoring with Effect API webhooks
- **Monad Testnet**: High-performance EVM for fast threat response
- **AI Detection**: Pattern analysis for identifying malicious contracts
- **Privy**: Seamless external wallet connection

## 🏛️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Monad Testnet                         │
│  • UserRegistry Contract (tracks protected accounts)    │
│  • ERC20 Tokens (USDC, etc.)                            │
│  • User Smart Accounts (MetaMask Hybrid)                │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ↓ (Approval events)
┌──────────────────────────────────────────────────────────┐
│              Envio HyperIndex (hosted)                   │
│  • Real-time blockchain indexing                         │
│  • GraphQL API for frontend queries                      │
│  • Effect API → Webhook on new approvals                 │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ↓ (POST webhook)
┌──────────────────────────────────────────────────────────┐
│              Railway Backend + PostgreSQL                │
│  • Receives approval webhooks                            │
│  • AI threat detection (OpenAI GPT-4)                    │
│  • Bytecode analysis via viem                            │
│  • Stores delegations                                    │
│  • Redeems delegations to revoke threats                 │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ↓ (GraphQL subscriptions)
┌──────────────────────────────────────────────────────────┐
│              Netlify Frontend (Next.js)                  │
│  • Privy authentication                                  │
│  • MetaMask Delegation Toolkit                           │
│  • Real-time dashboard (Apollo Client)                   │
│  • Beautiful UI (TailwindCSS)                            │
└──────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User creates approval** → Smart account calls ERC20.approve()
2. **Envio detects event** → Indexes approval, triggers Effect API webhook
3. **Backend receives webhook** → Fetches bytecode, runs AI analysis
4. **AI analyzes threat** → Checks for malicious patterns (drain functions, backdoors)
5. **If malicious** → Backend redeems delegation, calls approve(spender, 0)
6. **Frontend updates** → GraphQL subscription shows "REVOKED" status in real-time
7. **User protected** → Malicious approval cancelled automatically!

## Project Structure

```
shieldai/
├── contracts/          # Smart contracts (Foundry)
│   ├── src/
│   │   └── UserRegistry.sol
│   └── test/
├── indexer/           # Envio HyperIndex
│   ├── config.yaml
│   ├── schema.graphql
│   └── src/
│       └── EventHandlers.ts
├── backend/           # Node.js API (Railway)
│   ├── src/
│   │   ├── api/
│   │   ├── services/
│   │   └── db/
│   └── package.json
├── frontend/          # Next.js + Privy (Vercel)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
└── README.md
```

## Tech Stack

- **Smart Contracts**: Solidity + Foundry
- **Indexer**: Envio HyperIndex + Effect API
- **Backend**: Node.js + Express + PostgreSQL (Railway)
- **Frontend**: Next.js + Privy + TailwindCSS (Vercel)
- **Blockchain**: Monad Testnet
- **Delegations**: MetaMask Delegation Toolkit (EIP-7702)

## Quick Start

### 1. Deploy Smart Contracts

```bash
cd contracts
forge build
forge script script/Deploy.s.sol --rpc-url $MONAD_RPC_URL --broadcast
```

### 2. Start Indexer (Local Dev)

```bash
cd indexer
pnpm install
pnpm dev
```

### 3. Start Backend

```bash
cd backend
pnpm install
pnpm dev
```

### 4. Start Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

## Environment Variables

Create `.env` files in each directory:

**contracts/.env**
```
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
PRIVATE_KEY=your_deployer_private_key
```

**indexer/.env**
```
ENVIO_API_TOKEN=your_envio_token
BACKEND_WEBHOOK_URL=https://your-backend.railway.app/api/webhook/approval
```

**backend/.env**
```
DATABASE_URL=postgresql://...
SHIELD_AI_PRIVATE_KEY=your_backend_wallet_private_key
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
```

**frontend/.env**
```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend.railway.app
```

## 🌐 Deployment

### Smart Contracts (Monad Testnet)
```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url $MONAD_RPC_URL --broadcast --verify
```

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway)
```bash
cd backend
railway up
```

### Indexer (Envio)
```bash
cd indexer
envio deploy
```

## ✨ Features

### For Users
- 🔐 **Seamless Onboarding**: Connect any external wallet (Privy)
- 🎯 **Smart Account Creation**: One-click MetaMask Hybrid Smart Account
- 📊 **Real-Time Dashboard**: See all your approvals and threats
- ⚡ **Instant Protection**: Auto-revocation happens in milliseconds
- 🎨 **Beautiful UI**: Modern, responsive design with TailwindCSS

### For Developers
- 📡 **Envio Effect API**: Real-time webhooks for blockchain events
- 🔗 **MetaMask Delegations**: Granular permission management
- ⚙️ **Modular Architecture**: Easy to extend and customize
- 🧪 **Full Test Coverage**: Foundry tests for all contracts
- 📝 **TypeScript**: End-to-end type safety

## 🎮 Try It Out - Live Demo

### Quick Start (5 minutes)

1. **Visit** → [https://shieldai-monad.netlify.app](https://shieldai-monad.netlify.app)
2. **Connect Wallet** → MetaMask, WalletConnect, or any external wallet
3. **Onboarding** → 4-step wizard creates your smart account
4. **Create Smart Account** → One-click MetaMask Hybrid account deployment
5. **Grant Delegation** → Sign once to give ShieldAI revoke permissions
6. **Dashboard** → See your real-time approval monitoring
7. **Test Protection** → Click demo buttons to see auto-revocation in action!
   - **Test #1**: Unlimited approval to random EOA → Instant revoke
   - **Test #2**: Limited approval to malicious contract → AI detects + revokes

### What You'll See

- ✅ **Smart account created** with MetaMask Delegation Toolkit
- ✅ **Delegation granted** with granular permissions (approve-only)
- ✅ **Real-time monitoring** via Envio GraphQL subscriptions
- ✅ **AI threat detection** analyzing contract bytecode
- ✅ **Auto-revocation** via delegation redemption
- ✅ **Live dashboard updates** showing approval lifecycle

## 📹 Screenshots

### Landing Page
[Add screenshot]

### Onboarding Flow
[Add screenshot]

### Dashboard
[Add screenshot]

### Threat Detection
[Add screenshot]

## 🔐 MetaMask Smart Accounts - Deep Dive

### Why Hybrid Implementation?

We chose **MetaMask Hybrid Smart Accounts** because it provides the perfect balance of compatibility and advanced features:

#### ✅ Key Benefits
- **Browser Wallet Compatible**: Works with Privy, MetaMask, WalletConnect, any EOA
- **Delegation Support**: Critical for our autonomous revocation feature
- **EOA Owner + Passkeys**: Flexible authentication (EOA now, passkeys later)
- **Production Ready**: Fully functional on Monad testnet today
- **ERC-4337 Compatible**: Gas abstraction via Pimlico bundler
- **No EIP-7702 Required**: Bypasses JSON-RPC authorization limitations

### Implementation

```typescript
// Create smart account with delegation support
const smartAccount = await toMetaMaskSmartAccount({
  client: publicClient,
  implementation: Implementation.Hybrid,
  deployParams: [owner, [], [], []], // EOA owner, no passkeys yet
  deploySalt: '0x',
  signer: { walletClient } // Works with Privy EOAs!
})

// Create delegation for ShieldAI
const delegation = createDelegation({
  from: smartAccount.address,
  to: SHIELDAI_DELEGATE_ADDRESS,
  scope: {
    type: 'functionCall',
    targets: [USDC_TOKEN_ADDRESS], // Can expand to more tokens
    selectors: ['approve(address,uint256)'], // ONLY approve function
  },
  caveats: approveOnlyCaveat, // Granular restrictions
})

// User signs delegation ONCE
const signature = await smartAccount.signDelegation({ delegation })

// ShieldAI can now revoke approvals via delegation redemption
const execution = createExecution({
  delegation: signedDelegation,
  mode: ExecutionMode.Call,
  calls: [{ to: tokenAddress, data: revokeCalldata }]
})
```

### What This Architecture Enables

1. **Autonomous Protection**: ShieldAI acts on user's behalf without additional signatures
2. **Granular Permissions**: Limited to ONLY `approve(address,uint256)` function
3. **User Control**: Users can revoke delegation anytime via registry unregister
4. **Gas Abstraction**: Future support for gasless revocations via paymaster
5. **Scalability**: Can add more tokens to protection list
6. **Composability**: Integrates seamlessly with existing DeFi protocols

### Security Model

- ✅ **Non-Custodial**: User always owns their smart account
- ✅ **Scoped Permissions**: ShieldAI can ONLY call approve(), nothing else
- ✅ **Revocable**: User can unregister and revoke delegation
- ✅ **Transparent**: All actions recorded on-chain
- ✅ **Auditable**: Delegation terms stored and verifiable

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MetaMask browser extension
- Monad testnet MON tokens ([Faucet](https://testnet.monad.xyz))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/shieldai.git
cd shieldai

# Install all dependencies
pnpm install
```

### Running Locally

1. **Start the frontend:**
```bash
cd frontend
pnpm dev
# Visit http://localhost:3000
```

2. **Start the backend:**
```bash
cd backend
pnpm dev
# API runs on http://localhost:3001
```

3. **Start the indexer:**
```bash
cd indexer
pnpm dev
# Indexer syncs Monad events
```

### Configuration

Copy `.env.example` to `.env` in each directory and fill in your values:

- **Frontend**: Privy App ID
- **Backend**: Database URL, RPC URL, Private Key
- **Indexer**: Envio API Token, Webhook URL

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
forge test -vvv
```

### Backend
```bash
cd backend
pnpm test
```

### End-to-End
```bash
cd frontend
pnpm test:e2e
```

## 🎯 Deployed Contracts (Monad Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **UserRegistry** | `0x4E8b57893b8A0Ab1c52E2E1E2A8B60f0E2B4e3b1` | Tracks protected accounts |
| **Malicious Test Contract** | `0x2c641138a924cfbE42e0E6b4eb4E142D3c84ab1A` | Demo contract for AI testing |
| **USDC (Test)** | `0x62534e4bbd6d9ebac0ac99aeaa0aa48e56372df0` | Test ERC20 token |

**Envio Indexer**: [View on Envio Dashboard](#)  
**Backend API**: `https://shieldai-backend.railway.app`  
**Frontend**: `https://shieldai-monad.netlify.app`

---

## 💎 Why This Matters

### The Real-World Impact

**$1.7 billion** lost annually to crypto scams. ShieldAI addresses the **#1 attack vector**: malicious token approvals.

#### Current Pain Points
- 🚨 Users unknowingly approve unlimited token access
- 🚨 Phishing sites trick users into signing dangerous transactions
- 🚨 By the time you realize, funds are already drained
- 🚨 Manual revocation tools require constant monitoring

#### ShieldAI's Solution
- ✅ **Automatic**: No manual monitoring needed
- ✅ **Intelligent**: AI analyzes bytecode for threats
- ✅ **Instant**: Revokes approvals in milliseconds
- ✅ **Trustless**: Non-custodial, user always in control

### Innovation Highlights

#### 1. AI-Powered Threat Detection 🤖
- **GPT-4 bytecode analysis**: Detects malicious patterns humans can't see
- **Function selector detection**: Identifies dangerous `transferFrom` calls
- **Owner privilege analysis**: Spots hidden admin backdoors
- **Honeypot detection**: Recognizes fake functions designed to trap users
- **Risk scoring**: Quantifies threat level (0-100)

#### 2. Novel Use of MetaMask Delegations 🛡️
- **First security application** of delegation framework
- **Granular permissions**: Scoped to ONLY approve() function
- **Revocable trust**: Users maintain full control
- **Gas-efficient**: Single signature enables continuous protection

#### 3. Real-Time Protection via Envio ⚡
- **Effect API webhooks**: Instant notification of new approvals
- **Sub-second response**: Threat detected and revoked in <1s
- **GraphQL subscriptions**: Live dashboard updates
- **Zero latency**: No polling, truly real-time

#### 4. Production-Ready Architecture 🏗️
- **Type-safe**: TypeScript across entire stack
- **Scalable**: Railway backend + PostgreSQL
- **Composable**: Modular, extensible design
- **Tested**: Comprehensive test coverage

---

## 🏆 Technical Achievements

### Hackathon Requirements ✅

- ✅ **MetaMask Smart Accounts**: Hybrid implementation with full delegation support
- ✅ **MetaMask Delegation Toolkit**: Core to our autonomous revocation feature
- ✅ **Monad Testnet**: All contracts deployed, leverages high-performance EVM
- ✅ **Innovative Use Case**: First AI-powered autonomous security agent
- ✅ **Production Quality**: Live demo, clean code, comprehensive docs

### What Makes This Special

1. **Autonomous Agent**: Truly set-and-forget protection
2. **AI Integration**: Not just rules, actual intelligence
3. **Real-Time Everything**: Instant detection, instant revocation
4. **User Experience**: Beautiful UI, zero-friction onboarding
5. **Technical Depth**: Advanced features (ERC-4337, delegations, webhooks)
6. **Practical Value**: Solves a $1.7B/year problem

---

## 🔗 Links & Resources

- 🌐 **Live Demo**: [https://shieldai-monad.netlify.app](https://shieldai-monad.netlify.app)
- 📹 **Video Demo**: [Coming Soon](#)
- 💻 **GitHub**: [https://github.com/officialcmg/shieldai](https://github.com/officialcmg/shieldai)
- 📊 **Envio Indexer**: [View Dashboard](#)
- 🔍 **Contract Verification**: [Monad Explorer](#)

### Tech Stack Links
- [MetaMask Delegation Toolkit](https://github.com/MetaMask/delegation-toolkit)
- [Envio HyperIndex](https://envio.dev)
- [Monad Testnet](https://testnet.monad.xyz)
- [Privy](https://privy.io)

---

## 👨‍💻 Built With

This project showcases innovative use of:
- **MetaMask Smart Accounts** (Hybrid Implementation)
- **MetaMask Delegation Toolkit** (Autonomous Actions)
- **Monad Testnet** (High-Performance EVM)
- **Envio HyperIndex** (Real-Time Indexing + Effect API)
- **OpenAI GPT-4** (AI Bytecode Analysis)
- **Next.js + TailwindCSS** (Beautiful UI/UX)
- **Privy** (Seamless Auth)
- **Railway + PostgreSQL** (Backend Infrastructure)

---

## 📄 License

MIT License - feel free to use this code for your own projects!

---

<div align="center">

**🛡️ ShieldAI - Protecting Web3, One Approval at a Time**

Built for Monad & MetaMask Hackathon 2025

[Try Live Demo](https://shieldai-monad.netlify.app) • [Watch Video](#) • [Read Docs](#)

</div>


