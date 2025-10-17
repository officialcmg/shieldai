import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';
import { handleNewApproval } from '../services/approvalHandler.js';

export const webhookRouter: RouterType = Router();

// Schema for approval webhook from Envio
const ApprovalWebhookSchema = z.object({
  approvalId: z.string(),
  userAddress: z.string(),
  tokenAddress: z.string(),
  spender: z.string(),
  amount: z.string(),
  timestamp: z.number(),
  blockNumber: z.number(),
});

/**
 * Webhook endpoint called by Envio indexer via Effect API
 * This is called in real-time when a monitored user approves a token
 */
webhookRouter.post('/approval', async (req, res) => {
  try {
    console.log('🚨 Received approval webhook:', req.body);

    // Validate webhook payload
    const approval = ApprovalWebhookSchema.parse(req.body);

    // Optional: Verify webhook signature if you set WEBHOOK_SECRET
    // const signature = req.headers['x-webhook-signature'];
    // if (!verifyWebhookSignature(req.body, signature)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    // Process approval asynchronously (don't block webhook response)
    handleNewApproval(approval).catch(error => {
      console.error('Error handling approval:', error);
    });

    // Respond immediately to Envio
    res.json({ 
      success: true, 
      message: 'Approval received and queued for processing' 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid payload', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check for Envio to verify webhook is reachable
webhookRouter.get('/health', (req, res) => {
  res.json({ 
    status: 'ready',
    endpoint: '/api/webhook/approval',
    timestamp: new Date().toISOString()
  });
});
