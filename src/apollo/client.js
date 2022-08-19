import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';

import { SupportedNetwork, NETWORK_SUBGRAPH_URLS } from '../constants';

const BASE_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/';
const defaultApolloConfig = {
  watchQuery: {
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  },
};
export const clients = {
  [SupportedNetwork.MAINNET]: new ApolloClient({
    link: new HttpLink({
      uri: BASE_SUBGRAPH + NETWORK_SUBGRAPH_URLS[SupportedNetwork.MAINNET],
    }),
    cache: new InMemoryCache(),
    shouldBatch: true,
    defaultOptions: defaultApolloConfig,
  }),
  [SupportedNetwork.XDAI]: new ApolloClient({
    link: new HttpLink({
      uri: BASE_SUBGRAPH + NETWORK_SUBGRAPH_URLS[SupportedNetwork.XDAI],
    }),
    cache: new InMemoryCache(),
    shouldBatch: true,
    defaultOptions: defaultApolloConfig,
  }),
  [SupportedNetwork.ARBITRUM_ONE]: new ApolloClient({
    link: new HttpLink({
      uri: BASE_SUBGRAPH + NETWORK_SUBGRAPH_URLS[SupportedNetwork.ARBITRUM_ONE],
    }),
    cache: new InMemoryCache(),
    shouldBatch: true,
    defaultOptions: defaultApolloConfig,
  }),
};

export const healthClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/index-node/graphql',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
  defaultOptions: defaultApolloConfig,
});

export const blockClients = {
  [SupportedNetwork.MAINNET]: new ApolloClient({
    link: new HttpLink({
      uri: BASE_SUBGRAPH + 'blocklytics/ethereum-blocks',
    }),
    cache: new InMemoryCache(),
    defaultOptions: defaultApolloConfig,
  }),
  [SupportedNetwork.XDAI]: new ApolloClient({
    link: new HttpLink({
      uri: BASE_SUBGRAPH + 'x0swapsubgraph/xdai-blocks',
    }),
    cache: new InMemoryCache(),
    defaultOptions: defaultApolloConfig,
  }),
  [SupportedNetwork.ARBITRUM_ONE]: new ApolloClient({
    link: new HttpLink({
      uri: BASE_SUBGRAPH + 'dodoex/arbitrum-one-blocks',
    }),
    cache: new InMemoryCache(),
    defaultOptions: defaultApolloConfig,
  }),
};
