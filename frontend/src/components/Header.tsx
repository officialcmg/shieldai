'use client'

import { Shield, LogOut, User, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  user: any
  onLogout: () => void
  smartAccountAddress?: string | null
  eoaAddress?: string
}

export function Header({ user, onLogout, smartAccountAddress, eoaAddress }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Shield<span className="text-purple-600">AI</span>
            </span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Shield className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="text-xs text-gray-500">Smart Account</div>
                <div className="text-sm font-medium text-gray-900 font-mono">
                  {smartAccountAddress ? 
                    `${smartAccountAddress.slice(0, 6)}...${smartAccountAddress.slice(-4)}` :
                    'Not Created'
                  }
                </div>
              </div>
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                {/* Smart Account Section */}
                {smartAccountAddress && (
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Smart Account</div>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs text-gray-900 font-mono break-all">{smartAccountAddress}</code>
                      <button
                        onClick={() => copyAddress(smartAccountAddress)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                        title="Copy address"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* EOA Section */}
                {eoaAddress && (
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">EOA (Owner)</div>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs text-gray-600 font-mono break-all">{eoaAddress}</code>
                      <button
                        onClick={() => copyAddress(eoaAddress)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                        title="Copy address"
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    onLogout()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
