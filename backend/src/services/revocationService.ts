import { createWalletClient, http, encodeFunctionData, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createExecution, ExecutionMode, getDeleGatorEnvironment } from '@metamask/delegation-toolkit';
import { DelegationManager } from '@metamask/delegation-toolkit/contracts';
import { getDelegation } from '../db/delegations.js';

// Monad testnet configuration
const MONAD_TESTNET = {
  id: 10143,
  name: 'Monad Testnet',
  rpcUrls: {
    default: { http: [process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'] },
  },
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
};

interface RevokeParams {
  userAddress: string;
  tokenAddress: string;
  spender: string;
}

/**
 * Revoke a token approval on behalf of a user using their delegation
 */
export async function revokeApproval(params: RevokeParams): Promise<string> {
  const { userAddress, tokenAddress, spender } = params;

  console.log(`\n🔐 Preparing revocation transaction...`);

  // Step 1: Get user's stored delegation
  const delegation = await getDelegation(userAddress.toLowerCase());
  if (!delegation) {
    throw new Error(`No delegation found for user ${userAddress}`);
  }

  // Step 2: Create wallet client for ShieldAI backend
  const account = privateKeyToAccount(process.env.SHIELD_AI_PRIVATE_KEY as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: MONAD_TESTNET,
    transport: http(),
  });

  console.log(`   ShieldAI wallet: ${account.address}`);

  // Step 3: Create execution to revoke approval (set approval to 0)
  const revokeCalldata = encodeFunctionData({
    abi: [
      {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ type: 'bool' }],
      },
    ],
    functionName: 'approve',
    args: [spender as Address, BigInt(0)], // Set approval to 0
  });

  const execution = createExecution({
    target: tokenAddress as Address,
    value: BigInt(0),
    callData: revokeCalldata,
  });

  // Step 4: Get DelegationManager address
  const environment = getDeleGatorEnvironment(MONAD_TESTNET.id);
  const delegationManagerAddress = environment.DelegationManager;

  console.log(`   DelegationManager: ${delegationManagerAddress}`);

  // Step 5: Prepare redemption calldata
  // Convert delegation to proper format with Address types
  const typedDelegation = {
    delegate: delegation.delegate as Address,
    delegator: delegation.delegator as Address,
    authority: delegation.authority as Address,
    caveats: delegation.caveats,
    salt: delegation.salt as `0x${string}`,
    signature: delegation.signature as `0x${string}`,
  };

  const redeemCalldata = DelegationManager.encode.redeemDelegations({
    delegations: [[typedDelegation]],
    modes: [ExecutionMode.SingleDefault],
    executions: [[execution]],
  });

  // Step 6: Send transaction
  console.log(`   Sending revocation transaction...`);
  
  const txHash = await walletClient.sendTransaction({
    to: delegationManagerAddress,
    data: redeemCalldata,
    chain: MONAD_TESTNET,
  });

  console.log(`   Transaction sent: ${txHash}`);

  return txHash;
}
