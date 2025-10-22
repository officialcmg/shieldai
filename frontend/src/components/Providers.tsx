'use client'

import { useEffect } from 'react'
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from '@/lib/apollo'
import { CHAIN } from '@/lib/constants'

// Auto switch to Monad when wallet connects
function ChainSwitcher() {
  const { authenticated, ready } = usePrivy()

  useEffect(() => {
    async function switchChain() {
      if (authenticated && ready && window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${CHAIN.id.toString(16)}` }],
          })
        } catch (error: any) {
          // Chain not added, try adding it
          if (error.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${CHAIN.id.toString(16)}`,
                  chainName: CHAIN.name,
                  nativeCurrency: CHAIN.nativeCurrency,
                  rpcUrls: [CHAIN.rpcUrls.default.http[0]],
                  blockExplorerUrls: [CHAIN.blockExplorers?.default?.url],
                }],
              })
            } catch (addError) {
              console.error('Failed to add Monad testnet:', addError)
            }
          } else {
            console.error('Failed to switch chain:', error)
          }
        }
      }
    }
    switchChain()
  }, [authenticated, ready])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#8B5CF6',
          logo: '/logo.png',
        },
        defaultChain: CHAIN,
        supportedChains: [CHAIN],
      }}
    >
      <ChainSwitcher />
      <ApolloProvider client={apolloClient}>
        {children}
      </ApolloProvider>
    </PrivyProvider>
  )
}
