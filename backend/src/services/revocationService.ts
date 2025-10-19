import { createWalletClient, http, encodeFunctionData, type Address, createPublicClient, zeroAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createBundlerClient, createPaymasterClient } from 'viem/account-abstraction';
import { createExecution, ExecutionMode, getDeleGatorEnvironment, Implementation, toMetaMaskSmartAccount } from '@metamask/delegation-toolkit';
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

// Pimlico bundler URL
const PIMLICO_BUNDLER_URL = `https://api.pimlico.io/v2/${MONAD_TESTNET.id}/rpc?apikey=${process.env.PIMLICO_API_KEY}`;

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

  // Step 2: Create clients
  const account = privateKeyToAccount(process.env.SHIELD_AI_PRIVATE_KEY as `0x${string}`);
  
  const walletClient = createWalletClient({
    account,
    chain: MONAD_TESTNET,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: MONAD_TESTNET,
    transport: http(),
  });

  // Create bundler and paymaster clients
  const bundlerClient = createBundlerClient({
    client: publicClient,
    transport: http(PIMLICO_BUNDLER_URL),
  });

  const paymasterClient = createPaymasterClient({
    transport: http(PIMLICO_BUNDLER_URL),
  });

  console.log(`   ShieldAI EOA: ${account.address}`);
  console.log(`   💰 Using Pimlico paymaster for gasless revocation!`);

  // Step 3: Check if EOA is already upgraded to smart account
  console.log(`   🔍 Checking if EOA is already upgraded...`);
  const code = await publicClient.getCode({ address: account.address });
  
  if (!code || code === '0x' || code === '0x0') {
    // EOA not upgraded yet, authorize EIP-7702 delegation
    console.log(`   🔐 EOA not upgraded yet, authorizing EIP-7702 delegation...`);
    const environment = getDeleGatorEnvironment(MONAD_TESTNET.id);
    const contractAddress = environment.implementations.EIP7702StatelessDeleGatorImpl;

    const authorization = await walletClient.signAuthorization({
      account,
      contractAddress,
      executor: 'self',
    });

    // Submit the authorization (upgrade the EOA)
    console.log(`   📤 Submitting EIP-7702 authorization...`);
    const authHash = await walletClient.sendTransaction({
      authorizationList: [authorization],
      data: '0x',
      to: zeroAddress,
    });

    console.log(`   ✅ EOA upgraded to smart account! TX: ${authHash}`);
  } else {
    console.log(`   ✅ EOA already upgraded to smart account (persistent)`);
  }
  
  console.log(`   📍 ShieldAI Smart Account Address (same as EOA): ${account.address}`);

  // Step 5: Create ShieldAI smart account instance (using SAME address as EOA)
  console.log(`   🏗️  Creating smart account instance...`);
  const shieldAISmartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Stateless7702, // ← EIP-7702!
    address: account.address, // ← SAME address as EOA!
    signer: { walletClient },
  });

  console.log(`   ✅ Smart account ready: ${shieldAISmartAccount.address}`);

  // Step 6: Create execution to revoke approval (set approval to 0)
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

  // Step 7: Create execution to revoke approval
  const execution = createExecution({
    target: tokenAddress as Address,
    value: BigInt(0),
    callData: revokeCalldata,
  });

  // Step 8: Prepare redemption calldata
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

  // Step 9: Send user operation with paymaster (GASLESS!)
  console.log(`   🚀 Sending GASLESS revocation via ERC-4337...`);
  
  const userOpHash = await bundlerClient.sendUserOperation({
    account: shieldAISmartAccount,
    calls: [
      {
        to: shieldAISmartAccount.address,
        data: redeemCalldata,
        value: BigInt(0),
      },
    ],
    paymaster: paymasterClient, // ← PAYMASTER SPONSORS GAS!
    factory: undefined, // EIP-7702 accounts don't use factory deployment
    factoryData: undefined, // Already deployed via authorization
  });

  console.log(`   User operation sent: ${userOpHash}`);
  console.log(`   Waiting for confirmation...`);

  // Step 10: Wait for user operation receipt
  const receipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  console.log(`   ✅ Revocation confirmed!`);
  console.log(`   TX Hash: ${receipt.receipt.transactionHash}`);

  return receipt.receipt.transactionHash;
}
