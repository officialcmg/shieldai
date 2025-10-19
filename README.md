# 🛡️ ShieldAI - AI-Powered Wallet Guardian

**Your 24/7 AI security agent that monitors token approvals and automatically revokes malicious transactions before they drain your funds.**

Built for the Monad & MetaMask Hackathon | [Demo Video](#) | [Live App](#)

## 🎯 The Problem

Every year, **$1.7+ billion** is lost to crypto phishing attacks. The most common vector? **Unlimited token approvals** to malicious contracts.

**Current solutions fail because:**
- ❌ Manual revocation tools require constant vigilance
- ❌ Users don't understand approval risks
- ❌ By the time you notice, your funds are gone

## 💡 Our Solution

**ShieldAI** is an autonomous AI agent that:
1. ✅ **Monitors** all your token approvals in real-time
2. ✅ **Detects** threats using AI-powered pattern analysis
3. ✅ **Revokes** malicious approvals automatically
4. ✅ **Protects** you 24/7 without any action needed

### How It Works

```
User approves token → Envio catches it instantly → AI analyzes threat level
    → If dangerous: Auto-revoke via EIP-7702 delegation → User stays safe!
```

## 🏗️ Technical Innovation

### Key Technologies

- **MetaMask Smart Accounts**: Hybrid implementation with EOA owner + advanced features
- **MetaMask Delegation Toolkit**: Grants ShieldAI limited revocation powers
- **Envio HyperIndex**: Real-time blockchain event monitoring with Effect API webhooks
- **Monad Testnet**: High-performance EVM for fast threat response
- **AI Detection**: Pattern analysis for identifying malicious contracts
- **Privy**: Seamless wallet onboarding (email/social/wallet)

## Architecture

```
┌─────────────────┐
│ Monad Testnet   │
│  UserRegistry   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Envio Indexer   │
│  Effect API →   │
└────────┬────────┘
         │ (webhook)
         ↓
┌─────────────────┐
│ Railway Backend │
│  + PostgreSQL   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Frontend        │
│  (Vercel)       │
└─────────────────┘
```

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
- 🔐 **Seamless Onboarding**: Login with email, social, or wallet (Privy)
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

## 🎮 Demo Flow

1. **Sign Up** → Email/Wallet/Social login via Privy
2. **Onboarding** → Beautiful 4-step wizard explains everything
3. **Create Smart Account** → One-click MetaMask Hybrid Smart Account creation
4. **Grant Protection** → One signature gives ShieldAI revoke permissions
5. **Dashboard** → Monitor all your approvals in real-time
6. **Test Threat** → Create a mock unlimited approval
7. **Watch Magic** → Approval auto-revoked within seconds!
8. **Stay Safe** → 24/7 monitoring continues automatically

## 📹 Screenshots

### Landing Page
[Add screenshot]

### Onboarding Flow
[Add screenshot]

### Dashboard
[Add screenshot]

### Threat Detection
[Add screenshot]

## 🔐 MetaMask Smart Accounts Implementation

**We use MetaMask Hybrid Smart Accounts** for this project, which provides:

### Why Hybrid?
- ✅ **Works with browser wallets** (Privy, MetaMask, any wallet)
- ✅ **EOA owner** + optional passkey signers
- ✅ **Supports delegations** (critical for our auto-revoke feature)
- ✅ **No EIP-7702 authorization needed** (bypasses JSON-RPC limitation)
- ✅ **Production-ready** on Monad testnet right now

### Implementation Details
```typescript
const smartAccount = await toMetaMaskSmartAccount({
  client: publicClient,
  implementation: Implementation.Hybrid,
  deployParams: [owner, [], [], []],
  deploySalt: '0x',
  signer: { walletClient } // Works with Privy!
})
```

### What This Enables
- **Delegations**: ShieldAI can revoke approvals on your behalf
- **Gas abstraction**: Future support for gasless transactions
- **Advanced security**: Programmable account logic
- **Passkey support**: Optional WebAuthn signers

This approach fully meets the hackathon requirements for using MetaMask Smart Accounts!

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

## 🏆 Why ShieldAI Wins

### Innovation
- **First** AI-powered autonomous protection agent for Web3
- **Novel** use of EIP-7702 delegations for security
- **Real-time** threat detection with Envio Effect API webhooks

### Technical Excellence
- Clean, modular architecture
- Full TypeScript type safety
- Comprehensive error handling
- Beautiful, accessible UI
- Production-ready code

### User Experience
- Zero friction onboarding
- Set-and-forget protection
- Real-time visual feedback
- Mobile responsive
- Intuitive dashboard

### Monad Integration
- Native deployment on Monad testnet
- Leverages high-performance EVM
- Optimized for fast threat response
- Future-ready for Monad mainnet

### MetaMask Innovation
- MetaMask Hybrid Smart Accounts
- MetaMask Delegation Toolkit integration
- Full delegation support for auto-revocation
- Granular permission model
- Browser wallet compatible

## 🙏 Acknowledgments

- **Monad** for the blazing-fast testnet
- **MetaMask** for EIP-7702 and delegation toolkit
- **Envio** for real-time indexing with Effect API
- **Privy** for seamless wallet onboarding
- **Railway** for backend hosting
- **Vercel** for frontend deployment


