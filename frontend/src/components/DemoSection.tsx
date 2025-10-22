'use client'

import { useState } from 'react'
import { Zap, Loader2 } from 'lucide-react'
import { createWalletClient, custom, createPublicClient, http } from 'viem'
import { Implementation, toMetaMaskSmartAccount } from '@metamask/delegation-toolkit'
import { makeUnlimitedApproval, makeLimitedApproval } from '@/lib/metamask'
import { CHAIN } from '@/lib/constants'

interface DemoSectionProps {
  userAddress: string
}

// Demo contracts deployed on Base
const DEMO_TOKEN_ADDRESS = '0x8Fcc4B343cCE5F467FcCC8cdBfe25634a575A685' // Shield Demo Token
const SUSPICIOUS_SPENDER = '0x1234567890123456789012345678901234567890' // Random address
const MALICIOUS_CONTRACT = '0x9BDD2cB47Cbd216DC129310C9e5BEE48C7025976' // Malicious contract on Base

export function DemoSection({ userAddress }: DemoSectionProps) {
  const [loading1, setLoading1] = useState(false)
  const [error1, setError1] = useState('')
  const [success1, setSuccess1] = useState(false)
  
  const [loading2, setLoading2] = useState(false)
  const [error2, setError2] = useState('')
  const [success2, setSuccess2] = useState(false)

  const createMockApproval = async () => {
    if (!window.ethereum) {
      setError1('MetaMask not found')
      return
    }

    setLoading1(true)
    setError1('')
    setSuccess1(false)

    try {
      console.log('🎭 Creating unlimited approval from SMART ACCOUNT...')
      console.log('   Smart Account Address:', userAddress)

      // 1. Get EOA address from MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
      const eoaAddress = accounts[0]
      
      console.log('   EOA Owner:', eoaAddress)

      // 2. Create wallet client with EOA account
      const walletClient = createWalletClient({
        account: eoaAddress as `0x${string}`,
        chain: CHAIN,
        transport: custom(window.ethereum),
      })

      // 3. Create public client
      const publicClient = createPublicClient({
        chain: CHAIN,
        transport: http(),
      })

      // 4. Recreate smart account instance
      console.log('   Recreating smart account instance...')
      const smartAccount = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        address: userAddress as `0x${string}`, // Smart account address
        signer: { walletClient }, // EOA wallet client
      })

      console.log('   ✅ Smart account ready!')

      // 4. Make unlimited approval via ERC-4337 user operation
      const txHash = await makeUnlimitedApproval(
        smartAccount,
        DEMO_TOKEN_ADDRESS,
        SUSPICIOUS_SPENDER
      )

      console.log('✅ Unlimited approval created!')
      console.log('   TX Hash:', txHash)
      setSuccess1(true)

      // The approval will be:
      // 1. Caught by Envio indexer (monitors smart account address)
      // 2. Stored in CurrentApproval
      // 3. Sent to backend webhook for threat detection
      // 4. AI detects: UNLIMITED approval = THREAT!
      // 5. Backend redeems delegation to revoke
      // 6. UI shows it turn red via GraphQL subscription! 🛡️
    } catch (err: any) {
      console.error('❌ Demo approval failed:', err)
      setError1(err.message || 'Failed to create approval')
    } finally {
      setLoading1(false)
    }
  }

  const createMaliciousApproval = async () => {
    if (!window.ethereum) {
      setError2('MetaMask not found')
      return
    }

    setLoading2(true)
    setError2('')
    setSuccess2(false)

    try {
      console.log('🎭 Creating unlimited approval to MALICIOUS CONTRACT...')
      console.log('   Smart Account Address:', userAddress)

      // 1. Get EOA address from MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
      const eoaAddress = accounts[0]
      
      console.log('   EOA Owner:', eoaAddress)

      // 2. Create wallet client with EOA account
      const walletClient = createWalletClient({
        account: eoaAddress as `0x${string}`,
        chain: CHAIN,
        transport: custom(window.ethereum),
      })

      // 3. Create public client
      const publicClient = createPublicClient({
        chain: CHAIN,
        transport: http(),
      })

      // 4. Recreate smart account instance
      console.log('   Recreating smart account instance...')
      const smartAccount = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        address: userAddress as `0x${string}`,
        signer: { walletClient },
      })

      console.log('   ✅ Smart account ready!')

      // 5. Approve LIMITED amount (69420 USDC) to MALICIOUS CONTRACT
      // This triggers AI bytecode analysis!
      const approvalAmount = BigInt(69420) * BigInt(10 ** 6) // 69,420 USDC (6 decimals)
      
      const txHash = await makeLimitedApproval(
        smartAccount,
        DEMO_TOKEN_ADDRESS,
        MALICIOUS_CONTRACT, // AI will analyze this contract's bytecode!
        approvalAmount
      )

      console.log('✅ Limited approval (69,420 USDC) to malicious contract created!')
      console.log('   TX Hash:', txHash)
      setSuccess2(true)

      // AI will analyze bytecode and detect:
      // - Unrestricted transferFrom calls
      // - Owner-only drain functions
      // - Hidden backdoors
      // - Risk Score: 95/100 → AUTO-REVOKE! 🔥
    } catch (err: any) {
      console.error('❌ Malicious approval failed:', err)
      setError2(err.message || 'Failed to create approval')
    } finally {
      setLoading2(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">🎬 Demo Mode</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Demo Card 1: Random Suspicious Address */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Test #1: Random Address</h3>
              <p className="text-sm text-gray-700">
                Approve to suspicious EOA
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 mb-4">
            <h4 className="font-semibold mb-2 text-xs text-gray-900">What happens:</h4>
            <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
              <li>Unlimited approval to random address</li>
              <li>AI detects: EOA (not a contract)</li>
              <li>Auto-revoked immediately</li>
              <li>Watch it turn red! 🔥</li>
            </ol>
          </div>

          {error1 && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
              {error1}
            </div>
          )}

          {success1 && (
            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg text-green-600 text-xs">
              ✅ Created! Watch ShieldAI revoke it...
            </div>
          )}

          <button
            onClick={createMockApproval}
            disabled={loading1 || !userAddress}
            className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading1 && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading1 ? 'Creating...' : 'Approve UNLIMITED USDC'}
          </button>

          <p className="mt-2 text-xs text-gray-600 text-center">
            Spender: {SUSPICIOUS_SPENDER.slice(0, 10)}...
          </p>
        </div>

        {/* Demo Card 2: Malicious Contract */}
        <div className="bg-gradient-to-br from-red-50 to-orange-100 border-2 border-red-300 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Test #2: Malicious Contract</h3>
              <p className="text-sm text-gray-700">
                AI analyzes bytecode 🤖
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 mb-4">
            <h4 className="font-semibold mb-2 text-xs text-gray-900">What happens:</h4>
            <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
              <li>Approve 69,420 USDC to malicious contract</li>
              <li>AI fetches & analyzes bytecode</li>
              <li>Detects: drain functions, backdoors</li>
              <li>Risk Score: 95/100 → REVOKED! 🔥</li>
            </ol>
          </div>

          {error2 && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
              {error2}
            </div>
          )}

          {success2 && (
            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg text-green-600 text-xs">
              ✅ Created! AI is analyzing bytecode...
            </div>
          )}

          <button
            onClick={createMaliciousApproval}
            disabled={loading2 || !userAddress}
            className="w-full px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading2 && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading2 ? 'Creating...' : 'Approve 69,420 USDC (AI Test)'}
          </button>

          <p className="mt-2 text-xs text-gray-600 text-center">
            Spender: {MALICIOUS_CONTRACT.slice(0, 10)}...
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 text-center">
          <strong>💡 Pro Tip:</strong> These create real on-chain transactions. ShieldAI will detect and auto-revoke them in seconds!
        </p>
      </div>
    </div>
  )
}
