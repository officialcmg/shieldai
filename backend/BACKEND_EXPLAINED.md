# Backend Architecture Explained (For Supabase Users!)

## **What You're Used To (Supabase)**

```
Supabase = Database + Auth + Edge Functions (all managed)
│
├─ Database: PostgreSQL (auto-managed)
├─ Auth: Built-in user management
└─ Functions: Serverless endpoints
```

## **What We're Building (Express + Railway)**

```
Railway = Supabase but DIY
│
├─ Database: PostgreSQL (Railway manages it)
├─ Backend: Express.js server (you write it)
└─ Deployment: Automatic from Git
```

**The good news:** Railway is almost as easy as Supabase! Push to Git = auto deploy.

---

## **Backend Stack**

| Technology | Purpose | Supabase Equivalent |
|------------|---------|---------------------|
| **Express.js** | Web server | Edge Functions |
| **PostgreSQL** | Database | Supabase DB |
| **TypeScript** | Type safety | TypeScript (same!) |
| **Viem** | Ethereum library | - |
| **Zod** | Validation | - |

---

## **File Structure & What Each File Does**

```
backend/
├── src/
│   ├── index.ts                 ← Main server (starts everything)
│   │
│   ├── api/                     ← Your "endpoints" (like Supabase Functions)
│   │   ├── webhook.ts           ← POST /api/webhook/approval (Envio calls this)
│   │   └── delegation.ts        ← POST /api/delegation/store (Frontend calls this)
│   │
│   ├── services/                ← Your "business logic"
│   │   ├── approvalHandler.ts   ← Decides what to do with approvals
│   │   ├── threatDetection.ts   ← Checks if approval is dangerous
│   │   └── revocationService.ts ← Actually revokes the approval
│   │
│   └── db/                      ← Your "database queries"
│       ├── index.ts             ← Database connection
│       └── delegations.ts       ← Store/retrieve delegations
│
├── package.json                 ← Dependencies (like package.json for frontend)
└── .env                         ← Secrets (like Supabase .env)
```

---

## **How It Works: Step by Step**

### **1. Server Starts (`index.ts`)**

```typescript
// This is like starting a Supabase project
const app = express();
app.listen(3000); // Server runs on port 3000

// Connect to database (Railway provides DATABASE_URL)
await initDatabase();
```

**What happens:**
- Server starts listening on port 3000
- Connects to PostgreSQL database
- Registers all your routes/endpoints

---

### **2. Endpoints (Your API Routes)**

Think of these as **Supabase Edge Functions** but in one file:

#### **A. Webhook Endpoint** (`/api/webhook/approval`)

**Who calls it:** Envio indexer (via Effect API)  
**When:** Every time a registered user approves a token  
**What it does:** Receives approval data and processes it

```typescript
// POST /api/webhook/approval
// Called by Envio in real-time

Input: {
  userAddress: "0x123...",
  tokenAddress: "0xUSDC...",
  spender: "0xMaliciousContract...",
  amount: "999999999..."
}

Process:
1. Validate data ✓
2. Queue for processing ✓
3. Respond to Envio immediately ✓
4. Analyze threat in background ✓
5. Revoke if malicious ✓
```

#### **B. Delegation Endpoint** (`/api/delegation/store`)

**Who calls it:** Your frontend (after user signs delegation)  
**When:** Once when user enables ShieldAI  
**What it does:** Stores the signed delegation in database

```typescript
// POST /api/delegation/store
// Called by frontend after user signs delegation

Input: {
  userAddress: "0x123...",
  delegation: {
    signature: "0xabc...",
    delegate: "0xShieldAI...",
    // ... delegation data
  }
}

Process:
1. Validate delegation ✓
2. Store in PostgreSQL ✓
3. Return success ✓
```

---

### **3. Services (Business Logic)**

These do the actual work:

#### **A. Approval Handler** (`approvalHandler.ts`)

Main orchestrator - coordinates everything:

```typescript
handleNewApproval(approval) {
  1. Run threat detection
  2. If malicious → revoke it
  3. Log the action
}
```

#### **B. Threat Detection** (`threatDetection.ts`)

Decides if an approval is dangerous:

```typescript
detectThreat(approval) {
  riskScore = 0;
  
  // Rule 1: Unlimited approval?
  if (amount === MAX_UINT256) {
    riskScore += 40;
  }
  
  // Rule 2: Known malicious spender?
  if (isKnownMalicious(spender)) {
    riskScore += 60;
  }
  
  // Rule 3: Check ChainAbuse API
  if (checkChainAbuse(spender)) {
    riskScore += 50;
  }
  
  return {
    isMalicious: riskScore >= 40,
    riskScore,
    reasons: ["Unlimited approval", "Known scammer"]
  };
}
```

#### **C. Revocation Service** (`revocationService.ts`)

Actually revokes the approval using delegation:

```typescript
revokeApproval({ userAddress, tokenAddress, spender }) {
  1. Get user's delegation from database
  2. Create revoke transaction (set approval to 0)
  3. Use delegation to execute on behalf of user
  4. Send transaction to Monad
  5. Return transaction hash
}
```

---

### **4. Database (`db/` folder)**

Just like Supabase, but you write the queries:

#### **Schema**

```sql
CREATE TABLE delegations (
  user_address VARCHAR(42) PRIMARY KEY,
  delegation JSONB NOT NULL,        -- Stores the signed delegation
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Functions**

```typescript
// Store a delegation
await storeDelegation(userAddress, delegation);

// Get a delegation
const delegation = await getDelegation(userAddress);

// Check if exists
const exists = await hasDelegation(userAddress);
```

---

## **Testing Locally**

### **Step 1: Set Up Local PostgreSQL**

**Option A: Use Railway's database remotely** (easiest!)
```bash
# Railway will give you a DATABASE_URL
# Just paste it in .env
DATABASE_URL=postgresql://...railway.app...
```

**Option B: Run PostgreSQL locally**
```bash
# Install PostgreSQL
brew install postgresql

# Start it
brew services start postgresql

# Create database
createdb shieldai_dev
```

### **Step 2: Start the Server**

```bash
cd backend
pnpm dev
```

You'll see:
```
🔌 Connecting to database...
✅ Database connected
🚀 ShieldAI Backend running on port 3000
📡 Webhook endpoint: http://localhost:3000/api/webhook/approval
🔐 Delegation API: http://localhost:3000/api/delegation
```

### **Step 3: Test Endpoints**

**Health check:**
```bash
curl http://localhost:3000/health
```

**Test webhook (simulate Envio):**
```bash
curl -X POST http://localhost:3000/api/webhook/approval \
  -H "Content-Type: application/json" \
  -d '{
    "approvalId": "test-123",
    "userAddress": "0x123...",
    "tokenAddress": "0xUSDC...",
    "spender": "0xMalicious...",
    "amount": "999999999",
    "timestamp": 1234567890,
    "transactionHash": "0xabc...",
    "blockNumber": 123
  }'
```

---

## **Deploying to Railway**

### **Step 1: Create Railway Project**

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repo
5. Select the `shieldai/backend` folder

### **Step 2: Add PostgreSQL**

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically sets `DATABASE_URL` environment variable

### **Step 3: Set Environment Variables**

In Railway dashboard, add:
```
NODE_ENV=production
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143
SHIELD_AI_PRIVATE_KEY=your_private_key_here
USER_REGISTRY_ADDRESS=0x2CC70f80098e20717D480270187DCb0c1Ccf826e
```

**⚠️ IMPORTANT:** Get `SHIELD_AI_PRIVATE_KEY` from `contracts/.env` - NEVER commit the actual private key!

### **Step 4: Deploy**

```bash
git add .
git commit -m "backend: ready for deployment"
git push
```

Railway automatically:
- Installs dependencies
- Runs `pnpm build`
- Starts with `pnpm start`
- Gives you a public URL

### **Step 5: Get Your URL**

Railway will show something like:
```
https://shieldai-monad-production.up.railway.app
```

This is your webhook URL for Envio!

---

## **Endpoints Summary**

| Endpoint | Method | Purpose | Called By |
|----------|--------|---------|-----------|
| `/health` | GET | Health check | Anyone |
| `/api/webhook/approval` | POST | Receive approvals | Envio indexer |
| `/api/webhook/health` | GET | Webhook health | Envio |
| `/api/delegation/store` | POST | Store delegation | Frontend |
| `/api/delegation/:address` | GET | Get delegation | Internal |
| `/api/delegation/:address/exists` | GET | Check if exists | Frontend |

---

## **Key Differences from Supabase**

| Feature | Supabase | This Backend |
|---------|----------|--------------|
| **Database** | Auto-managed | Railway manages |
| **Auth** | Built-in | You'd add yourself (not needed here) |
| **APIs** | Auto-generated | You write Express routes |
| **Realtime** | Built-in subscriptions | You implement webhooks |
| **Deployment** | Click deploy | Git push (auto) |
| **Scaling** | Automatic | Railway handles it |
| **Cost** | Free tier → Paid | $5/month all-in |

---

## **TL;DR for Supabase Users**

**Supabase Edge Function:**
```typescript
// supabase/functions/my-function/index.ts
Deno.serve(async (req) => {
  // Your logic here
  return new Response("OK");
});
```

**Express Equivalent:**
```typescript
// backend/src/api/myEndpoint.ts
router.post('/my-endpoint', async (req, res) => {
  // Your logic here
  res.json({ status: "OK" });
});
```

**Same concept, different syntax!**

---

## **Next Steps**

1. ✅ Dependencies installed
2. 🔄 Test locally with `pnpm dev`
3. 🚀 Deploy to Railway
4. 📡 Use Railway URL in Envio indexer

Need help with any specific part? Just ask!
