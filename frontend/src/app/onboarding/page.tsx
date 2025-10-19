'use client'

import { useState, useEffect } from 'react'
import { usePrivy, useWallets, useSign7702Authorization } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { Shield, CheckCircle2, Loader2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { createWalletClient, custom, createPublicClient, http } from 'viem'
import { monadTestnet } from '@/lib/constants'
import { Implementation, toMetaMaskSmartAccount } from '@metamask/delegation-toolkit'
import {
  createProtectionDelegation,
  registerUser,
  storeDelegation,
} from '@/lib/metamask'
import { Header } from '@/components/Header'

type Step = 1 | 2 | 3 | 4

export default function OnboardingPage() {
  const { authenticated, user, logout } = usePrivy()
  const { wallets } = useWallets()
  const { signAuthorization } = useSign7702Authorization()
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Handle logout with localStorage cleanup
  const handleLogout = async () => {
    console.log('🚪 Logging out from onboarding...')
    
    // Clear ShieldAI localStorage items
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shieldai_onboarding_complete')
      localStorage.removeItem('shieldai_smart_account')
      console.log('✅ Cleared localStorage')
    }
    
    // Call Privy logout
    await logout()
    console.log('✅ Logged out - redirecting to home')
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')
    try {
      const userAddress = wallets[0]?.address
      if (!userAddress) throw new Error('No wallet found')

      console.log('🔧 Creating MetaMask Hybrid Smart Account...')
      console.log('Using Privy wallet:', userAddress)

      // Create public client for reading blockchain state
      const publicClient = createPublicClient({
        chain: monadTestnet,
        transport: http(),
      })

      // Create wallet client using Privy's provider
      const walletClient = createWalletClient({
        account: userAddress as `0x${string}`,
        chain: monadTestnet,
        transport: custom(window.ethereum),
      })

      console.log('📝 Getting wallet addresses...')
      const addresses = await walletClient.getAddresses()
      const owner = addresses[0]

      console.log('✨ Creating Hybrid Smart Account...')
      console.log('   EOA Owner:', owner)
      console.log('   This creates a NEW smart account address')
      console.log('   Use THIS address for approvals to enable ShieldAI protection!')

      // Step 1: Create smart account instance
      const smartAccount = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [owner, [], [], []],
        deploySalt: '0x',
        signer: { walletClient },
      })

      console.log('   Computed Smart Account Address:', smartAccount.address)
      console.log('')
      console.log('🚀 Deploying smart account via factory...')
      
      // Step 2: Check if already deployed
      let code = await publicClient.getCode({ address: smartAccount.address as `0x${string}` })
      
      if (code && code !== '0x') {
        console.log('✅ Smart account already deployed!')
        console.log('   Skipping deployment...')
      } else {
        console.log('   Account not deployed yet - deploying now...')
        
        // Get factory deployment args (OFFICIAL DOCS METHOD)
        const factoryArgs = await smartAccount.getFactoryArgs()
        
        console.log('   Factory Args:', factoryArgs)
        console.log('   Factory:', factoryArgs?.factory)
        console.log('   Factory Data:', factoryArgs?.factoryData)
        
        if (!factoryArgs || !factoryArgs.factory) {
          throw new Error('Cannot get factory args - account may not support factory deployment')
        }
        
        const { factory, factoryData } = factoryArgs
        
        console.log('   Factory:', factory)
        console.log('   Factory Data Length:', factoryData?.length || 0, 'bytes')
        
        // Step 3: Deploy via factory
        const deployTxHash = await walletClient.sendTransaction({
          account: owner as `0x${string}`,
          to: factory,
          data: factoryData,
          chain: monadTestnet,
        })
        
        console.log('⏳ Waiting for deployment...')
        console.log('   TX:', deployTxHash)
        
        await publicClient.waitForTransactionReceipt({ hash: deployTxHash })
        
        console.log('✅ Smart Account DEPLOYED on-chain!')
        
        // Verify deployment
        code = await publicClient.getCode({ address: smartAccount.address as `0x${string}` })
        console.log('   Code Length:', code?.length || 0, 'bytes')
        
        if (!code || code === '0x') {
          throw new Error('Smart account deployment failed - no code at address')
        }
      }
      
      console.log('🎉 Hybrid Smart Account Ready!')
      console.log('⚠️  IMPORTANT: Use address', smartAccount.address, 'for all transactions!')
      console.log('   This is your SMART ACCOUNT address, not your EOA')
      
      // Store smart account address for next steps
      localStorage.setItem('shieldai_smart_account', smartAccount.address)
      
      setStep(3)
    } catch (err: any) {
      console.error('❌ Smart Account creation failed:', err)
      setError(err.message || 'Failed to create smart account')
    } finally {
      setLoading(false)
    }
  }

  const handleProtection = async () => {
    setLoading(true)
    setError('')
    try {
      const userAddress = wallets[0]?.address
      if (!userAddress) throw new Error('No wallet found')

      // Get the smart account we created in Step 2
      const smartAccountAddress = localStorage.getItem('shieldai_smart_account')
      if (!smartAccountAddress) {
        throw new Error('Smart account not found. Please go back to Step 2.')
      }

      console.log('🔐 Setting up protection with smart account...')
      console.log('Smart Account:', smartAccountAddress)

      // Create public and wallet clients
      const publicClient = createPublicClient({
        chain: monadTestnet,
        transport: http(),
      })

      const walletClient = createWalletClient({
        account: userAddress as `0x${string}`,
        chain: monadTestnet,
        transport: custom(window.ethereum),
      })

      // Recreate the smart account instance (Hybrid)
      console.log('🔄 Recreating smart account instance...')
      const smartAccount = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        address: smartAccountAddress as `0x${string}`,
        signer: { walletClient },
      })

      console.log('✅ Smart account ready!')

      // Step 1: Create delegation for ShieldAI
      console.log('📜 Creating protection delegation...')
      const signedDelegation = await createProtectionDelegation(smartAccount)
      console.log('✅ Delegation created!')

      // Step 2: Store delegation in backend (KEYED BY SMART ACCOUNT ADDRESS!)
      console.log('💾 Storing delegation in backend...')
      console.log('   Using Smart Account Address as key:', smartAccount.address)
      await storeDelegation(smartAccount.address, signedDelegation)
      console.log('✅ Delegation stored!')

      // Step 3: Register SMART ACCOUNT in UserRegistry
      console.log('📝 Registering SMART ACCOUNT in UserRegistry...')
      await registerUser(smartAccount, walletClient)
      console.log('✅ Smart Account registered on-chain!')

      // Mark onboarding as complete
      localStorage.setItem('shieldai_onboarding_complete', 'true')

      console.log('🎉 All done! You are now protected!')

      setStep(4)
      // Trigger confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } catch (err: any) {
      console.error('❌ Protection setup failed:', err)
      setError(err.message || 'Failed to set up protection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <Header 
        user={user} 
        onLogout={handleLogout}
        smartAccountAddress={null}
        eoaAddress={wallets[0]?.address}
      />
      <div className="flex items-center justify-center p-4 pt-8">
        <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {step} of 4
            </span>
            <span className="text-sm text-gray-700">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-gray-900">Welcome to ShieldAI!</h2>
                <p className="text-gray-700">
                  Let's set up your AI-powered wallet protection
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
              >
                Get Started →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-gray-900">Create MetaMask Smart Account</h2>
                <p className="text-gray-700 mb-6">
                  Enable AI-powered protection with advanced account features
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6 text-left">
                  <h3 className="font-semibold mb-3 text-gray-900">Benefits:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">AI-powered threat detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Auto-revoke malicious approvals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">You keep full control of your wallet</span>
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-gray-600 font-medium mb-6">
                  ⚡ Creates a Hybrid Smart Account (gasless transactions + delegations)
                </p>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Creating...' : 'Create Smart Account'}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-gray-900">Grant Protection Powers</h2>
                <p className="text-gray-700 mb-6">
                  Allow ShieldAI to protect you from threats
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6 text-left">
                  <h3 className="font-semibold mb-3 text-gray-900">ShieldAI can:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Monitor your token approvals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Revoke malicious approvals instantly</span>
                    </li>
                  </ul>
                  <h3 className="font-semibold mt-4 mb-3 text-gray-900">You retain:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Full control of your wallet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Ability to revoke protection anytime</span>
                    </li>
                  </ul>
                </div>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleProtection}
                disabled={loading}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Setting up...' : 'Grant Protection'}
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-gray-900">You're Protected! 🎉</h2>
                <p className="text-gray-700 mb-8">
                  ShieldAI is now guarding your wallet
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Go to Dashboard →
                </button>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
