'use client'

import { useEffect } from 'react'
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from '@/lib/apollo'
import { monadTestnet } from '@/lib/constants'

// Auto switch to Monad when wallet connects
function ChainSwitcher() {
  const { authenticated, ready } = usePrivy()

  useEffect(() => {
    async function switchChain() {
      if (authenticated && ready && window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${monadTestnet.id.toString(16)}` }],
          })
        } catch (error: any) {
          // Chain not added, try adding it
          if (error.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${monadTestnet.id.toString(16)}`,
                  chainName: monadTestnet.name,
                  nativeCurrency: monadTestnet.nativeCurrency,
                  rpcUrls: [monadTestnet.rpcUrls.default.http[0]],
                  blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
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
        loginMethods: ['email', 'wallet', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#8B5CF6',
          logo: '/logo.png',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
      }}
    >
      <ChainSwitcher />
      <ApolloProvider client={apolloClient}>
        {children}
      </ApolloProvider>
    </PrivyProvider>
  )
}
