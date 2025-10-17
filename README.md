# ShieldAI - Proactive Wallet Guardian

AI-powered security agent that monitors wallets 24/7 and automatically revokes dangerous token approvals using MetaMask delegations.

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

## Deployment

1. **Contracts**: Deploy to Monad testnet
2. **Indexer**: Deploy to Envio hosted service
3. **Backend**: Deploy to Railway
4. **Frontend**: Deploy to Vercel

## Demo Flow

1. User signs up with email/wallet/google (Privy)
2. User's EOA is upgraded with EIP-7702
3. User signs delegation granting ShieldAI revoke permissions
4. User registers onchain (calls UserRegistry.register())
5. User approves malicious contract for USDC
6. Envio indexer catches approval → calls backend webhook
7. Backend detects threat → revokes approval automatically
8. Dashboard shows "Threat Neutralized" ✅
