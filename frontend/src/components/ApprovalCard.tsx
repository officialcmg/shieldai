'use client'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApprovalCardProps {
  tokenAddress: string
  spender: string
  amount: string
  isRevoked: boolean
  timestamp: string
}

export function ApprovalCard({
  tokenAddress,
  spender,
  amount,
  isRevoked,
  timestamp,
}: ApprovalCardProps) {
  const date = new Date(Number(timestamp) * 1000)

  return (
    <motion.div
      animate={{
        borderColor: isRevoked ? '#EF4444' : '#10B981',
        backgroundColor: isRevoked ? '#FEE2E2' : '#F0FDF4',
      }}
      transition={{ duration: 0.5 }}
      className={cn(
        'rounded-xl border-2 p-6',
        isRevoked ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Token Address */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase">Token</span>
            <span className="font-mono text-sm text-gray-900 truncate">
              {tokenAddress}
            </span>
          </div>

          {/* Spender */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase">Spender</span>
            <span className="font-mono text-sm text-gray-700 truncate">
              {spender}
            </span>
          </div>

          {/* Amount */}
          <div className="mb-2">
            <span className="text-sm font-semibold text-gray-900">
              Amount: {amount === '115792089237316195423570985008687907853269984665640564039457584007913129639935' ? 'Unlimited' : amount}
            </span>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-500">
            {date.toLocaleString()}
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isRevoked ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold">
              <span className="text-lg">🔥</span>
              <span>REVOKED</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Active</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
