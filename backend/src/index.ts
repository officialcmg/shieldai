import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { webhookRouter } from './api/webhook.js';
import { delegationRouter } from './api/delegation.js';
import { initDatabase } from './db/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'ShieldAI Backend'
  });
});

// Routes
app.use('/api/webhook', webhookRouter);
app.use('/api/delegation', delegationRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize database and start server
async function start() {
  try {
    console.log('🔌 Connecting to database...');
    await initDatabase();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 ShieldAI Backend running on port ${PORT}`);
      console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/webhook/approval`);
      console.log(`🔐 Delegation API: http://localhost:${PORT}/api/delegation`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
