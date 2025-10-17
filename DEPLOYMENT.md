# ShieldAI Deployment Info

## Deployed Contracts (Monad Testnet)

### UserRegistry
- **Address:** `0x2CC70f80098e20717D480270187DCb0c1Ccf826e`
- **Transaction:** `0x50fc814f5ba58b5e2f70c6f3d13a7d7bcfaeacbaae3db8863362eb45a3d4f91c`
- **Block:** 43620720
- **Chain ID:** 10143 (Monad Testnet)
- **Explorer:** https://explorer.monad.xyz/address/0x2CC70f80098e20717D480270187DCb0c1Ccf826e

## ShieldAI Backend Wallet

### Address
`0x4a39e9F9A20430a82480F538c14c55cf5e858659`

### Purpose
- Receives delegations from users
- Executes approval revocations on behalf of users
- Deployed the UserRegistry contract

### Private Key Location
- `contracts/.env` → `PRIVATE_KEY`
- `backend/.env` → `SHIELD_AI_PRIVATE_KEY`

> ⚠️ **Security Note:** This is a testnet wallet for hackathon purposes only. Never reuse for production.

## Network Configuration

### Monad Testnet
- **RPC URL:** `https://testnet-rpc.monad.xyz`
- **Chain ID:** 10143 (or 41454 - verify with Monad docs)
- **Explorer:** https://explorer.monad.xyz
- **Currency:** MON

## Git Structure

The project uses a **monorepo structure** with separate concerns:

```
shieldai/
├── contracts/          (Git: separate commits)
│   └── .git
├── backend/           (Git: separate commits)
│   └── (shared parent .git)
├── indexer/           (Git: separate commits)
│   └── (shared parent .git)
└── frontend/          (Git: separate commits)
    └── (shared parent .git)
```

**Commit Strategy:**
- Each subdirectory can be committed independently
- Allows for focused commits per component
- Main repo tracks overall progress

## Next Steps

1. ✅ **Contracts** - Deployed to Monad testnet
2. ✅ **Backend** - Structure created, ready for deployment
3. 🔄 **Indexer** - Need to create Envio indexer with Effect API
4. 🔜 **Frontend** - Need to create Next.js app with Privy

## Quick Commands

### Check UserRegistry on-chain
```bash
cast call 0x2CC70f80098e20717D480270187DCb0c1Ccf826e "userCount()(uint256)" --rpc-url https://testnet-rpc.monad.xyz
```

### Check ShieldAI wallet balance
```bash
cast balance 0x4a39e9F9A20430a82480F538c14c55cf5e858659 --rpc-url https://testnet-rpc.monad.xyz
```

### Register a user (example)
```bash
cast send 0x2CC70f80098e20717D480270187DCb0c1Ccf826e "register()" --private-key $YOUR_PRIVATE_KEY --rpc-url https://testnet-rpc.monad.xyz
```
