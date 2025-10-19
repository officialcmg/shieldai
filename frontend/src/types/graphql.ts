// GraphQL Type Definitions
// These match the schema defined in indexer/schema.graphql

export interface CurrentApproval {
  id: string
  owner: string
  tokenAddress: string
  spender: string
  amount: string
  isRevocation: boolean
  timestamp: string
  blockNumber: string
}

export interface UserApprovalsData {
  CurrentApproval: CurrentApproval[]
}

export interface MonitoredApproval {
  id: string
  userAddress: string
  tokenAddress: string
  spender: string
  amount: string
  isRevocation: boolean
  timestamp: string
  blockNumber: string
  notifiedBackend: boolean
}

export interface Approval {
  id: string
  owner: string
  tokenAddress: string
  spender: string
  amount: string
  isRevocation: boolean
  timestamp: string
  blockNumber: string
}
