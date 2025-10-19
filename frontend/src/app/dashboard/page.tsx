'use client'

import { useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { ApprovalCard } from '@/components/ApprovalCard'
import { DemoSection } from '@/components/DemoSection'
import { Header } from '@/components/Header'
import type { UserApprovalsData } from '@/types/graphql'

const USER_APPROVALS_SUBSCRIPTION = gql`
  subscription UserApprovals($userAddress: String!) {
    CurrentApproval(
      where: { owner: { _eq: $userAddress }, isRevocation: { _eq: false } }
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

  // Get SMART ACCOUNT address from localStorage (not EOA!)
  const smartAccountAddress = typeof window !== 'undefined' 
    ? localStorage.getItem('shieldai_smart_account')?.toLowerCase()
    : null

  const eoaAddress = wallets[0]?.address?.toLowerCase()

  // Use smart account address for monitoring approvals
  const { data, loading, error } = useSubscription<UserApprovalsData>(USER_APPROVALS_SUBSCRIPTION, {
    variables: { userAddress: smartAccountAddress || '' },
    skip: !smartAccountAddress,
  })

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
        onLogout={logout} 
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
      </main>
    </div>
  )
}
