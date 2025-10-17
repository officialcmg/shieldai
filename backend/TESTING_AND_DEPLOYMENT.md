# Testing & Deployment Guide

## ✅ What We Fixed

### TypeScript Errors Resolved:

1. **Router Type Annotations** - Added explicit `RouterType` to webhook and delegation routers
2. **createExecution API** - Changed `data` to `callData` (correct API from MetaMask v0.13)
3. **Delegation Types** - Properly typed all addresses as `Address` and hex strings as `` `0x${string}` ``

---

## 📚 Our Stack is Correct!

### Express.js ✅
- **What:** Minimalist web framework for Node.js
- **Like Supabase:** Edge Functions but self-hosted
- **Railway Docs:** https://docs.railway.com/guides/express

### PostgreSQL (`pg` package) ✅
- **What:** Official PostgreSQL client for Node.js
- **Connects via:** `DATABASE_URL` environment variable (Railway auto-provides this)
- **Railway Docs:** https://docs.railway.com/guides/postgresql

### Viem + MetaMask Delegation Toolkit ✅
- **What:** Ethereum library + MetaMask Smart Account tools
- **Docs:** https://docs.metamask.io/delegation-toolkit/

---

## 🧪 Test Locally

### Option 1: Use Railway Database (EASIEST!) ⭐

**Advantages:**
- No local PostgreSQL setup needed
- Same database you'll use in production
- Railway gives you the connection string

**Steps:**

1. **Create Railway Project**
   - Go to https://railway.app
   - Click "New Project"
   - Add "PostgreSQL" database
   - Copy the `DATABASE_URL` from the database service

2. **Add to your `.env`**
   ```bash
   # In backend/.env
   DATABASE_URL=postgresql://postgres:xxxxx@xxxx.railway.app:xxxx/railway
   ```

3. **Run locally**
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
```

---

### Option 2: Local PostgreSQL (More Setup)

**If you want everything local:**

1. **Install PostgreSQL**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Create Database**
   ```bash
   createdb shieldai_dev
   ```

3. **Update `.env`**
   ```bash
   DATABASE_URL=postgresql://localhost:5432/shieldai_dev
   ```

4. **Run**
   ```bash
   pnpm dev
   ```

---

## 🧪 Testing Endpoints

### 1. Health Check

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-17T20:56:00.000Z",
  "service": "ShieldAI Backend"
}
```

---

### 2. Webhook Health

```bash
curl http://localhost:3000/api/webhook/health
```

**Expected Response:**
```json
{
  "status": "ready",
  "endpoint": "/api/webhook/approval",
  "timestamp": "2025-01-17T20:56:00.000Z"
}
```

---

### 3. Test Webhook (Simulate Envio)

```bash
curl -X POST http://localhost:3000/api/webhook/approval \
  -H "Content-Type: application/json" \
  -d '{
    "approvalId": "test-123",
    "userAddress": "0x123...",
    "tokenAddress": "0xUSDC...",
    "spender": "0xMalicious...",
    "amount": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
    "timestamp": 1234567890,
    "transactionHash": "0xabc...",
    "blockNumber": 123
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Approval received and queued for processing"
}
```

**Check Console Logs:**
You should see threat detection running:
```
🚨 Received approval webhook: {...}
🔍 Analyzing approval test-123
   User: 0x123...
   Token: 0xUSDC...
   Spender: 0xMalicious...
   Amount: 115792089237316195423570985008687907853269984665640564039457584007913129639935
⚠️  THREAT DETECTED!
   Risk Score: 40/100
   Reasons: Unlimited approval detected
```

---

### 4. Test Delegation Storage

```bash
curl -X POST http://localhost:3000/api/delegation/store \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x123...",
    "delegation": {
      "delegate": "0x4a39e9F9A20430a82480F538c14c55cf5e858659",
      "delegator": "0x123...",
      "authority": "0x000...",
      "caveats": [],
      "salt": "0x1234",
      "signature": "0xabcd..."
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Delegation stored successfully",
  "userAddress": "0x123..."
}
```

---

### 5. Retrieve Delegation

```bash
curl http://localhost:3000/api/delegation/0x123...
```

**Expected Response:**
```json
{
  "success": true,
  "delegation": {
    "delegate": "0x4a39e9F9A20430a82480F538c14c55cf5e858659",
    "delegator": "0x123...",
    ...
  }
}
```

---

## 🚀 Deploy to Railway

### Step-by-Step Deployment

#### **1. Push Code to GitHub**

```bash
cd /Users/chrismg/Developer/hackathons/metamask/shieldai
git add backend/
git commit -m "backend: ready for Railway deployment"
git push origin main
```

#### **2. Create Railway Project**

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account
5. Select your repository: `metamask/shieldai`
6. **IMPORTANT:** Railway will ask for the root directory:
   - Set **Root Directory** to: `backend`
   - This tells Railway to only deploy the backend folder

#### **3. Add PostgreSQL Database**

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway automatically creates the database and sets `DATABASE_URL`

#### **4. Configure Environment Variables**

In Railway dashboard, go to your backend service → **Variables** tab:

```bash
# Node Environment
NODE_ENV=production
PORT=3000

# Monad Configuration
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=41454

# ShieldAI Wallet (get from contracts/.env - NEVER commit actual key!)
SHIELD_AI_PRIVATE_KEY=your_private_key_here

# Smart Contracts
USER_REGISTRY_ADDRESS=0x2CC70f80098e20717D480270187DCb0c1Ccf826e

# Database (AUTO-PROVIDED by Railway - don't set manually)
# DATABASE_URL=postgresql://... (Railway sets this automatically)
```

**Note:** Railway automatically injects `DATABASE_URL` from the PostgreSQL service. Don't set it manually!

#### **5. Configure Build Settings**

Railway auto-detects Node.js. Verify these settings:

- **Build Command:** `pnpm install && pnpm build`
- **Start Command:** `pnpm start`
- **Node Version:** 20.x (from package.json engines field)

#### **6. Deploy!**

Click **"Deploy"** or just push to GitHub:

```bash
git push origin main
```

Railway will:
1. ✅ Clone your repo
2. ✅ Install dependencies (`pnpm install`)
3. ✅ Build TypeScript (`pnpm build`)
4. ✅ Start server (`pnpm start`)
5. ✅ Generate public URL

#### **7. Get Your Public URL**

Railway generates a URL like:
```
https://shieldai-backend-production.up.railway.app
```

Or set a custom domain:
- Go to **Settings** → **Networking** → **Generate Domain**

#### **8. Test Deployed Backend**

```bash
# Health check
curl https://your-app.railway.app/health

# Should return:
# {"status":"healthy","timestamp":"...","service":"ShieldAI Backend"}
```

---

## 🔗 Connect Envio Indexer

Once deployed, use your Railway URL in the Envio indexer:

```typescript
// In indexer Effect API
const BACKEND_WEBHOOK_URL = "https://your-app.railway.app/api/webhook/approval";
```

---

## 📊 Monitor Your Deployment

### Railway Dashboard

**View Logs:**
- Go to your service → **Deployments** → Click latest deployment
- See real-time logs of your server

**View Metrics:**
- CPU usage
- Memory usage
- Request count
- Response times

**Database Metrics:**
- Go to PostgreSQL service
- View connections, queries, storage

### Set Up Alerts

Railway can alert you on:
- Deployment failures
- High CPU/memory usage
- Database connection issues

---

## 🐛 Debugging Common Issues

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check DATABASE_URL is set
# Railway should auto-inject it from PostgreSQL service

# In Railway dashboard:
# 1. Go to PostgreSQL service
# 2. Copy DATABASE_URL
# 3. Make sure backend service has reference to it
```

### Issue: "Module not found"

**Solution:**
```bash
# Make sure all imports use .js extension
import { something } from './file.js';  ✅
import { something } from './file';     ❌

# TypeScript with ESM requires .js extensions
```

### Issue: "Port already in use locally"

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=8080 pnpm dev
```

### Issue: "Delegation redemption fails"

**Solution:**
```bash
# Check:
# 1. SHIELD_AI_PRIVATE_KEY is correct
# 2. Wallet has MON for gas
# 3. USER_REGISTRY_ADDRESS is correct
# 4. User has actually registered onchain
```

---

## 💰 Railway Pricing

**Your $5 Credit Covers:**
- ✅ PostgreSQL database (512 MB storage)
- ✅ Backend server (512 MB RAM, shared CPU)
- ✅ $5 of usage (~500 hours of runtime)
- ✅ Public URL with SSL

**After $5 credit:**
- Pay-as-you-go: ~$5-10/month for hobby projects
- No surprise charges (Railway warns you)

---

## 🎯 Quick Reference

### Local Development
```bash
cd backend
pnpm dev
# Server: http://localhost:3000
```

### Deploy to Railway
```bash
git push origin main
# Railway auto-deploys
```

### Check Logs
```bash
# In Railway dashboard:
# Service → Deployments → Click deployment → View logs
```

### Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection (auto-set by Railway) | `postgresql://...` |
| `SHIELD_AI_PRIVATE_KEY` | Backend wallet key | `0x5af2...` |
| `USER_REGISTRY_ADDRESS` | Contract address | `0x2CC7...` |
| `MONAD_RPC_URL` | Monad RPC | `https://testnet-rpc.monad.xyz` |

---

## ✅ Summary

**Our Implementation:**
- ✅ Express.js for API server (Railway approved)
- ✅ PostgreSQL via `pg` package (Railway managed)
- ✅ TypeScript with proper types
- ✅ MetaMask Delegation Toolkit v0.13

**Testing:**
- ✅ Test locally with Railway database (easiest)
- ✅ Or use local PostgreSQL

**Deployment:**
- ✅ Push to GitHub
- ✅ Railway auto-deploys
- ✅ Get public URL for Envio webhook

**Next Steps:**
1. Test locally: `pnpm dev`
2. Deploy to Railway
3. Get webhook URL
4. Use in Envio indexer

Ready to test? Run `pnpm dev` in the backend folder!
