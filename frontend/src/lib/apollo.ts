import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { ENVIO_GRAPHQL_ENDPOINT } from './constants'

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: ENVIO_GRAPHQL_ENDPOINT,
})

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: ENVIO_GRAPHQL_ENDPOINT.replace('https://', 'wss://'),
  })
)

// Split traffic based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})
