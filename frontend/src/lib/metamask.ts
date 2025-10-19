import {
  getDeleGatorEnvironment,
  Implementation,
  toMetaMaskSmartAccount,
  createDelegation,
  createExecution,
  ExecutionMode,
} from '@metamask/delegation-toolkit'
import { createCaveatBuilder } from '@metamask/delegation-toolkit/utils'
import { DelegationManager } from '@metamask/delegation-toolkit/contracts'
import { createWalletClient, custom, createPublicClient, http, encodeFunctionData, type Address } from 'viem'
import { createBundlerClient, createPaymasterClient } from 'viem/account-abstraction'
import { monadTestnet, USER_REGISTRY_ADDRESS, SHIELDAI_DELEGATE_ADDRESS, BACKEND_API_URL, PIMLICO_BUNDLER_URL } from './constants'

// Create public client for Monad
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
})

// NOTE: Smart account creation is now done inline in onboarding
// using Implementation.Hybrid instead of EIP-7702 approach

/**
 * Create and sign a delegation allowing ShieldAI to revoke approvals
 * 
 * ARCHITECTURE: Uses nativeTokenTransferAmount scope with maxAmount=0
 * This creates a base delegation, then we add allowedMethods caveat
 * to restrict to ONLY approve(address,uint256) function calls.
 * This allows ShieldAI to call approve() on ANY token contract.
 */
export async function createProtectionDelegation(smartAccount: any) {
  console.log('🔐 Creating delegation...')
  console.log('   From (Smart Account):', smartAccount.address)
  console.log('   To (ShieldAI Delegate):', SHIELDAI_DELEGATE_ADDRESS)

  // Create caveat builder to restrict to ONLY approve function
  const caveatBuilder = createCaveatBuilder(smartAccount.environment)
  
  // Add restriction: ONLY allow calling approve(address,uint256)
  const approveOnlyCaveat = caveatBuilder.addCaveat(
    'allowedMethods',
    {
      selectors: ['approve(address,uint256)'] // ONLY this function
    }
  )

  // Create delegation with minimal scope but restricted by caveat
  // Using nativeTokenTransferAmount with maxAmount=0 as base
  // The caveat further restricts to ONLY approve() calls
  const delegation = createDelegation({
    from: smartAccount.address,
    to: SHIELDAI_DELEGATE_ADDRESS,
    environment: smartAccount.environment,
    scope: {
      type: 'nativeTokenTransferAmount',
      maxAmount: BigInt(0), // No native token transfers allowed
    },
    caveats: approveOnlyCaveat,
  })

  console.log('✍️ Signing delegation...')
  console.log('   Restrictions: ONLY approve(address,uint256) on ANY contract')

  // Sign the delegation
  const signature = await smartAccount.signDelegation({ delegation })

  const signedDelegation = {
    ...delegation,
    signature,
  }

  console.log('✅ Delegation signed and restricted!')

  return signedDelegation
}

/**
 * Register smart account in the UserRegistry contract
 * 
 * USING ERC-4337 USER OPERATIONS via Pimlico bundler!
 * This is the RIGHT way to call functions from a smart account!
 */
export async function registerUser(smartAccount: any, walletClient: any) {
  console.log('📝 Registering SMART ACCOUNT in UserRegistry...')
  console.log('   Smart Account Address:', smartAccount.address)
  
  // Check if already registered first
  const isRegistered = await publicClient.readContract({
    address: USER_REGISTRY_ADDRESS as Address,
    abi: [
      {
        name: 'isRegistered',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ type: 'bool' }],
      },
    ],
    functionName: 'isRegistered',
    args: [smartAccount.address],
  })

  if (isRegistered) {
    console.log('✅ Smart account already registered - skipping!')
    return 'already-registered'
  }

  console.log('   ⚡ Using ERC-4337 User Operations via Pimlico bundler!')

  // 1. Create bundler client
  const bundlerClient = createBundlerClient({
    client: publicClient,
    transport: http(PIMLICO_BUNDLER_URL),
  })

  // 2. Create paymaster client to sponsor gas!
  const paymasterClient = createPaymasterClient({
    transport: http(PIMLICO_BUNDLER_URL), // Same Pimlico endpoint
  })

  console.log('   📦 Bundler client created')
  console.log('   💰 Paymaster client created (gas will be sponsored!)')
  console.log('   🎯 Target: UserRegistry.register()')

  // 3. Encode the register() call
  const registerCalldata = encodeFunctionData({
    abi: [
      {
        name: 'register',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [],
        outputs: [],
      },
    ],
    functionName: 'register',
  })

  console.log('   📝 Calldata:', registerCalldata)

  // 4. Send user operation with paymaster (gasless!)
  console.log('   🚀 Sending GASLESS user operation...')
  console.log('   💰 Paymaster will sponsor ALL gas costs!')
  
  const userOpHash = await bundlerClient.sendUserOperation({
    account: smartAccount,
    calls: [
      {
        to: USER_REGISTRY_ADDRESS,
        data: registerCalldata,
        value: BigInt(0),
      },
    ],
    paymaster: paymasterClient, // ← PAYMASTER SPONSORS GAS! ✅
    // Let viem auto-estimate gas prices for Monad
  })

  console.log('   ⏳ User operation sent! Hash:', userOpHash)
  console.log('   ⏳ Waiting for bundler to include in block...')

  // 5. Wait for user operation receipt
  const receipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  })

  console.log('✅ User operation confirmed!')
  console.log('   TX Hash:', receipt.receipt.transactionHash)
  console.log('   Status:', receipt.success ? 'success' : 'failed')
  console.log('   Registered address:', smartAccount.address)
  
  return receipt.receipt.transactionHash
}

/**
 * Make an unlimited approval FROM smart account using ERC-4337
 * 
 * This is for DEMO purposes - creates a "dangerous" approval that ShieldAI will detect and revoke!
 */
export async function makeUnlimitedApproval(
  smartAccount: any,
  tokenAddress: string,
  spenderAddress: string
) {
  console.log('🎭 Making UNLIMITED approval from smart account...')
  console.log('   Smart Account:', smartAccount.address)
  console.log('   Token:', tokenAddress)
  console.log('   Spender:', spenderAddress)
  console.log('   Amount: UNLIMITED (type(uint256).max)')

  // 1. Create bundler client
  const bundlerClient = createBundlerClient({
    client: publicClient,
    transport: http(PIMLICO_BUNDLER_URL),
  })

  // 2. Create paymaster client
  const paymasterClient = createPaymasterClient({
    transport: http(PIMLICO_BUNDLER_URL),
  })

  console.log('   📦 Bundler + Paymaster clients created')

  // 3. Encode approve(spender, uint256.max)
  const approveCalldata = encodeFunctionData({
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
    args: [
      spenderAddress as Address,
      BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'), // max uint256
    ],
  })

  console.log('   📝 Encoded approve(spender, MAX) calldata')

  // 4. Send user operation with paymaster
  console.log('   🚀 Sending approval user operation...')
  
  const userOpHash = await bundlerClient.sendUserOperation({
    account: smartAccount,
    calls: [
      {
        to: tokenAddress as Address,
        data: approveCalldata,
        value: BigInt(0),
      },
    ],
    paymaster: paymasterClient,
  })

  console.log('   ⏳ User operation sent! Hash:', userOpHash)
  console.log('   ⏳ Waiting for bundler to include in block...')

  // 5. Wait for confirmation
  const receipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  })

  console.log('✅ Approval user operation confirmed!')
  console.log('   TX Hash:', receipt.receipt.transactionHash)
  console.log('   Status:', receipt.success ? 'success' : 'failed')
  console.log('')
  console.log('⚠️  ShieldAI should now detect this and automatically revoke it!')
  
  return receipt.receipt.transactionHash
}

/**
 * Store delegation in backend
 */
export async function storeDelegation(userAddress: string, signedDelegation: any) {
  console.log('💾 Storing delegation in backend...')

  const response = await fetch(`${BACKEND_API_URL}/api/delegation/store`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userAddress,
      delegation: signedDelegation,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to store delegation')
  }

  console.log('✅ Delegation stored!')

  return response.json()
}
