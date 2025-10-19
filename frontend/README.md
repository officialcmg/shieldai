# ShieldAI Frontend

AI-Powered Wallet Guardian - Protect yourself from malicious token approvals with real-time threat detection.

## 🚀 Features

- **Privy Authentication** - Email, social, or wallet login
- **EIP-7702 Smart Account Upgrade** - Using MetaMask Delegation Toolkit
- **Real-Time Monitoring** - GraphQL subscriptions via Envio
- **Auto-Revocation** - AI-powered threat detection
- **Beautiful UI** - Built with Next.js, TailwindCSS, and Framer Motion

## 📦 Tech Stack

- **Next.js 15** - App Router
- **TypeScript**
- **Privy** - Authentication & embedded wallets
- **MetaMask Delegation Toolkit** - EIP-7702 & delegations
- **Apollo Client** - GraphQL subscriptions
- **Viem** - Ethereum interactions
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## 🛠️ Setup

1. **Install dependencies:**
```bash
pnpm install
```

2. **Configure environment variables:**

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_ENVIO_GRAPHQL_ENDPOINT=your_envio_endpoint
NEXT_PUBLIC_SHIELDAI_DELEGATE_ADDRESS=your_backend_wallet
```

3. **Get Privy App ID:**
   - Go to [dashboard.privy.io](https://dashboard.privy.io)
   - Create a new app
   - Copy your App ID

4. **Run development server:**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── onboarding/page.tsx      # Onboarding flow (3 steps + confetti)
│   └── dashboard/page.tsx       # Main dashboard
├── components/
│   ├── Providers.tsx            # Privy + Apollo providers
│   ├── Header.tsx               # Top navigation
│   ├── ApprovalCard.tsx         # Approval display (turns red when revoked!)
│   └── DemoSection.tsx          # Create mock approvals
└── lib/
    ├── apollo.ts                # Apollo Client with subscriptions
    ├── metamask.ts              # MetaMask Delegation Toolkit functions
    ├── constants.ts             # Contract addresses, chain config
    └── utils.ts                 # Utility functions
```

## 🎯 User Flow

1. **Landing Page** → User clicks "Get Protected"
2. **Privy Login** → Email/social/wallet authentication
3. **Onboarding:**
   - Step 1: Welcome
   - Step 2: Upgrade to Smart Account (EIP-7702)
   - Step 3: Grant protection (sign delegation + register)
   - Step 4: Success with confetti! 🎉
4. **Dashboard** → View real-time approvals
   - Active approvals shown in green
   - Revoked approvals turn red with smooth animation
   - Demo section to test the system

## 🔧 Key Features

### EIP-7702 Upgrade (MetaMask Toolkit)

```typescript
const authorization = await walletClient.signAuthorization({
  contractAddress: DELEGATOR_IMPL,
  executor: "self"
})
```

### Delegation for Protection

```typescript
const delegation = createDelegation({
  scope: {
    type: "functionCall",
    selectors: ["approve(address,uint256)"]
  }
})
```

### Real-Time Subscriptions

```typescript
const { data } = useSubscription(USER_APPROVALS_SUBSCRIPTION, {
  variables: { userAddress }
})
```

### Animated State Changes

```typescript
<motion.div
  animate={{
    borderColor: isRevoked ? "#EF4444" : "#10B981",
    backgroundColor: isRevoked ? "#FEE2E2" : "#F0FDF4"
  }}
/>
```

## 🎨 Design System

- **Primary:** Purple (#8B5CF6)
- **Success:** Green (#10B981)
- **Danger:** Red (#EF4444)
- **Background:** Gray-50
- **Cards:** White with subtle shadows

## 📱 Responsive

- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Fully responsive components

## 🚢 Build for Production

```bash
pnpm build
pnpm start
```

## 🏆 Hackathon Requirements

✅ Uses MetaMask Smart Accounts (EIP-7702)
✅ Uses MetaMask Delegation Toolkit
✅ Deployed on Monad Testnet
✅ Real-time data via Envio
✅ GraphQL subscriptions for live updates

## 📝 TODO

- [ ] Set Privy App ID in `.env.local`
- [ ] Set Envio endpoint in `.env.local`  
- [ ] Set ShieldAI backend address in `.env.local`
- [ ] Deploy test ERC20 token for demo
- [ ] Test full flow on Monad testnet

## 🤝 Contributing

This is a hackathon project for the MetaMask Smart Accounts Hackathon x Monad x Envio.

## 📄 License

MIT
