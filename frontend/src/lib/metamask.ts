import {
  getDeleGatorEnvironment,
  Implementation,
  toMetaMaskSmartAccount,
  createDelegation,
} from '@metamask/delegation-toolkit'
import { createWalletClient, custom, createPublicClient, http, encodeFunctionData } from 'viem'
import { monadTestnet, USER_REGISTRY_ADDRESS, SHIELDAI_DELEGATE_ADDRESS, BACKEND_API_URL } from './constants'

// Create public client for Monad
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
})

// NOTE: Smart account creation is now done inline in onboarding
// using Implementation.Hybrid instead of EIP-7702 approach

/**
 * Create and sign a delegation allowing ShieldAI to revoke approvals
 */
export async function createProtectionDelegation(smartAccount: any) {
  console.log('🔐 Creating delegation...')

  // Create delegation with wildcard scope
  // Using zero address as wildcard = ANY token contract
  // Perfect for your wildcard indexer resolution!
  const delegation = createDelegation({
    from: smartAccount.address,
    to: SHIELDAI_DELEGATE_ADDRESS,
    environment: smartAccount.environment,
    scope: {
      type: 'functionCall',
      targets: ['0x0000000000000000000000000000000000000000'], // Zero address = wildcard for ANY contract
      selectors: ['approve(address,uint256)'], // Only approve function
    },
  })

  console.log('✍️ Signing delegation...')

  // Sign the delegation
  const signature = await smartAccount.signDelegation({ delegation })

  const signedDelegation = {
    ...delegation,
    signature,
  }

  console.log('✅ Delegation signed!')

  return signedDelegation
}

/**
 * Register user in the UserRegistry contract
 */
export async function registerUser(walletClient: any, userAddress: string) {
  console.log('📝 Registering in UserRegistry...')

  const data = encodeFunctionData({
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

  // Send registration transaction using wallet client
  const hash = await walletClient.sendTransaction({
    account: userAddress as `0x${string}`,
    to: USER_REGISTRY_ADDRESS,
    data,
  })

  console.log('⏳ Waiting for registration confirmation...')

  await publicClient.waitForTransactionReceipt({ hash })

  console.log('✅ Registration complete!')
  console.log('Transaction hash:', hash)
  return hash
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
