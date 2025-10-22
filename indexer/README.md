# 🛡️ ShieldAI Indexer

Real-time blockchain indexer for ShieldAI that monitors ERC20 token approvals on Monad testnet and triggers threat detection when registered users approve tokens.

## 🎯 What It Does

- **Tracks User Registrations** - Monitors UserRegistry contract for user opt-ins
- **Wildcard ERC20 Indexing** - Indexes ALL ERC20 Approval events across the entire chain
- **Smart Filtering** - Only processes approvals from registered users
- **Real-time Webhooks** - Calls backend API via Envio's Effect API for threat detection
- **3 Entity Types** - RegisteredUser, Approval, MonitoredApproval

## 🏗️ Architecture

```
Monad Testnet
    ↓
Envio Indexer (Wildcard Mode)
    ↓
Filter: Is user registered?
    ↓ YES
Backend Webhook → AI Threat Detection → Auto-Revoke
```

## 📦 Installation

### Prerequisites

- **Node.js v20** (required by Envio)
- **pnpm v8+**
- **Docker Desktop** (for local development)

```bash
# Install dependencies
pnpm install
```

## 🚀 Local Development

### Start the Indexer

```bash
pnpm dev
```

This will:
- Start indexing from block 43620720 (UserRegistry deployment)
- Index all ERC20 Approval events on Monad testnet
- Call your backend webhook for registered users
- Open Hasura console at http://localhost:8080 (password: `testing`)

### Regenerate Types

After changing `schema.graphql` or `config.yaml`:

```bash
pnpm codegen
```

### Type Check

```bash
pnpm tsc --noEmit
```

## 📊 Entities

### RegisteredUser
Tracks users who registered via UserRegistry contract.

```graphql
type RegisteredUser {
  id: ID!              # User address (lowercase)
  address: String!     # User address
  registeredAt: BigInt!
  isActive: Boolean!   # false when user unregisters
}
```

### Approval
ALL ERC20 approval events (complete chain history).

```graphql
type Approval {
  id: ID!              # chainId_blockNumber_logIndex
  owner: String!
  spender: String!
  tokenAddress: String!
  amount: String!
  timestamp: BigInt!
  blockNumber: BigInt!
}
```

### MonitoredApproval
Approvals from registered users only (sent to backend).

```graphql
type MonitoredApproval {
  id: ID!              # chainId_blockNumber_logIndex
  userAddress: String!
  tokenAddress: String!
  spender: String!
  amount: String!
  timestamp: BigInt!
  blockNumber: BigInt!
  notifiedBackend: Boolean!  # Webhook success status
}
```

## 🔍 GraphQL Queries

Open Hasura at http://localhost:8080 and try:

### Get Active Registered Users
```graphql
query {
  RegisteredUser(where: { isActive: { _eq: true } }) {
    address
    registeredAt
  }
}
```

### Get Recent Approvals
```graphql
query {
  Approval(
    limit: 10
    order_by: { timestamp: desc }
  ) {
    owner
    spender
    tokenAddress
    amount
    blockNumber
  }
}
```

### Get Monitored Approvals with Status
```graphql
query {
  MonitoredApproval {
    userAddress
    tokenAddress
    spender
    amount
    notifiedBackend
    timestamp
  }
}
```

### Get Current Approval State (Live State)
```graphql
query CurrentApprovals($userAddress: String!) {
  CurrentApproval(
    where: { 
      owner: { _eq: $userAddress }
      isRevocation: { _eq: false }
    }
  ) {
    id
    tokenAddress
    spender
    amount
    timestamp
  }
}
```

## 🔴 Real-Time Subscriptions

### Subscribe to User's Active Approvals
```graphql
subscription UserApprovals($userAddress: String!) {
  CurrentApproval(
    where: { 
      owner: { _eq: $userAddress }
      isRevocation: { _eq: false }
    }
  ) {
    id
    tokenAddress
    spender
    amount
    timestamp
  }
}
```

**How it works:**
- Approval event → Creates/Updates `CurrentApproval`
- Revocation (amount=0) → Updates `isRevocation: true`
- Your frontend auto-updates via WebSocket!
- Approvals appear/disappear in real-time! ⚡

## 🌐 Deployed Contracts

- **UserRegistry**: `0x2CC70f80098e20717D480270187DCb0c1Ccf826e`
- **Network**: Monad Testnet (Chain ID: 10143)
- **RPC**: `https://testnet-rpc.monad.xyz`
- **Start Block**: 43620720

## 🔧 Key Features

### Wildcard Indexing
```typescript
ERC20.Approval.handler(
  async ({ event, context }) => {
    // Processes EVERY approval event on Monad!
  },
  { wildcard: true } // No contract addresses needed!
);
```

### Effect API for Webhooks
```typescript
const notifyBackend = experimental_createEffect({
  name: "notifyBackend",
  input: { /* approval data */ },
  output: { success: S.boolean },
}, async ({ input, context }) => {
  await fetch('https://shieldai-monad.up.railway.app/api/webhook/approval', {
    method: 'POST',
    body: JSON.stringify(input)
  });
});
```

### Preload Optimization
```yaml
# config.yaml
preload_handlers: true  # 2x faster indexing!
```

## 🚀 Deployment

### Deploy to Envio Hosted Service

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Go to Envio Dashboard**
   - Visit: https://envio.dev/app/indexers/new
   - Connect GitHub
   - Select: `officialcmg/shieldai`

3. **Configure Indexer**
   - Root Directory: `indexer`
   - Config File: `config.yaml`
   - Deploy Branch: `main`

4. **Deploy!**
   - Envio will build and start indexing
   - Monitor progress in dashboard
   - Get GraphQL endpoint URL

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📁 Project Structure

```
indexer/
├── config.yaml              # Network & contract config
├── schema.graphql           # Entity definitions
├── src/
│   └── EventHandlers.ts    # Event processing logic
├── abis/
│   ├── UserRegistry.json   # UserRegistry ABI
│   └── ERC20.json          # ERC20 Approval event
└── generated/              # Auto-generated types (don't edit!)
```

## 🔗 Related Documentation

- **Envio Docs**: https://docs.envio.dev
- **Wildcard Indexing**: https://docs.envio.dev/docs/HyperIndex/wildcard-indexing
- **Effect API**: https://docs.envio.dev/docs/HyperIndex/effect-api
- **Backend Webhook**: `../backend/src/api/webhook.ts`
- **Full Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🐛 Troubleshooting

### Types are broken after schema change
```bash
pnpm codegen
```

### Local indexer won't start
- Check Docker Desktop is running
- Check port 8080 is not in use
- Try: `pnpm envio stop` then `pnpm dev`

### Webhook calls failing
- Check Railway backend is running
- Check URL in `EventHandlers.ts` is correct
- Check Railway logs for errors

## 📝 Notes

- **No Transaction Hashes**: Envio RPC mode doesn't expose transaction hashes
- **Lowercase Addresses**: All addresses normalized to lowercase for consistency
- **Preload Handlers**: Effects run twice - once in preload, once in main phase

## 🎯 Next Steps

1. ✅ Test locally with `pnpm dev`
2. ✅ Verify webhook calls in Railway logs
3. ✅ Deploy to Envio hosted service
4. 🔜 Connect frontend to GraphQL endpoint

---

**Built with [Envio](https://envio.dev) for the Monad x MetaMask hackathon** 🚀
