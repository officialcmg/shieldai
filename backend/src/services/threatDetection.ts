interface ApprovalEvent {
  approvalId: string;
  userAddress: string;
  tokenAddress: string;
  spender: string;
  amount: string;
  timestamp: number;
  blockNumber: number;
}

interface ThreatResult {
  isMalicious: boolean;
  riskScore: number; // 0-100
  reasons: string[];
}

/**
 * Detect if an approval is potentially malicious
 * 
 * For hackathon demo: Simple rule-based detection
 * Production: Would integrate with ChainAbuse API, ML models, etc.
 */
export async function detectThreat(approval: ApprovalEvent): Promise<ThreatResult> {
  const reasons: string[] = [];
  let riskScore = 0;

  // Rule 1: Unlimited approval (2^256-1)
  const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
  const approvalAmount = BigInt(approval.amount);
  
  if (approvalAmount === MAX_UINT256) {
    reasons.push('Unlimited approval detected');
    riskScore += 40;
  }

  // Rule 2: Very large approval
  if (approvalAmount > BigInt(10) ** BigInt(30)) {
    reasons.push('Extremely large approval amount');
    riskScore += 30;
  }

  // Rule 3: Known malicious spenders (demo list)
  const KNOWN_MALICIOUS_ADDRESSES = [
    '0x1234567890123456789012345678901234567890', // Demo malicious contract
    '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', // Demo phishing contract
  ];

  if (KNOWN_MALICIOUS_ADDRESSES.includes(approval.spender.toLowerCase())) {
    reasons.push('Known malicious spender');
    riskScore += 60;
  }

  // Rule 4: Recently deployed contract (would need to check contract creation block)
  // TODO: Implement contract age check

  // Rule 5: Check ChainAbuse API (if API key available)
  if (process.env.CHAINABUSE_API_KEY) {
    try {
      const isReported = await checkChainAbuseAPI(approval.spender);
      if (isReported) {
        reasons.push('Reported on ChainAbuse');
        riskScore += 50;
      }
    } catch (error) {
      console.warn('ChainAbuse API check failed:', error);
    }
  }

  // FOR DEMO: Treat any unlimited approval as suspicious
  // In production, you'd have more sophisticated logic
  const isMalicious = riskScore >= 40;

  return {
    isMalicious,
    riskScore: Math.min(riskScore, 100),
    reasons,
  };
}

/**
 * Check if an address is reported on ChainAbuse
 */
async function checkChainAbuseAPI(address: string): Promise<boolean> {
  // TODO: Implement actual ChainAbuse API call
  // const response = await fetch(`https://api.chainabuse.com/v1/address/${address}`, {
  //   headers: { 'Authorization': `Bearer ${process.env.CHAINABUSE_API_KEY}` }
  // });
  // return response.status === 200;
  
  return false; // Placeholder
}
