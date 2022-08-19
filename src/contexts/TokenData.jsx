import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react';

import {
  TOKEN_DATA,
  FILTERED_TRANSACTIONS,
  TOKEN_CHART,
  TOKENS_CURRENT,
  TOKENS_DYNAMIC,
  PAIR_DATA,
} from '../apollo/queries';
import { timeframeOptions } from '../constants';
import {
  get2DayPercentChange,
  getPercentChange,
  getBlockFromTimestamp,
  isAddress,
  getPricesForBlocks,
  getBlocksForTimestamps,
} from '../utils';
import { updateNameData } from '../utils/data';
import { useLatestBlocks } from './Application';
import { useNativeCurrencyPrice } from './GlobalData';
import { useBlocksSubgraphClient, useSwaprSubgraphClient, useSelectedNetwork } from './Network';

const RESET = 'RESET';
const UPDATE = 'UPDATE';
const UPDATE_TOKEN_TXNS = 'UPDATE_TOKEN_TXNS';
const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA';
const UPDATE_PRICE_DATA = 'UPDATE_PRICE_DATA';
const UPDATE_TOP_TOKENS = 'UPDATE_TOP_TOKENS';
const UPDATE_ALL_PAIRS = 'UPDATE_ALL_PAIRS';

const TOKEN_PAIRS_KEY = 'TOKEN_PAIRS_KEY';

dayjs.extend(utc);

const TokenDataContext = createContext();

function useTokenDataContext() {
  return useContext(TokenDataContext);
}

const INITIAL_STATE = { topTokens: {} };

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { tokenAddress, data } = payload;
      return {
        ...state,
        [tokenAddress]: {
          ...state?.[tokenAddress],
          ...data,
        },
      };
    }
    case UPDATE_TOP_TOKENS: {
      const { topTokens, network } = payload;
      const newTopTokens = topTokens
        ? topTokens.reduce((reducedTokens, token) => {
            reducedTokens[token.id] = token;
            return reducedTokens;
          }, {})
        : {};
      return {
        ...state,
        topTokens: {
          ...state.topTokens,
          [network]: newTopTokens,
        },
      };
    }

    case UPDATE_TOKEN_TXNS: {
      const { address, transactions } = payload;
      return {
        ...state,
        [address]: {
          ...state?.[address],
          txns: transactions,
        },
      };
    }
    case UPDATE_CHART_DATA: {
      const { address, chartData } = payload;
      return {
        ...state,
        [address]: {
          ...state?.[address],
          chartData,
        },
      };
    }

    case UPDATE_PRICE_DATA: {
      const { address, data, timeWindow, interval } = payload;
      return {
        ...state,
        [address]: {
          ...state?.[address],
          [timeWindow]: {
            ...state?.[address]?.[timeWindow],
            [interval]: data,
          },
        },
      };
    }

    case UPDATE_ALL_PAIRS: {
      const { address, allPairs } = payload;
      return {
        ...state,
        [address]: {
          ...state?.[address],
          [TOKEN_PAIRS_KEY]: allPairs,
        },
      };
    }

    case RESET: {
      return {
        topTokens: state.topTokens,
      };
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`);
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const update = useCallback((tokenAddress, data) => {
    dispatch({
      type: UPDATE,
      payload: {
        tokenAddress,
        data,
      },
    });
  }, []);

  const updateTopTokens = useCallback((topTokens, network) => {
    dispatch({
      type: UPDATE_TOP_TOKENS,
      payload: {
        topTokens,
        network,
      },
    });
  }, []);

  const updateTokenTxns = useCallback((address, transactions) => {
    dispatch({
      type: UPDATE_TOKEN_TXNS,
      payload: { address, transactions },
    });
  }, []);

  const updateChartData = useCallback((address, chartData) => {
    dispatch({
      type: UPDATE_CHART_DATA,
      payload: { address, chartData },
    });
  }, []);

  const updateAllPairs = useCallback((address, allPairs) => {
    dispatch({
      type: UPDATE_ALL_PAIRS,
      payload: { address, allPairs },
    });
  }, []);

  const updatePriceData = useCallback((address, data, timeWindow, interval) => {
    dispatch({
      type: UPDATE_PRICE_DATA,
      payload: { address, data, timeWindow, interval },
    });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: RESET });
  }, []);

  return (
    <TokenDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateTokenTxns,
            updateChartData,
            updateTopTokens,
            updateAllPairs,
            updatePriceData,
            reset,
          },
        ],
        [state, update, updateTokenTxns, updateChartData, updateTopTokens, updateAllPairs, updatePriceData, reset],
      )}
    >
      {children}
    </TokenDataContext.Provider>
  );
}

const getTopTokens = async (client, blockClient, nativeCurrencyPrice, nativeCurrencyPriceOld) => {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
  let oneDayBlock = await getBlockFromTimestamp(blockClient, utcOneDayBack);
  let twoDayBlock = await getBlockFromTimestamp(blockClient, utcTwoDaysBack);

  try {
    let current = await client.query({
      query: TOKENS_CURRENT,
    });

    let oneDayResult = await client.query({
      query: TOKENS_DYNAMIC(oneDayBlock),
    });

    let twoDayResult = await client.query({
      query: TOKENS_DYNAMIC(twoDayBlock),
    });

    let oneDayData = oneDayResult?.data?.tokens.reduce((obj, cur) => {
      return { ...obj, [cur.id]: cur };
    }, {});

    let twoDayData = twoDayResult?.data?.tokens.reduce((obj, cur) => {
      return { ...obj, [cur.id]: cur };
    }, {});

    let bulkResults = await Promise.all(
      current &&
        oneDayData &&
        twoDayData &&
        current?.data?.tokens.map(async (token) => {
          let data = token;

          // let liquidityDataThisToken = liquidityData?.[token.id]
          let oneDayHistory = oneDayData?.[token.id];
          let twoDayHistory = twoDayData?.[token.id];

          // catch the case where token wasnt in top list in previous days
          if (!oneDayHistory) {
            let oneDayResult = await client.query({
              query: TOKEN_DATA(token.id, oneDayBlock),
            });
            oneDayHistory = oneDayResult.data.tokens[0];
          }
          if (!twoDayHistory) {
            let twoDayResult = await client.query({
              query: TOKEN_DATA(token.id, twoDayBlock),
            });
            twoDayHistory = twoDayResult.data.tokens[0];
          }

          // calculate percentage changes and daily changes
          const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
            data.tradeVolumeUSD,
            oneDayHistory?.tradeVolumeUSD ?? 0,
            twoDayHistory?.tradeVolumeUSD ?? 0,
          );
          const [oneDayTxns, txnChange] = get2DayPercentChange(
            data.txCount,
            oneDayHistory?.txCount ?? 0,
            twoDayHistory?.txCount ?? 0,
          );

          const currentLiquidityUSD = data?.totalLiquidity * nativeCurrencyPrice * data?.derivedNativeCurrency;
          const oldLiquidityUSD =
            oneDayHistory?.totalLiquidity * nativeCurrencyPriceOld * oneDayHistory?.derivedNativeCurrency;

          // percent changes
          const priceChangeUSD = getPercentChange(
            data?.derivedNativeCurrency * nativeCurrencyPrice,
            oneDayHistory?.derivedNativeCurrency ? oneDayHistory?.derivedNativeCurrency * nativeCurrencyPriceOld : 0,
          );

          // set data
          data.priceUSD = data?.derivedNativeCurrency * nativeCurrencyPrice;
          data.totalLiquidityUSD = currentLiquidityUSD;
          data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD);
          data.volumeChangeUSD = volumeChangeUSD;
          data.priceChangeUSD = priceChangeUSD;
          data.liquidityChangeUSD = getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0);
          data.oneDayTxns = oneDayTxns;
          data.txnChange = txnChange;

          // new tokens
          if (!oneDayHistory && data) {
            data.oneDayVolumeUSD = data.tradeVolumeUSD;
            data.oneDayVolumeNativeCurrency = data.tradeVolume * data.derivedNativeCurrency;
            data.oneDayTxns = data.txCount;
          }

          // update name data for
          updateNameData({
            token0: data,
          });

          // HOTFIX for Aave
          if (data.id === '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9') {
            const aaveData = await client.query({
              query: PAIR_DATA('0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f'),
            });
            const result = aaveData.data.pairs[0];
            data.totalLiquidityUSD = parseFloat(result.reserveUSD) / 2;
            data.liquidityChangeUSD = 0;
            data.priceChangeUSD = 0;
          }

          return data;
        }),
    );

    return bulkResults;

    // calculate percentage changes and daily changes
  } catch (e) {
    console.log(e);
  }
};

const getTokenData = async (client, blockClient, address, nativeCurrencyPrice, nativeCurrencyPriceOld) => {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix();
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').startOf('minute').unix();
  let oneDayBlock = await getBlockFromTimestamp(blockClient, utcOneDayBack);
  let twoDayBlock = await getBlockFromTimestamp(blockClient, utcTwoDaysBack);

  // initialize data arrays
  let data = {};
  let oneDayData = {};
  let twoDayData = {};

  try {
    // fetch all current and historical data
    let result = await client.query({
      query: TOKEN_DATA(address),
    });
    if (!result?.data?.tokens?.[0]) {
      return data;
    }
    data = result?.data?.tokens?.[0];

    // get results from 24 hours in past
    let oneDayResult = await client.query({
      query: TOKEN_DATA(address, oneDayBlock),
    });
    oneDayData = oneDayResult.data.tokens[0];

    // get results from 48 hours in past
    let twoDayResult = await client.query({
      query: TOKEN_DATA(address, twoDayBlock),
    });
    twoDayData = twoDayResult.data.tokens[0];

    // catch the case where token wasnt in top list in previous days
    if (!oneDayData) {
      let oneDayResult = await client.query({
        query: TOKEN_DATA(address, oneDayBlock),
      });
      oneDayData = oneDayResult.data.tokens[0];
    }
    if (!twoDayData) {
      let twoDayResult = await client.query({
        query: TOKEN_DATA(address, twoDayBlock),
      });
      twoDayData = twoDayResult.data.tokens[0];
    }

    // calculate percentage changes and daily changes
    const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
      data?.tradeVolumeUSD,
      oneDayData?.tradeVolumeUSD ?? 0,
      twoDayData?.tradeVolumeUSD ?? 0,
    );

    // calculate percentage changes and daily changes
    const [oneDayVolumeUT, volumeChangeUT] = get2DayPercentChange(
      data?.untrackedVolumeUSD,
      oneDayData?.untrackedVolumeUSD ?? 0,
      twoDayData?.untrackedVolumeUSD ?? 0,
    );

    // calculate percentage changes and daily changes
    const [oneDayTxns, txnChange] = get2DayPercentChange(
      data?.txCount,
      oneDayData?.txCount ?? 0,
      twoDayData?.txCount ?? 0,
    );

    const priceChangeUSD = getPercentChange(
      data?.derivedNativeCurrency * nativeCurrencyPrice,
      parseFloat(oneDayData?.derivedNativeCurrency ?? 0) * nativeCurrencyPriceOld,
    );

    const currentLiquidityUSD = data?.totalLiquidity * nativeCurrencyPrice * data?.derivedNativeCurrency;
    const oldLiquidityUSD = oneDayData?.totalLiquidity * nativeCurrencyPriceOld * oneDayData?.derivedNativeCurrency;

    // set data
    data.priceUSD = data?.derivedNativeCurrency * nativeCurrencyPrice;
    data.totalLiquidityUSD = currentLiquidityUSD;
    data.oneDayVolumeUSD = oneDayVolumeUSD;
    data.volumeChangeUSD = volumeChangeUSD;
    data.priceChangeUSD = priceChangeUSD;
    data.oneDayVolumeUT = oneDayVolumeUT;
    data.volumeChangeUT = volumeChangeUT;
    const liquidityChangeUSD = getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0);
    data.liquidityChangeUSD = liquidityChangeUSD;
    data.oneDayTxns = oneDayTxns;
    data.txnChange = txnChange;

    // new tokens
    if (!oneDayData && data) {
      data.oneDayVolumeUSD = data.tradeVolumeUSD;
      data.oneDayVolumeNativeCurrency = data.tradeVolume * data.derivedNativeCurrency;
      data.oneDayTxns = data.txCount;
    }

    // update name data for
    updateNameData({
      token0: data,
    });

    // HOTFIX for Aave
    if (data.id === '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9') {
      const aaveData = await client.query({
        query: PAIR_DATA('0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f'),
      });
      const result = aaveData.data.pairs[0];
      data.totalLiquidityUSD = parseFloat(result.reserveUSD) / 2;
      data.liquidityChangeUSD = 0;
      data.priceChangeUSD = 0;
    }
  } catch (e) {
    console.log(e);
  }
  return data;
};

const getTokenTransactions = async (client, allPairsFormatted) => {
  const transactions = {};
  try {
    let result = await client.query({
      query: FILTERED_TRANSACTIONS,
      variables: {
        allPairs: allPairsFormatted,
      },
    });
    transactions.mints = result.data.mints;
    transactions.burns = result.data.burns;
    transactions.swaps = result.data.swaps;
  } catch (e) {
    console.log(e);
  }
  return transactions;
};

const getTokenPairs = async (client, tokenAddress) => {
  try {
    // fetch all current and historical data
    let result = await client.query({
      query: TOKEN_DATA(tokenAddress),
    });
    return result.data?.['pairs0'].concat(result.data?.['pairs1']);
  } catch (e) {
    console.log(e);
  }
};

const getIntervalTokenData = async (client, blockClient, tokenAddress, startTime, interval = 3600, latestBlock) => {
  const utcEndTime = dayjs.utc();
  let time = startTime;

  // create an array of hour start times until we reach current hour
  // buffer by half hour to catch case where graph isnt synced to latest block
  const timestamps = [];
  while (time < utcEndTime.unix()) {
    timestamps.push(time);
    time += interval;
  }

  // backout if invalid timestamp format
  if (timestamps.length === 0) {
    return [];
  }

  // once you have all the timestamps, get the blocks for each timestamp in a bulk query
  let blocks;
  try {
    blocks = await getBlocksForTimestamps(blockClient, timestamps);

    // catch failing case
    if (!blocks || blocks.length === 0) {
      return [];
    }

    if (latestBlock) {
      blocks = blocks.filter((b) => {
        return parseFloat(b.number) <= parseFloat(latestBlock);
      });
    }

    let result = await getPricesForBlocks(client, tokenAddress, blocks);

    // format token native currency price results
    let values = [];
    for (var row in result) {
      let timestamp = row.split('t')[1];
      let derivedNativeCurrency = parseFloat(result[row]?.derivedNativeCurrency);
      if (timestamp) {
        values.push({
          timestamp,
          derivedNativeCurrency,
        });
      }
    }

    // go through native currency usd prices and assign to original values array
    let index = 0;
    for (var brow in result) {
      let timestamp = brow.split('b')[1];
      if (timestamp && result[brow]) {
        values[index].priceUSD = result[brow].nativeCurrencyPrice * values[index].derivedNativeCurrency;
        index += 1;
      }
    }

    let formattedHistory = [];

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistory.push({
        timestamp: values[i].timestamp,
        open: parseFloat(values[i].priceUSD),
        close: parseFloat(values[i + 1].priceUSD),
      });
    }

    return formattedHistory;
  } catch (e) {
    console.log(e);
    console.log('error fetching blocks');
    return [];
  }
};

const getTokenChartData = async (client, tokenAddress) => {
  let data = [];
  const utcEndTime = dayjs.utc();
  let utcStartTime = utcEndTime.subtract(1, 'year');
  let startTime = utcStartTime.startOf('minute').unix() - 1;

  try {
    let allFound = false;
    let skip = 0;
    while (!allFound) {
      let result = await client.query({
        query: TOKEN_CHART,
        variables: {
          tokenAddr: tokenAddress,
          skip,
        },
      });
      if (result.data.tokenDayDatas.length < 1000) {
        allFound = true;
      }
      skip += 1000;
      data = data.concat(result.data.tokenDayDatas);
    }

    let dayIndexSet = new Set();
    let dayIndexArray = [];
    const oneDay = 24 * 60 * 60;
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0));
      dayIndexArray.push(data[i]);
      dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD);
    });

    // fill in empty days
    let timestamp = data[0] && data[0].date ? data[0].date : startTime;
    let latestLiquidityUSD = data[0] && data[0].totalLiquidityUSD;
    let latestPriceUSD = data[0] && data[0].priceUSD;
    let index = 1;
    while (timestamp < utcEndTime.startOf('minute').unix() - oneDay) {
      const nextDay = timestamp + oneDay;
      let currentDayIndex = (nextDay / oneDay).toFixed(0);
      if (!dayIndexSet.has(currentDayIndex)) {
        data.push({
          date: nextDay,
          dayString: nextDay,
          dailyVolumeUSD: 0,
          priceUSD: latestPriceUSD,
          totalLiquidityUSD: latestLiquidityUSD,
        });
      } else {
        latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD;
        latestPriceUSD = dayIndexArray[index].priceUSD;
        index = index + 1;
      }
      timestamp = nextDay;
    }
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
  } catch (e) {
    console.log(e);
  }
  return data;
};

export function Updater() {
  const client = useSwaprSubgraphClient();
  const network = useSelectedNetwork();
  const blockClient = useBlocksSubgraphClient();
  const [, { updateTopTokens }] = useTokenDataContext();
  const [nativeCurrencyPrice, nativeCurrencyPriceOld] = useNativeCurrencyPrice();

  useEffect(() => {
    async function getData() {
      // get top pairs for overview list
      let topTokens = await getTopTokens(client, blockClient, nativeCurrencyPrice, nativeCurrencyPriceOld);
      topTokens && updateTopTokens(topTokens, network);
    }
    nativeCurrencyPrice && nativeCurrencyPriceOld && getData();
  }, [nativeCurrencyPrice, nativeCurrencyPriceOld, updateTopTokens, client, blockClient, network]);

  return null;
}

export function useTokenData(tokenAddress) {
  const client = useSwaprSubgraphClient();
  const blockClient = useBlocksSubgraphClient();
  const [state, { update }] = useTokenDataContext();
  const [nativeCurrencyPrice, nativeCurrencyPriceOld] = useNativeCurrencyPrice();
  const tokenData = state?.[tokenAddress];

  useEffect(() => {
    if (!tokenData && nativeCurrencyPrice && nativeCurrencyPriceOld && isAddress(tokenAddress)) {
      getTokenData(client, blockClient, tokenAddress, nativeCurrencyPrice, nativeCurrencyPriceOld).then((data) => {
        update(tokenAddress, data);
      });
    }
  }, [nativeCurrencyPrice, nativeCurrencyPriceOld, tokenAddress, tokenData, update, client, blockClient]);

  return tokenData || {};
}

export function useTokenTransactions(tokenAddress) {
  const client = useSwaprSubgraphClient();
  const blockClient = useBlocksSubgraphClient();
  const [state, { updateTokenTxns }] = useTokenDataContext();
  const tokenTxns = state?.[tokenAddress]?.txns;

  const allPairsFormatted =
    state[tokenAddress] &&
    state[tokenAddress].TOKEN_PAIRS_KEY &&
    state[tokenAddress].TOKEN_PAIRS_KEY.map((pair) => {
      return pair.id;
    });

  useEffect(() => {
    async function checkForTxns() {
      if (!tokenTxns && allPairsFormatted) {
        let transactions = await getTokenTransactions(client, allPairsFormatted);
        updateTokenTxns(tokenAddress, transactions);
      }
    }
    checkForTxns();
  }, [tokenTxns, tokenAddress, updateTokenTxns, allPairsFormatted, client, blockClient]);

  return tokenTxns || [];
}

export function useTokenPairs(tokenAddress) {
  const client = useSwaprSubgraphClient();
  const blockClient = useBlocksSubgraphClient();
  const [state, { updateAllPairs }] = useTokenDataContext();
  const tokenPairs = state?.[tokenAddress]?.[TOKEN_PAIRS_KEY];

  useEffect(() => {
    async function fetchData() {
      let allPairs = await getTokenPairs(client, tokenAddress);
      updateAllPairs(tokenAddress, allPairs);
    }
    if (!tokenPairs && isAddress(tokenAddress)) {
      fetchData();
    }
  }, [tokenAddress, tokenPairs, updateAllPairs, client, blockClient]);

  return tokenPairs || [];
}

export function useTokenChartData(tokenAddress) {
  const client = useSwaprSubgraphClient();
  const blockClient = useBlocksSubgraphClient();
  const [state, { updateChartData }] = useTokenDataContext();
  const chartData = state?.[tokenAddress]?.chartData;
  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        let data = await getTokenChartData(client, tokenAddress);
        updateChartData(tokenAddress, data);
      }
    }
    checkForChartData();
  }, [chartData, tokenAddress, updateChartData, client, blockClient]);
  return chartData;
}

/**
 * get candlestick data for a token - saves in context based on the window and the
 * interval size
 * @param {*} tokenAddress
 * @param {*} timeWindow // a preset time window from constant - how far back to look
 * @param {*} interval  // the chunk size in seconds - default is 1 hour of 3600s
 */
export function useTokenPriceData(tokenAddress, timeWindow, interval = 3600) {
  const client = useSwaprSubgraphClient();
  const blockClient = useBlocksSubgraphClient();
  const [state, { updatePriceData }] = useTokenDataContext();
  const chartData = state?.[tokenAddress]?.[timeWindow]?.[interval];
  const [latestBlock] = useLatestBlocks();

  useEffect(() => {
    const currentTime = dayjs.utc();
    const windowSize = timeWindow === timeframeOptions.WEEK ? 'week' : 'year';

    const startTime = currentTime.subtract(1, windowSize).startOf('hour').unix();

    async function fetch() {
      let data = await getIntervalTokenData(client, blockClient, tokenAddress, startTime, interval, latestBlock);
      updatePriceData(tokenAddress, data, timeWindow, interval);
    }

    if (!chartData) {
      fetch();
    }
  }, [chartData, interval, timeWindow, tokenAddress, updatePriceData, latestBlock, client, blockClient]);

  return chartData;
}

export function useAllTokenData() {
  const network = useSelectedNetwork();
  const [state] = useTokenDataContext();

  return state.topTokens[network] || [];
}

export function useTokenContextResetter() {
  const [, { reset }] = useTokenDataContext();
  return reset;
}
