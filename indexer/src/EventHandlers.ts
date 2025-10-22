import { UserRegistry, ERC20 } from "generated";
import { experimental_createEffect, S } from "envio";

// Effect API to notify backend webhook
const notifyBackend = experimental_createEffect({
  name: "notifyBackend",
  input: {
    approvalId: S.string,
    userAddress: S.string,
    tokenAddress: S.string,
    spender: S.string,
    amount: S.string,
    isRevocation: S.boolean,
    timestamp: S.number,
    blockNumber: S.number,
  },
  output: {
    success: S.boolean,
  },
  cache: false, // Don't cache webhook calls
}, async ({ input, context }) => {
  try {
    const response = await fetch('https://shieldai-monad.up.railway.app/api/webhook/approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    
    if (!response.ok) {
      context.log.error(`Backend returned ${response.status}: ${await response.text()}`);
      return { success: false };
    }
    
    await response.json(); // Consume response
    context.log.info(`Backend notified successfully for approval ${input.approvalId}`);
    return { success: true };
  } catch (error) {
    context.log.error(`Failed to notify backend: ${error}`);
    return { success: false };
  }
});

// Track user registrations
UserRegistry.UserRegistered.handler(async ({ event, context }) => {
  const userAddress = event.params.user.toLowerCase();
  
  context.RegisteredUser.set({
    id: userAddress,
    address: userAddress,
    registeredAt: event.params.timestamp,
    isActive: true,
  });
  
  context.log.info(`User registered: ${userAddress}`);
});

// Handle user unregistrations
UserRegistry.UserUnregistered.handler(async ({ event, context }) => {
  const userAddress = event.params.user.toLowerCase();
  const user = await context.RegisteredUser.get(userAddress);
  
  if (user) {
    context.RegisteredUser.set({
      ...user,
      isActive: false,
    });
    context.log.info(`User unregistered: ${userAddress}`);
  }
});

// Monitor ALL ERC20 Approval events with wildcard indexing
ERC20.Approval.handler(
  async ({ event, context }) => {
    const owner = event.params.owner.toLowerCase();
    const spender = event.params.spender.toLowerCase();
    const approvalId = `${event.chainId}_${event.block.number}_${event.logIndex}`;
    const amount = event.params.value.toString();
    const isRevocation = amount === "0";
    
    // Store ALL approvals (not just registered users)
    context.Approval.set({
      id: approvalId,
      owner: owner,
      spender: spender,
      tokenAddress: event.srcAddress,
      amount: amount,
      isRevocation: isRevocation,
      timestamp: BigInt(event.block.timestamp),
      blockNumber: BigInt(event.block.number),
    });
    
    // Update current approval state (this will UPDATE if exists, CREATE if new)
    const currentApprovalId = `${owner}_${event.srcAddress}_${spender}`;
    context.CurrentApproval.set({
      id: currentApprovalId,
      owner: owner,
      tokenAddress: event.srcAddress,
      spender: spender,
      amount: amount,
      isRevocation: isRevocation,
      timestamp: BigInt(event.block.timestamp),
      blockNumber: BigInt(event.block.number),
      lastEventId: approvalId,
    });
    
    // Check if this is a REGISTERED and ACTIVE user
    const registeredUser = await context.RegisteredUser.get(owner);
    
    if (registeredUser && registeredUser.isActive) {
      context.log.info(`Monitored approval detected from registered user: ${owner}`);
      
      // Store as MonitoredApproval
      context.MonitoredApproval.set({
        id: approvalId,
        userAddress: owner,
        tokenAddress: event.srcAddress,
        spender: spender,
        amount: amount,
        isRevocation: isRevocation,
        timestamp: BigInt(event.block.timestamp),
        blockNumber: BigInt(event.block.number),
        notifiedBackend: false,
      });
      
      // Notify backend via Effect API
      try {
        const result: { success: boolean } = await context.effect(notifyBackend, {
          approvalId,
          userAddress: owner,
          tokenAddress: event.srcAddress,
          spender: spender,
          amount: amount,
          isRevocation: isRevocation,
          timestamp: event.block.timestamp,
          blockNumber: event.block.number,
        });
        
        // Update notifiedBackend status
        context.MonitoredApproval.set({
          id: approvalId,
          userAddress: owner,
          tokenAddress: event.srcAddress,
          spender: spender,
          amount: amount,
          isRevocation: isRevocation,
          timestamp: BigInt(event.block.timestamp),
          blockNumber: BigInt(event.block.number),
          notifiedBackend: result.success,
        });
        
        if (result.success) {
          context.log.info(`Backend notified for approval ${approvalId}`);
        }
      } catch (error) {
        context.log.error(`Failed to call backend effect: ${error}`);
      }
    }
  },
  { wildcard: true } // Enable wildcard indexing for ALL ERC20 contracts!
);
