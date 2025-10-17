# ShieldAI Backend

Node.js backend for ShieldAI with webhook receiver and delegation management.

## Features

- **Webhook API**: Receives real-time approval events from Envio indexer
- **Threat Detection**: Analyzes approvals for malicious patterns
- **Delegation Management**: Stores and retrieves signed delegations
- **Revocation Service**: Automatically revokes dangerous approvals

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Run database migrations:
```bash
pnpm db:migrate
```

4. Start development server:
```bash
pnpm dev
```

## API Endpoints

### Webhook
- `POST /api/webhook/approval` - Receive approval events from Envio
- `GET /api/webhook/health` - Webhook health check

### Delegation
- `POST /api/delegation/store` - Store a signed delegation
- `GET /api/delegation/:userAddress` - Get delegation for user
- `GET /api/delegation/:userAddress/exists` - Check if delegation exists

### Health
- `GET /health` - Server health check

## Deployment to Railway

1. Create new project on Railway
2. Add PostgreSQL service
3. Connect GitHub repo
4. Set environment variables
5. Deploy!

Railway will automatically:
- Create PostgreSQL database
- Set `DATABASE_URL`
- Provide public URL for webhooks
- Deploy on push to main branch

## Environment Variables

See `.env.example` for required variables.

## Architecture

```
Envio Indexer (Effect API)
         ↓ (webhook)
    Webhook API
         ↓
  Threat Detection
         ↓
  Revocation Service
  (redeems delegation)
         ↓
    Monad Testnet
```
