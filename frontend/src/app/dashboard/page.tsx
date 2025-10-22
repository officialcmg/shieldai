'use client'

import { useEffect, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { ApprovalCard } from '@/components/ApprovalCard'
import { DemoSection } from '@/components/DemoSection'
import { Header } from '@/components/Header'
import type { UserApprovalsData } from '@/types/graphql'
import { registerUser, unregisterUser } from '@/lib/metamask'
import { Implementation, toMetaMaskSmartAccount } from '@metamask/delegation-toolkit'
import { createWalletClient, custom, createPublicClient, http } from 'viem'
import { CHAIN } from '@/lib/constants'

const USER_APPROVALS_SUBSCRIPTION = gql`
  subscription UserApprovals($userAddress: String!) {
    CurrentApproval(
      where: { owner: { _eq: $userAddress } }
      order_by: { timestamp: desc }
    ) {
      id
      owner
      tokenAddress
      spender
      amount
      isRevocation
      timestamp
      blockNumber
    }
  }
`

export default function DashboardPage() {
  const { authenticated, user, logout } = usePrivy()
  const { wallets } = useWallets()
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [isUnregistering, setIsUnregistering] = useState(false)
  const [registryStatus, setRegistryStatus] = useState<string>('')

  // Get SMART ACCOUNT address from localStorage (not EOA!)
  const smartAccountAddress = typeof window !== 'undefined' 
    ? localStorage.getItem('shieldai_smart_account')?.toLowerCase()
    : null

  const eoaAddress = wallets[0]?.address?.toLowerCase()

  // Handle logout with localStorage cleanup
  const handleLogout = async () => {
    console.log('🚪 Logging out and clearing localStorage...')
    
    // Clear ShieldAI localStorage items
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shieldai_onboarding_complete')
      localStorage.removeItem('shieldai_smart_account')
      console.log('✅ Cleared shieldai_onboarding_complete')
      console.log('✅ Cleared shieldai_smart_account')
    }
    
    // Call Privy logout
    await logout()
    console.log('✅ Logged out from Privy')
  }

  // Use smart account address for monitoring approvals
  const { data, loading, error } = useSubscription<UserApprovalsData>(USER_APPROVALS_SUBSCRIPTION, {
    variables: { userAddress: smartAccountAddress || '' },
    skip: !smartAccountAddress,
  })

  // Handle register
  const handleRegister = async () => {
    if (!smartAccountAddress || !wallets[0]) {
      alert('Smart account not found. Please complete onboarding first.')
      return
    }

    setIsRegistering(true)
    setRegistryStatus('')

    try {
      const provider = await wallets[0].getEthereumProvider()
      
      const walletClient = createWalletClient({
        account: wallets[0].address as `0x${string}`,
        chain: CHAIN,
        transport: custom(provider),
      })

      const publicClient = createPublicClient({
        chain: CHAIN,
        transport: http(),
      })

      const smartAccount = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        address: smartAccountAddress as `0x${string}`,
        signer: { walletClient },
      })

      const result = await registerUser(smartAccount, walletClient)
      
      if (result === 'already-registered') {
        setRegistryStatus('✅ Already registered!')
      } else {
        setRegistryStatus(`✅ Registered! TX: ${result}`)
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setRegistryStatus(`❌ Error: ${error.message}`)
    } finally {
      setIsRegistering(false)
    }
  }

  // Handle unregister
  const handleUnregister = async () => {
    if (!smartAccountAddress || !wallets[0]) {
      alert('Smart account not found. Please complete onboarding first.')
      return
    }

    setIsUnregistering(true)
    setRegistryStatus('')

    try {
      const provider = await wallets[0].getEthereumProvider()
      
      const walletClient = createWalletClient({
        account: wallets[0].address as `0x${string}`,
        chain: CHAIN,
        transport: custom(provider),
      })

      const publicClient = createPublicClient({
        chain: CHAIN,
        transport: http(),
      })

      const smartAccount = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        address: smartAccountAddress as `0x${string}`,
        signer: { walletClient },
      })

      const result = await unregisterUser(smartAccount, walletClient)
      
      if (result === 'not-registered') {
        setRegistryStatus('⚠️  Not registered!')
      } else {
        setRegistryStatus(`✅ Unregistered! TX: ${result}`)
      }
    } catch (error: any) {
      console.error('Unregistration error:', error)
      setRegistryStatus(`❌ Error: ${error.message}`)
    } finally {
      setIsUnregistering(false)
    }
  }

  // Redirect to home if not authenticated (no hydration error!)
  useEffect(() => {
    if (!authenticated) {
      router.push('/')
    }
  }, [authenticated, router])

  // Show loading while checking auth
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        smartAccountAddress={smartAccountAddress}
        eoaAddress={eoaAddress}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Approvals</h1>
          <p className="text-gray-700 mt-2">
            Monitor and manage your token approvals in real-time
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-700 font-medium">Loading approvals...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <p className="text-red-600">Error loading approvals: {error.message}</p>
          </div>
        )}

        {/* Approvals List */}
        {!loading && !error && (
          <>
            {data?.CurrentApproval && data.CurrentApproval.length > 0 ? (
              <div className="space-y-4 mb-8">
                {data.CurrentApproval.map((approval: any) => (
                  <ApprovalCard
                    key={approval.id}
                    tokenAddress={approval.tokenAddress}
                    spender={approval.spender}
                    amount={approval.amount}
                    isRevoked={approval.isRevocation}
                    timestamp={approval.timestamp}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center mb-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">No Active Approvals</h3>
                <p className="text-gray-700">
                  You don't have any active token approvals. You're safe!
                </p>
              </div>
            )}
          </>
        )}

        {/* Demo Section */}
        <DemoSection userAddress={smartAccountAddress || ''} />

        {/* Register/Unregister Section */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Registry Testing</h3>
          <p className="text-gray-700 mb-6">
            Test registering and unregistering your smart account from the UserRegistry contract.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={handleRegister}
              disabled={isRegistering || !smartAccountAddress}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isRegistering ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering...
                </span>
              ) : (
                'Register'
              )}
            </button>

            <button
              onClick={handleUnregister}
              disabled={isUnregistering || !smartAccountAddress}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isUnregistering ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Unregistering...
                </span>
              ) : (
                'Unregister'
              )}
            </button>
          </div>

          {registryStatus && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-mono text-gray-900 break-all">{registryStatus}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
