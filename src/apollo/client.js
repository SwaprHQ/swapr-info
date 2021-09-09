import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { SupportedNetwork, NETWORK_SUBGRAPH_URLS } from "../constants";

const BASE_SUBGRAPH = "https://api.thegraph.com/subgraphs/name/";

export const clients = {
  [SupportedNetwork.MAINNET]: new ApolloClient({
    link: new HttpLink({
      uri: BASE_SUBGRAPH + [NETWORK_SUBGRAPH_URLS.MAINNET],
    }),
    cache: new InMemoryCache(),
    shouldBatch: true,
  }),
  [SupportedNetwork.XDAI]: new ApolloClient({
    link: new HttpLink({
      uri: BASE_SUBGRAPH + [NETWORK_SUBGRAPH_URLS.XDAI],
    }),
    cache: new InMemoryCache(),
    shouldBatch: true,
  }),
  [SupportedNetwork.ARBITRUM]: new ApolloClient({
    link: new HttpLink({
      uri: BASE_SUBGRAPH + [NETWORK_SUBGRAPH_URLS.ARBITRUM],
    }),
    cache: new InMemoryCache(),
    shouldBatch: true,
  }),
};

export const healthClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/index-node/graphql",
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const blockClients = {
  [SupportedNetwork.MAINNET]: new ApolloClient({
    link: new HttpLink({
      uri: BASE_SUBGRAPH + "blocklytics/ethereum-blocks",
    }),
    cache: new InMemoryCache(),
  }),
  [SupportedNetwork.XDAI]: new ApolloClient({
    link: new HttpLink({
      uri: BASE_SUBGRAPH + "1hive/xdai-blocks",
    }),
    cache: new InMemoryCache(),
  }),
  [SupportedNetwork.ARBITRUM]: new ApolloClient({
    link: new HttpLink({
      uri: BASE_SUBGRAPH + "dodoex/arbitrum-one-blocks",
    }),
    cache: new InMemoryCache(),
  }),
};
