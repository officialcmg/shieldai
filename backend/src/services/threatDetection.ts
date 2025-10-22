import OpenAI from 'openai';
import { createPublicClient, http, type Address } from 'viem';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Initialize Base mainnet client for fetching bytecode
const publicClient = createPublicClient({
  chain: {
    id: 8453,
    name: 'Base',
    rpcUrls: { default: { http: [process.env.BASE_RPC_URL || 'https://mainnet.base.org'] } },
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  },
  transport: http(),
});

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

  // Auto revoke for infinite approvals
  const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
  const approvalAmount = BigInt(approval.amount);
  
  if (approvalAmount === MAX_UINT256) {
    reasons.push('Unlimited approval detected');
    return {
        isMalicious: true,
        riskScore: 40,
        reasons,
    };
  }

  // Rule 2: Known malicious spenders (demo list)
  const KNOWN_MALICIOUS_ADDRESSES = [
    '0x1234567890123456789012345678901234567890', // Demo malicious contract
    '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', // Demo phishing contract
  ];

  if (KNOWN_MALICIOUS_ADDRESSES.includes(approval.spender.toLowerCase())) {
    reasons.push('Known malicious spender');
    return {
        isMalicious: true,
        riskScore: 50,
        reasons,
    };
  }

  // AI Verdict - Deep bytecode analysis
  console.log('\n🔬 Triggering AI verdict for deep analysis...');
  const verdict = await getAIVerdict(approval);
  return verdict;
}

/**
 * Get AI verdict by analyzing contract bytecode
 */
async function getAIVerdict(approval: ApprovalEvent): Promise<ThreatResult> {
  console.log('\n🤖 AI VERDICT ANALYSIS STARTING...');
  console.log('   Approval ID:', approval.approvalId);
  console.log('   Spender:', approval.spender);
  console.log('   Token:', approval.tokenAddress);
  console.log('   Amount:', approval.amount);

  try {
    // Step 1: Fetch contract bytecode
    console.log('\n📡 Fetching contract bytecode from Base mainnet...');
    const bytecode = await publicClient.getCode({
      address: approval.spender as Address,
    });

    if (!bytecode || bytecode === '0x') {
      console.log('⚠️  WARNING: Spender is an EOA (not a contract)');
      return {
        isMalicious: true,
        riskScore: 85,
        reasons: [
          'Spender is an EOA (Externally Owned Account)',
          'EOAs should not receive token approvals',
          'Likely a phishing attempt',
        ],
      };
    }

    console.log(`✅ Bytecode fetched: ${bytecode.length} bytes`);
    console.log(`   First 100 chars: ${bytecode.slice(0, 100)}...`);
    console.log(`   Sending FULL bytecode to AI (${bytecode.length} chars)`);

    // Step 2: Prepare AI prompt
    const prompt = `You are an ELITE blockchain security AI expert with deep expertise in EVM bytecode analysis and smart contract security auditing.

**YOUR MISSION:**
Analyze the following ERC20 token approval and determine if the spender contract is malicious.

**APPROVAL DETAILS:**
- Token Address: ${approval.tokenAddress}
- Spender Contract: ${approval.spender}
- Amount: ${approval.amount === '115792089237316195423570985008687907853269984665640564039457584007913129639935' ? 'UNLIMITED (2^256-1)' : approval.amount}
- User: ${approval.userAddress}

**COMPLETE CONTRACT BYTECODE (FULL ${bytecode.length} bytes):**
${bytecode}

**CRITICAL ANALYSIS INSTRUCTIONS - READ CAREFULLY:**

You MUST analyze the COMPLETE bytecode above with extreme scrutiny. Look for these SPECIFIC EVM opcodes and patterns:

**HIGH-RISK PATTERNS TO DETECT:**

1. **Unrestricted transferFrom (CRITICAL):**
   - Look for CALLDATALOAD + function selector 0x23b872dd (transferFrom)
   - Check if there's ANY external call to transferFrom on an ERC20 token
   - If the contract can call transferFrom on user-approved tokens → MALICIOUS

2. **Owner/Admin Privilege Patterns:**
   - Look for SLOAD operations reading from slot 0 (often owner storage)
   - Check for CALLER comparison with stored owner address
   - If owner can trigger token transfers → HIGH RISK

3. **Hidden Backdoor Functions:**
   - Look for private/internal functions that call transferFrom
   - Check for functions with misleading names that steal tokens
   - Any function that can drain tokens without user's direct consent → MALICIOUS

4. **Honeypot Indicators:**
   - Functions that look safe (view/read-only names) but execute state changes
   - Fake swap/trade functions that take tokens but give nothing back
   - Any SELFDESTRUCT opcode with fund extraction → MALICIOUS

5. **Missing Safety Mechanisms:**
   - No timelocks before critical operations
   - No approval amount limits
   - No pause mechanisms
   - No multi-sig requirements for withdrawals

**BYTECODE ANALYSIS TECHNIQUE:**
- The bytecode contains the contract's deployed code
- Look for function selectors (first 4 bytes of keccak256 of function signature)
- Common malicious selectors:
  - 0x23b872dd = transferFrom(address,address,uint256)
  - 0xa9059cbb = transfer(address,uint256)
- If you see these combined with owner checks → LIKELY MALICIOUS

**DECISION CRITERIA:**
- If contract can call transferFrom on approved tokens → isMalicious = TRUE, riskScore >= 85
- If contract has owner-only functions that move tokens → isMalicious = TRUE, riskScore >= 75
- If contract has hidden backdoors → isMalicious = TRUE, riskScore >= 90
- If contract lacks ANY safety mechanisms → increase riskScore by 20
- BE AGGRESSIVE: When in doubt about security, mark as MALICIOUS

**RESPOND IN THIS EXACT JSON FORMAT:**
{
  "isMalicious": boolean,
  "riskScore": number (0-100, where 100 is extremely dangerous),
  "reasons": ["specific reason 1", "specific reason 2", "specific reason 3"],
  "contractType": "DEX" | "Bridge" | "Staking" | "Unknown" | "Malicious" | "Honeypot",
  "verdict": "One sentence summary explaining the specific threat found in bytecode"
}

**REMEMBER:** You are protecting users from losing their funds. If the bytecode shows ANY ability to drain approved tokens, mark it MALICIOUS immediately. Analyze the COMPLETE bytecode - do not skip sections.`;

    console.log('\n📤 Sending bytecode to OpenAI GPT-4 for analysis...');
    console.log('   Model: gpt-4-turbo-preview');
    console.log('   Temperature: 0.2 (high precision)');

    // Step 3: Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an ELITE blockchain security expert and EVM bytecode analyst. Your PRIMARY mission is to PROTECT USERS from losing funds. You have deep expertise in: EVM opcodes, function selectors, storage patterns, and malicious contract patterns. You MUST be AGGRESSIVE in identifying threats - if a contract CAN drain approved tokens, it IS malicious. Analyze the COMPLETE bytecode thoroughly. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    console.log('✅ OpenAI response received!');
    
    // Step 4: Parse AI response
    const aiResult = JSON.parse(response.choices[0].message.content || '{}');
    
    console.log('\n🧠 AI ANALYSIS COMPLETE:');
    console.log('   Is Malicious:', aiResult.isMalicious ? '❌ YES' : '✅ NO');
    console.log('   Risk Score:', `${aiResult.riskScore}/100`);
    console.log('   Contract Type:', aiResult.contractType);
    console.log('   Verdict:', aiResult.verdict);
    console.log('   Reasons:');
    (aiResult.reasons || []).forEach((reason: string) => {
      console.log(`     - ${reason}`);
    });

    // Step 5: Return structured result
    return {
      isMalicious: aiResult.isMalicious || aiResult.riskScore >= 70,
      riskScore: aiResult.riskScore || 75,
      reasons: aiResult.reasons || ['AI analysis detected suspicious patterns'],
    };

  } catch (error) {
    console.error('\n❌ AI ANALYSIS FAILED:', error);
    
    // Fallback: If AI fails, be cautious
    return {
      isMalicious: false,
      riskScore: 30,
      reasons: [
        'AI analysis service temporarily unavailable',
        'Manual review recommended',
        'Proceeding with caution',
      ],
    };
  }
}
