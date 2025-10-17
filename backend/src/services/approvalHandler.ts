import { detectThreat } from './threatDetection.js';
import { revokeApproval } from './revocationService.js';

interface ApprovalEvent {
  approvalId: string;
  userAddress: string;
  tokenAddress: string;
  spender: string;
  amount: string;
  timestamp: number;
  blockNumber: number;
}

/**
 * Main handler for new approval events
 * Called by webhook when Envio detects a monitored user approval
 */
export async function handleNewApproval(approval: ApprovalEvent): Promise<void> {
  console.log(`\n🔍 Analyzing approval ${approval.approvalId}`);
  console.log(`   User: ${approval.userAddress}`);
  console.log(`   Token: ${approval.tokenAddress}`);
  console.log(`   Spender: ${approval.spender}`);
  console.log(`   Amount: ${approval.amount}`);

  try {
    // Step 1: Run threat detection
    const threatResult = await detectThreat(approval);

    if (!threatResult.isMalicious) {
      console.log(`✅ Approval is safe - no action needed`);
      return;
    }

    console.log(`⚠️  THREAT DETECTED!`);
    console.log(`   Risk Score: ${threatResult.riskScore}/100`);
    console.log(`   Reasons: ${threatResult.reasons.join(', ')}`);

    // Step 2: Revoke the dangerous approval
    console.log(`🛡️  Revoking approval...`);
    const revocationTx = await revokeApproval({
      userAddress: approval.userAddress,
      tokenAddress: approval.tokenAddress,
      spender: approval.spender,
    });

    console.log(`✅ Threat neutralized!`);
    console.log(`   Transaction: ${revocationTx}`);

    // TODO: Store this action in database for dashboard display
    // TODO: Optionally notify user via webhook/email

  } catch (error) {
    console.error(`❌ Error handling approval ${approval.approvalId}:`, error);
    throw error;
  }
}
