# DXstats

Statistics portal for [Swapr](https://swapr.eth.limo) protocol. The application displays different kind of statistics about the interactions on the swapr dex, for each network (currently `Gnosis Chain`, `Ethereum`, `Arbitrum`), and for all networks stacked.

The application fetches the statistics from a subgraph, that tracks multiple different entities.

Check it out live: [https://dxstats.eth.limo](https://dxstats.eth.limo).

### Subgraphs

#### Ethereum: https://thegraph.com/hosted-service/subgraph/dxgraphs/swapr-mainnet-v2
#### Gnosis chain: https://thegraph.com/hosted-service/subgraph/dxgraphs/swapr-xdai-v2
#### Arbitrum: https://thegraph.com/hosted-service/subgraph/dxgraphs/swapr-arbitrum-one-v3

Code: https://github.com/dxgraphs/swapr-subgraph

### To Start Development

###### Installing dependencies

```bash
yarn
```

###### Running locally

```bash
yarn start
```
