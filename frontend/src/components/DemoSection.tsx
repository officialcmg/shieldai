'use client'

import { useState } from 'react'
import { Zap, Loader2 } from 'lucide-react'
import { createWalletClient, custom, encodeFunctionData, maxUint256 } from 'viem'
import { monadTestnet } from '@/lib/constants'

interface DemoSectionProps {
  userAddress: string
}

// Mock ERC20 token for demo
// Using USDC- address 
const DEMO_TOKEN_ADDRESS = '0x62534e4bbd6d9ebac0ac99aeaa0aa48e56372df0' // Placeholder - deploy test token!
const SUSPICIOUS_SPENDER = '0x1234567890123456789012345678901234567890' // Random address

export function DemoSection({ userAddress }: DemoSectionProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const createMockApproval = async () => {
    if (!window.ethereum) {
      setError('MetaMask not found')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const walletClient = createWalletClient({
        account: userAddress as `0x${string}`,
        chain: monadTestnet,
        transport: custom(window.ethereum),
      })

      console.log('Creating unlimited approval...')

      // Encode approve function call
      const data = encodeFunctionData({
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
        args: [SUSPICIOUS_SPENDER, maxUint256],
      })

      // Send transaction
      const hash = await walletClient.sendTransaction({
        to: DEMO_TOKEN_ADDRESS as `0x${string}`,
        data,
      })

      console.log('Transaction sent:', hash)
      setSuccess(true)

      // The approval will be:
      // 1. Caught by Envio indexer
      // 2. Stored in CurrentApproval
      // 3. Sent to backend for threat detection
      // 4. Auto-revoked by ShieldAI!
      // 5. UI will show it turn red via subscription
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to create approval')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">🎬 Demo Mode</h3>
          <p className="text-gray-700">
            Create a real unlimited token approval to see ShieldAI in action!
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-semibold mb-2 text-sm text-gray-900">What happens:</h4>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>You approve unlimited tokens to a suspicious address</li>
          <li>ShieldAI detects the threat in real-time</li>
          <li>The approval is automatically revoked</li>
          <li>You see it turn red in your dashboard!</li>
        </ol>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          ✅ Approval created! Watch it get revoked by ShieldAI...
        </div>
      )}

      <button
        onClick={createMockApproval}
        disabled={loading || !userAddress}
        className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {loading ? 'Creating Approval...' : 'Create Mock Unlimited Approval'}
      </button>

      <p className="mt-3 text-xs text-gray-600 text-center font-medium">
        This creates a real on-chain transaction that ShieldAI will detect and revoke
      </p>
    </div>
  )
}
