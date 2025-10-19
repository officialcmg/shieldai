'use client'

import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { login, ready, authenticated } = usePrivy()
  const router = useRouter()

  // Smart routing - check if user completed onboarding
  useEffect(() => {
    if (authenticated) {
      // Check localStorage for onboarding completion
      const hasCompletedOnboarding = localStorage.getItem('shieldai_onboarding_complete')
      
      if (hasCompletedOnboarding === 'true') {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    }
  }, [authenticated, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-2xl mb-6">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Shield<span className="text-purple-600">AI</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Your AI-Powered Wallet Guardian
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Protect yourself from malicious token approvals with real-time threat detection
            powered by EIP-7702 & MetaMask Delegation
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-16">
          <button
            onClick={login}
            disabled={!ready}
            className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            Get Protected →
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">AI Detection</h3>
            <p className="text-gray-700">
              ML-powered threat scans analyze every approval in real-time
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Instant Protection</h3>
            <p className="text-gray-700">
              Auto-revoke malicious approvals in seconds, not hours
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Your Keys</h3>
            <p className="text-gray-700">
              Self-custody via EIP-7702, you're always in control
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="font-medium">Connect Wallet</span>
            </div>
            <div className="hidden md:block">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="font-medium">Grant Protection</span>
            </div>
            <div className="hidden md:block">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="font-medium">Stay Safe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
