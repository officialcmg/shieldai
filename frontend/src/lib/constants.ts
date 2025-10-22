import { base } from 'viem/chains'

// Use Base Mainnet
export const CHAIN = base

// Contract Addresses
export const USER_REGISTRY_ADDRESS = '0x2CC70f80098e20717D480270187DCb0c1Ccf826e' as const

// ShieldAI Backend Delegate Address (the address that will redeem delegations)
export const SHIELDAI_DELEGATE_ADDRESS = '0x4a39e9F9A20430a82480F538c14c55cf5e858659' as const

// Envio GraphQL Endpoint
export const ENVIO_GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_ENDPOINT || 'https://indexer.dev.hyperindex.xyz/7dcf986/v1/graphql'

// ShieldAI Backend API URL
export const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001'

// Pimlico Bundler RPC URL (Base mainnet)
export const PIMLICO_BUNDLER_URL = `https://api.pimlico.io/v2/8453/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`
