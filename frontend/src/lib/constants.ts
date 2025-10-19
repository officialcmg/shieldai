import { defineChain } from 'viem'

// Monad Testnet
export const monadTestnet = defineChain({
  id: 10143, // Correct chain ID!
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://explorer.testnet.monad.xyz',
    },
  },
})

// Contract Addresses
export const USER_REGISTRY_ADDRESS = '0x2CC70f80098e20717D480270187DCb0c1Ccf826e' as const

// ShieldAI Backend Delegate Address (the address that will redeem delegations)
export const SHIELDAI_DELEGATE_ADDRESS = '0x4a39e9F9A20430a82480F538c14c55cf5e858659' as const

// Envio GraphQL Endpoint
export const ENVIO_GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_ENDPOINT || 'https://indexer.dev.hyperindex.xyz/7c0c79b/v1/graphql'

// ShieldAI Backend API URL
export const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001'

// Pimlico Bundler RPC URL
export const PIMLICO_BUNDLER_URL = `https://api.pimlico.io/v2/${monadTestnet.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`
