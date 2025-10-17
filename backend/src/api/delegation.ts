import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';
import { storeDelegation, getDelegation } from '../db/delegations.js';

export const delegationRouter: RouterType = Router();

// Schema for storing a signed delegation
const StoreDelegationSchema = z.object({
  userAddress: z.string(),
  delegation: z.object({
    delegate: z.string(),
    delegator: z.string(),
    authority: z.string(),
    caveats: z.array(z.any()),
    salt: z.string(),
    signature: z.string(),
  }),
});

/**
 * Store a signed delegation from a user
 * Called by frontend after user signs delegation
 */
delegationRouter.post('/store', async (req, res) => {
  try {
    const { userAddress, delegation } = StoreDelegationSchema.parse(req.body);

    await storeDelegation(userAddress, delegation);

    console.log(`✅ Stored delegation for user: ${userAddress}`);

    res.json({ 
      success: true,
      message: 'Delegation stored successfully',
      userAddress 
    });

  } catch (error) {
    console.error('Error storing delegation:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid payload', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Failed to store delegation' });
  }
});

/**
 * Retrieve a stored delegation for a user
 * Used internally by backend when revoking approvals
 */
delegationRouter.get('/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    const delegation = await getDelegation(userAddress.toLowerCase());

    if (!delegation) {
      return res.status(404).json({ 
        error: 'Delegation not found',
        userAddress 
      });
    }

    res.json({ 
      success: true,
      delegation 
    });

  } catch (error) {
    console.error('Error retrieving delegation:', error);
    res.status(500).json({ error: 'Failed to retrieve delegation' });
  }
});

/**
 * Check if a user has a stored delegation
 */
delegationRouter.get('/:userAddress/exists', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const delegation = await getDelegation(userAddress.toLowerCase());

    res.json({ 
      exists: !!delegation,
      userAddress 
    });

  } catch (error) {
    console.error('Error checking delegation:', error);
    res.status(500).json({ error: 'Failed to check delegation' });
  }
});
