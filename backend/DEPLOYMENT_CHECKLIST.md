# 🚀 Railway Deployment Checklist

## Pre-Deployment Checklist

- [x] All TypeScript errors fixed
- [x] Dependencies installed (`pnpm install`)
- [x] Environment variables documented
- [x] Contract deployed to Monad testnet
- [ ] Tested locally
- [ ] Committed to Git

---

## Railway Deployment Steps

### 1️⃣ Create Railway Account & Project

1. Go to https://railway.app
2. Sign up with GitHub
3. Add $5 credit (covers PostgreSQL + backend)

### 2️⃣ Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repo: `officialcmg/shieldai`
4. **Set Root Directory:** `backend`

### 3️⃣ Add PostgreSQL

1. In project, click **"+ New"**
2. Select **"PostgreSQL"**
3. Railway creates database & sets `DATABASE_URL` automatically

### 4️⃣ Set Environment Variables

Go to backend service → **Variables**:

```bash
NODE_ENV=production
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=41454
SHIELD_AI_PRIVATE_KEY=your_private_key_from_contracts/.env
USER_REGISTRY_ADDRESS=0x2CC70f80098e20717D480270187DCb0c1Ccf826e
```

### 5️⃣ Deploy

Push to GitHub or click **"Deploy"** in Railway:

```bash
git add .
git commit -m "backend: production ready"
git push origin main
```

### 6️⃣ Get Your URL

Railway generates:
```
https://shieldai-backend-production-xxxxx.up.railway.app
```

Or set custom domain in **Settings** → **Networking**

### 7️⃣ Test Deployed Backend

```bash
curl https://your-url.railway.app/health
```

Should return:
```json
{"status":"healthy","service":"ShieldAI Backend"}
```

---

## Post-Deployment

### ✅ What to Do Next

1. **Copy your Railway URL**
   - You'll need it for the Envio indexer

2. **Test webhook endpoint**
   ```bash
   curl https://your-url.railway.app/api/webhook/health
   ```

3. **Monitor logs**
   - Railway dashboard → Deployments → View Logs

4. **Check database connection**
   - Look for "✅ Database connected" in logs

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check `pnpm install` runs successfully |
| Database connection fails | Verify PostgreSQL service is running |
| Environment vars missing | Add them in Railway Variables tab |
| TypeScript errors | Run `pnpm build` locally first |

---

## Railway Tips

**Auto-Deploy:**
- Every `git push` triggers a new deployment
- Railway builds and deploys automatically

**View Logs:**
- Real-time logs in dashboard
- Search and filter logs

**Database Access:**
- Railway provides direct connection string
- Can connect via `psql` or DB client

**Monitoring:**
- CPU/Memory usage graphs
- Request metrics
- Set up alerts

---

## Cost Estimate

**With $5 Credit:**
- 512 MB RAM backend: ~$0.01/hour
- PostgreSQL (shared): ~$0.007/hour
- **Total:** ~$12-15/month (but you have $5 free)

**Your $5 covers:**
- ~300-400 hours of runtime
- Perfect for hackathon + 1-2 weeks

---

## Contact Info Saved

**ShieldAI Wallet:**
```
Address: 0x4a39e9F9A20430a82480F538c14c55cf5e858659
Private Key: See contracts/.env (NEVER commit this!)
```

**UserRegistry Contract:**
```
Address: 0x2CC70f80098e20717D480270187DCb0c1Ccf826e
Chain: Monad Testnet (ID: 10143)
```

---

Ready to deploy? Just push to GitHub and Railway handles the rest! 🚀
