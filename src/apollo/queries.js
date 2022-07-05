import graphql from 'graphql-tag';

import { BUNDLE_ID, FACTORY_ADDRESS, SupportedNetwork } from '../constants';

const FACTORY_STARTING_BLOCK = {
  [FACTORY_ADDRESS[SupportedNetwork.MAINNET]]: 10000000,
  [FACTORY_ADDRESS[SupportedNetwork.XDAI]]: 14557349,
  [FACTORY_ADDRESS[SupportedNetwork.ARBITRUM_ONE]]: 277186,
};

export const SUBGRAPH_HEALTH = graphql`
  query health($name: Bytes) {
    indexingStatusForCurrentVersion(subgraphName: $name, subgraphError: allow) {
      synced
      health
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
  }
`;

export const GET_BLOCK = graphql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`;

export const GET_BLOCK_BY_TIMESTAMPS = graphql`
  query blocks($timestamps: [Int], $lastId: ID!) {
    blocks(first: 1000, orderBy: timestamp, orderDirection: asc, where: { id_gt: $lastId, timestamp_in: $timestamps }) {
      id
      number
      timestamp
    }
  }
`;

export const GET_BLOCKS = (timestamps) => {
  let queryString = 'query blocks {';
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: number, orderDirection: asc, where: { timestamp_gt: ${timestamp} }) {
      number
    }`;
  });
  queryString += '}';
  return graphql(queryString);
};

export const PRICES_BY_BLOCK = (tokenAddress, blocks) => {
  let queryString = 'query blocks {';
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }) { 
        derivedNativeCurrency
      }
    `,
  );
  queryString += ',';
  queryString += blocks.map(
    (block) => `
      b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) { 
        nativeCurrencyPrice
      }
    `,
  );

  queryString += '}';
  return graphql(queryString);
};

export const TOP_LPS_PER_PAIRS = graphql`
  query lps($pair: Bytes!) {
    liquidityPositions(where: { pair: $pair }) {
      user {
        id
      }
      pair {
        id
      }
      liquidityTokenBalance
    }
    liquidityMiningPositions(where: { targetedPair: $pair, stakedAmount_gt: 0 }, first: 10) {
      user {
        id
      }
      pair: targetedPair {
        id
      }
      liquidityTokenBalance: stakedAmount
    }
  }
`;

export const HOURLY_PAIR_RATES = (pairAddress, blocks) => {
  let queryString = 'query blocks {';
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}: pair(id:"${pairAddress}", block: { number: ${block.number} }) { 
        token0Price
        token1Price
      }
    `,
  );

  queryString += '}';
  return graphql(queryString);
};

export const SHARE_VALUE = (pairAddress, blocks) => {
  let queryString = 'query blocks {';
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}:pair(id:"${pairAddress}", block: { number: ${block.number} }) { 
        reserve0
        reserve1
        reserveUSD
        totalSupply 
        token0{
          derivedNativeCurrency
        }
        token1{
          derivedNativeCurrency
        }
      }
    `,
  );

  queryString += '}';
  return graphql(queryString);
};

export const NATIVE_CURRENCY_PRICE = (block) => {
  const queryString = block
    ? `
    query bundles {
      bundles(where: { id: ${BUNDLE_ID} } block: {number: ${block}}) {
        id
        nativeCurrencyPrice
      }
    }
  `
    : ` query bundles {
      bundles(where: { id: ${BUNDLE_ID} }) {
        id
        nativeCurrencyPrice
      }
    }
  `;
  return graphql(queryString);
};

export const USER = (block, account) => {
  const queryString = `
    query users {
      user(id: "${account}", block: {number: ${block}}) {
        liquidityPositions
      }
    }
`;
  return graphql(queryString);
};

export const USER_MINTS_BUNRS_PER_PAIR = graphql`
  query events($user: Bytes!, $pair: Bytes!) {
    mints(where: { to: $user, pair: $pair }) {
      amountUSD
      amount0
      amount1
      timestamp
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
    burns(where: { sender: $user, pair: $pair }) {
      amountUSD
      amount0
      amount1
      timestamp
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
`;

export const FIRST_SNAPSHOT = graphql`
  query snapshots($user: Bytes!) {
    liquidityPositionSnapshots(first: 1, where: { user: $user }, orderBy: timestamp, orderDirection: asc) {
      timestamp
    }
  }
`;

export const USER_HISTORY = graphql`
  query snapshots($user: Bytes!, $skip: Int!) {
    liquidityPositionSnapshots(first: 1000, skip: $skip, where: { user: $user }) {
      timestamp
      reserveUSD
      liquidityTokenBalance
      liquidityTokenTotalSupply
      reserve0
      reserve1
      token0PriceUSD
      token1PriceUSD
      pair {
        id
        reserve0
        reserve1
        reserveUSD
        token0 {
          id
        }
        token1 {
          id
        }
        totalSupply
      }
    }
  }
`;

export const USER_HISTORY_STAKE = graphql`
  query snapshots($user: Bytes!, $skip: Int!) {
    liquidityMiningPositionSnapshots(first: 1000, skip: $skip, where: { user: $user }) {
      timestamp
      reserveUSD
      liquidityTokenBalance: stakedLiquidityTokenBalance
      liquidityTokenTotalSupply: totalStakedLiquidityToken
      reserve0
      reserve1
      token0PriceUSD
      token1PriceUSD
      pair {
        id
        reserve0
        reserve1
        reserveUSD
        token0 {
          id
        }
        token1 {
          id
        }
        totalSupply
      }
    }
  }
`;

export const USER_POSITIONS = graphql`
  query liquidityPositions($user: Bytes!) {
    liquidityPositions(where: { user: $user }) {
      pair {
        id
        reserve0
        reserve1
        reserveUSD
        token0 {
          id
          symbol
          derivedNativeCurrency
        }
        token1 {
          id
          symbol
          derivedNativeCurrency
        }
        totalSupply
      }
      liquidityTokenBalance
    }
    liquidityMiningPositions(where: { user: $user, stakedAmount_gt: 0 }) {
      pair: targetedPair {
        id
        reserve0
        reserve1
        reserveUSD
        token0 {
          id
          symbol
          derivedNativeCurrency
        }
        token1 {
          id
          symbol
          derivedNativeCurrency
        }
        totalSupply
      }
      liquidityTokenBalance: stakedAmount
    }
  }
`;

export const GET_SWPR_DERIVED_NATIVE_PRICE = graphql`
  query tokens {
    tokens(first: 1, where: { symbol: "SWPR" }) {
      derivedNativeCurrency
    }
  }
`;

export const USER_TRANSACTIONS = graphql`
  query transactions($user: Bytes!) {
    mints(orderBy: timestamp, orderDirection: desc, where: { to: $user }) {
      id
      transaction {
        id
        timestamp
      }
      pair {
        id
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      to
      liquidity
      amount0
      amount1
      amountUSD
    }
    burns(orderBy: timestamp, orderDirection: desc, where: { sender: $user }) {
      id
      transaction {
        id
        timestamp
      }
      pair {
        id
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      sender
      to
      liquidity
      amount0
      amount1
      amountUSD
    }
    swaps(orderBy: timestamp, orderDirection: desc, where: { to: $user }) {
      id
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
  }
`;

export const PAIR_CHART = graphql`
  query pairDayDatas($pairAddress: Bytes!, $skip: Int!) {
    pairDayDatas(first: 1000, skip: $skip, orderBy: date, orderDirection: asc, where: { pairAddress: $pairAddress }) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      reserveUSD
    }
  }
`;

export const PAIR_DAY_DATA = graphql`
  query pairDayDatas($pairAddress: Bytes!, $date: Int!) {
    pairDayDatas(first: 1, orderBy: date, orderDirection: desc, where: { pairAddress: $pairAddress, date_lt: $date }) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      totalSupply
      reserveUSD
    }
  }
`;

export const PAIR_DAY_DATA_BULK = (pairs, startTimestamp) => {
  let pairsString = `[`;
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  const queryString = `
    query days {
      pairDayDatas(first: 1000, orderBy: date, orderDirection: asc, where: { pairAddress_in: ${pairsString}, date_gt: ${startTimestamp} }) {
        id
        pairAddress
        date
        dailyVolumeToken0
        dailyVolumeToken1
        dailyVolumeUSD
        totalSupply
        reserveUSD
      }
    } 
`;
  return graphql(queryString);
};

export const DASHBOARD_COMULATIVE_DATA = graphql`
  query swaprFactories {
    swaprFactories(first: 1) {
      totalVolumeUSD
      txCount
    }
  }
`;

export const DASHBOARD_SWAPS_HISTORY_WITH_TIMESTAMP = graphql`
  query swaps($lastId: ID!, $startTime: Int!) {
    swaps(first: 1000, where: { id_gt: $lastId, timestamp_gt: $startTime }) {
      id
      timestamp
    }
  }
`;

export const DASHBOARD_SWAPS_HISTORY = graphql`
  query swaps($lastId: ID!, $startTime: Int!) {
    swaps(first: 1000, where: { id_gt: $lastId, timestamp_gt: $startTime }) {
      id
    }
  }
`;

export const DASHBOARD_MINTS_AND_SWAPS_WITH_TIMESTAMP = graphql`
  query ($lastMintId: ID!, $lastSwapId: ID!, $startTime: Int!) {
    mints(first: 1000, where: { id_gt: $lastMintId, timestamp_gt: $startTime }) {
      id
      to
      timestamp
    }
    swaps(first: 1000, where: { id_gt: $lastSwapId, timestamp_gt: $startTime }) {
      id
      to
      timestamp
    }
  }
`;

export const DASHBOARD_MINTS_AND_SWAPS = graphql`
  query ($lastMintId: ID!, $lastSwapId: ID!, $startTime: Int!) {
    mints(first: 1000, where: { id_gt: $lastMintId, timestamp_gt: $startTime }) {
      id
      to
    }
    swaps(first: 1000, where: { id_gt: $lastSwapId, timestamp_gt: $startTime }) {
      id
      to
    }
  }
`;

export const DASHBOARD_CHART = graphql`
  query swaprDayDatas($startTime: Int!, $skip: Int!) {
    swaprDayDatas(first: 365, skip: $skip, where: { date_gt: $startTime }, orderBy: date, orderDirection: asc) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`;

export const GLOBAL_CHART = graphql`
  query swaprDayDatas($startTime: Int!, $skip: Int!) {
    swaprDayDatas(first: 1000, skip: $skip, where: { date_gt: $startTime }, orderBy: date, orderDirection: asc) {
      id
      date
      totalVolumeUSD
      dailyVolumeUSD
      dailyVolumeNativeCurrency
      totalLiquidityUSD
      totalLiquidityNativeCurrency
    }
  }
`;

export const GLOBAL_DATA = (factoryAddress, block) => {
  const queryString = ` query swaprFactories {
      swaprFactories(
       ${
         block
           ? `block: { number: ${
               block > FACTORY_STARTING_BLOCK[factoryAddress] ? block : FACTORY_STARTING_BLOCK[factoryAddress]
             }}`
           : ``
       } 
       where: { id: "${factoryAddress}" }) {
        id
        totalVolumeUSD
        totalVolumeNativeCurrency
        untrackedVolumeUSD
        totalLiquidityUSD
        totalLiquidityNativeCurrency
        txCount
        pairCount
      }
    }`;
  return graphql(queryString);
};

export const GLOBAL_TXNS = graphql`
  query transactions {
    transactions(first: 100, orderBy: timestamp, orderDirection: desc) {
      mints(orderBy: timestamp, orderDirection: desc) {
        transaction {
          id
          timestamp
        }
        pair {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        to
        liquidity
        amount0
        amount1
        amountUSD
      }
      burns(orderBy: timestamp, orderDirection: desc) {
        transaction {
          id
          timestamp
        }
        pair {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        sender
        liquidity
        amount0
        amount1
        amountUSD
      }
      swaps(orderBy: timestamp, orderDirection: desc) {
        transaction {
          id
          timestamp
        }
        pair {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        amount0In
        amount0Out
        amount1In
        amount1Out
        amountUSD
        from
      }
    }
  }
`;

export const ALL_TOKENS = graphql`
  query tokens($skip: Int!) {
    tokens(first: 500, skip: $skip) {
      id
      name
      symbol
      totalLiquidity
    }
  }
`;

export const TOKEN_SEARCH = graphql`
  query tokens($value: String, $id: String) {
    asSymbol: tokens(where: { symbol_contains: $value }, orderBy: totalLiquidity, orderDirection: desc) {
      id
      symbol
      name
      totalLiquidity
    }
    asName: tokens(where: { name_contains: $value }, orderBy: totalLiquidity, orderDirection: desc) {
      id
      symbol
      name
      totalLiquidity
    }
    asAddress: tokens(where: { id: $id }, orderBy: totalLiquidity, orderDirection: desc) {
      id
      symbol
      name
      totalLiquidity
    }
  }
`;

export const PAIR_SEARCH = graphql`
  query pairs($tokens: [Bytes]!, $id: String) {
    as0: pairs(where: { token0_in: $tokens }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
    as1: pairs(where: { token1_in: $tokens }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
    asAddress: pairs(where: { id: $id }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`;

export const ALL_PAIRS = graphql`
  query pairs($skip: Int!) {
    pairs(first: 500, skip: $skip, orderBy: trackedReserveNativeCurrency, orderDirection: desc) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`;

const PairFields = `
  fragment PairFields on Pair {
    id
    txCount
    token0 {
      id
      symbol
      name
      totalLiquidity
      derivedNativeCurrency
    }
    token1 {
      id
      symbol
      name
      totalLiquidity
      derivedNativeCurrency
    }
    reserve0
    reserve1
    reserveUSD
    totalSupply
    trackedReserveNativeCurrency
    reserveNativeCurrency
    volumeUSD
    untrackedVolumeUSD
    token0Price
    token1Price
    createdAtTimestamp
  }
`;

// returns active campaigns by default
// if status "expired" is passed it will return expired campaigns
export const liquidityMiningCampaignsQuery = (status = 'active', currentTime) => {
  const endsAtP = status === 'active' ? 'endsAt_gt' : 'endsAt_lte';
  const queryString = `
    query liquidityMiningCampaigns {
      liquidityMiningCampaigns(where: { ${endsAtP}: ${currentTime} }) {
        id
        stakedAmount
        startsAt
        endsAt
        locked
        stakingCap
        rewards{
          id
          token{
            id
            decimals
            symbol
            name
            derivedNativeCurrency
          }
          amount
        }
        stakablePair {
          token0 {
            id
            derivedNativeCurrency
            totalSupply
            untrackedVolumeUSD
            decimals
            name
            symbol
          }
          token1 {
            id
            derivedNativeCurrency
            totalSupply
            untrackedVolumeUSD
            decimals
            name
            symbol
          }
          totalSupply
          reserveUSD
          reserveNativeCurrency
          reserve1
          reserve0
        }
      }
    }
  `;
  return graphql(queryString);
};

export const PAIRS_CURRENT = graphql`
  query pairs {
    pairs(first: 200, orderBy: trackedReserveNativeCurrency, orderDirection: desc) {
      id
    }
  }
`;

export const PAIR_DATA = (pairAddress, block) => {
  const queryString = `
    ${PairFields}
    query pairs {
      pairs(${block ? `block: {number: ${block}}` : ``} where: { id: "${pairAddress}"} ) {
        ...PairFields
      }
    }`;
  return graphql(queryString);
};

export const MINING_POSITIONS = (account) => {
  const queryString = `
    query users {
      user(id: "${account}") {
        miningPosition {
          id
          user {
            id
          }
          miningPool {
              pair {
                id
                token0
                token1
              }
          }
          balance
        }
      }
    }
`;
  return graphql(queryString);
};

export const PAIRS_BULK = graphql`
  ${PairFields}
  query pairs($allPairs: [Bytes]!) {
    pairs(first: 200, where: { id_in: $allPairs }, orderBy: trackedReserveNativeCurrency, orderDirection: desc) {
      ...PairFields
    }
  }
`;

export const PAIRS_HISTORICAL_BULK = (block, pairs) => {
  let pairsString = `[`;
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`);
  });
  pairsString += ']';
  let queryString = `
  query pairs {
    pairs(first: 200, where: {id_in: ${pairsString}}, block: {number: ${block}}, orderBy: trackedReserveNativeCurrency, orderDirection: desc) {
      id
      reserveUSD
      trackedReserveNativeCurrency
      volumeUSD
      untrackedVolumeUSD
    }
  }
  `;
  return graphql(queryString);
};

export const TOKEN_CHART = graphql`
  query tokenDayDatas($tokenAddr: String!, $skip: Int!) {
    tokenDayDatas(first: 1000, skip: $skip, orderBy: date, orderDirection: asc, where: { token: $tokenAddr }) {
      id
      date
      priceUSD
      totalLiquidityToken
      totalLiquidityUSD
      totalLiquidityNativeCurrency
      dailyVolumeNativeCurrency
      dailyVolumeToken
      dailyVolumeUSD
    }
  }
`;

const TokenFields = `
  fragment TokenFields on Token {
    id
    name
    symbol
    derivedNativeCurrency
    tradeVolume
    tradeVolumeUSD
    untrackedVolumeUSD
    totalLiquidity
    txCount
  }
`;

export const TOKENS_CURRENT = graphql`
  ${TokenFields}
  query tokens {
    tokens(first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {
      ...TokenFields
    }
  }
`;

export const TOKENS_DYNAMIC = (block) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(block: {number: ${block}} first: 200, orderBy: tradeVolumeUSD, orderDirection: desc) {
        ...TokenFields
      }
    }
  `;
  return graphql(queryString);
};

export const TOKEN_DATA = (tokenAddress, block) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(${block ? `block : {number: ${block}}` : ``} where: {id:"${tokenAddress}"}) {
        ...TokenFields
      }
      pairs0: pairs(where: {token0: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
      pairs1: pairs(where: {token1: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
    }
  `;
  return graphql(queryString);
};

export const FILTERED_TRANSACTIONS = graphql`
  query ($allPairs: [Bytes]!) {
    mints(first: 20, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      to
      liquidity
      amount0
      amount1
      amountUSD
    }
    burns(first: 20, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      liquidity
      amount0
      amount1
      amountUSD
    }
    swaps(first: 30, where: { pair_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      id
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      from
    }
  }
`;
