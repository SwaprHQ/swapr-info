import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import utc from 'dayjs/plugin/utc';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useReducer, useState, createContext, useContext, useMemo } from 'react';

import { clients } from '../apollo/client';
import {
  DASHBOARD_CHART,
  DASHBOARD_COMULATIVE_DATA,
  DASHBOARD_SWAPS_HISTORY_WITH_TIMESTAMP,
  DASHBOARD_SWAPS_HISTORY,
  DASHBOARD_MINTS_AND_SWAPS,
  DASHBOARD_MINTS_AND_SWAPS_WITH_TIMESTAMP,
} from '../apollo/queries';
import { SupportedNetwork } from '../constants';
import { getTimeframe } from '../utils';
import { useTimeframe } from './Application';

dayjs.extend(utc);
dayjs.extend(dayOfYear);

const DashboardDataContext = createContext();

export const useDashboardDataContext = () => {
  return useContext(DashboardDataContext);
};

const SUPPORTED_CLIENTS = [
  {
    network: SupportedNetwork.MAINNET,
    client: clients[SupportedNetwork.MAINNET],
  },
  {
    network: SupportedNetwork.ARBITRUM_ONE,
    client: clients[SupportedNetwork.ARBITRUM_ONE],
  },
  { network: SupportedNetwork.XDAI, client: clients[SupportedNetwork.XDAI] },
];

const INITIAL_STATE = {
  stackedChartData: {},
  comulativeData: {},
  swaps: { loadingHistory: false },
  wallets: { loadingHistory: false },
};
const UPDATE_CHART = 'UPDATE_CHART';
const UPDATE_COMULATIVE_DATA = 'UPDATE_COMULATIVE_DATA';
const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS';
const UPDATE_ONE_DAY_SWAPS = 'UPDATE_ONE_DAY_SWAPS';
const UPDATE_LOADING_SWAPS = 'UPDATE_LOADING_SWAPS';
const UPDATE_ONE_DAY_WALLETS = 'UPDATE_ONE_DAY_WALLETS';
const UPDATE_WALLETS = 'UPDATE_WALLETS';
const UPDATE_LOADING_WALLETS = 'UPDATE_LOADING_WALLETS';
const RESET = 'RESET';

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_CHART: {
      const { daily } = payload;
      return {
        ...state,
        stackedChartData: {
          daily,
        },
      };
    }

    case UPDATE_COMULATIVE_DATA: {
      const { comulativeNetworksData } = payload;
      return {
        ...state,
        comulativeData: comulativeNetworksData,
      };
    }

    case UPDATE_TRANSACTIONS: {
      const { history } = payload;
      return {
        ...state,
        swaps: {
          ...state.swaps,
          history,
        },
      };
    }

    case UPDATE_LOADING_SWAPS: {
      const { loading } = payload;
      return {
        ...state,
        swaps: {
          ...state.swaps,
          loadingHistory: loading,
        },
      };
    }

    case UPDATE_ONE_DAY_SWAPS: {
      const { oneDay } = payload;
      return {
        ...state,
        swaps: {
          ...state.swaps,
          oneDay,
        },
      };
    }

    case UPDATE_WALLETS: {
      const { history } = payload;
      return {
        ...state,
        wallets: {
          ...state.wallets,
          history,
        },
      };
    }

    case UPDATE_ONE_DAY_WALLETS: {
      const { oneDay } = payload;
      return {
        ...state,
        wallets: {
          ...state.wallets,
          oneDay,
        },
      };
    }

    case UPDATE_LOADING_WALLETS: {
      const { loading } = payload;
      return {
        ...state,
        wallets: {
          ...state.wallets,
          loadingHistory: loading,
        },
      };
    }

    case RESET: {
      return INITIAL_STATE;
    }

    default: {
      throw Error(`Unexpected action type in DashboardContext reducer: '${type}'.`);
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const updateChart = useCallback((daily) => {
    dispatch({
      type: UPDATE_CHART,
      payload: {
        daily,
      },
    });
  }, []);

  const updateComulativeData = useCallback((comulativeNetworksData) => {
    dispatch({
      type: UPDATE_COMULATIVE_DATA,
      payload: {
        comulativeNetworksData,
      },
    });
  }, []);

  const updateSwaps = useCallback((history) => {
    dispatch({
      type: UPDATE_TRANSACTIONS,
      payload: {
        history,
      },
    });
  }, []);

  const updateLoadingSwaps = useCallback((loading) => {
    dispatch({
      type: UPDATE_LOADING_SWAPS,
      payload: {
        loading,
      },
    });
  }, []);

  const updateOneDaySwaps = useCallback((oneDay) => {
    dispatch({
      type: UPDATE_ONE_DAY_SWAPS,
      payload: {
        oneDay,
      },
    });
  }, []);

  const updateWallets = useCallback((history) => {
    dispatch({
      type: UPDATE_WALLETS,
      payload: {
        history,
      },
    });
  }, []);

  const updateOneDayWallets = useCallback((oneDay) => {
    dispatch({
      type: UPDATE_ONE_DAY_WALLETS,
      payload: {
        oneDay,
      },
    });
  }, []);

  const updateLoadingWallets = useCallback((loading) => {
    dispatch({
      type: UPDATE_LOADING_WALLETS,
      payload: {
        loading,
      },
    });
  }, []);

  const value = useMemo(
    () => [
      state,
      {
        updateChart,
        updateComulativeData,
        updateSwaps,
        updateLoadingSwaps,
        updateOneDaySwaps,
        updateWallets,
        updateOneDayWallets,
        updateLoadingWallets,
      },
    ],
    [
      state,
      updateChart,
      updateComulativeData,
      updateSwaps,
      updateLoadingSwaps,
      updateOneDaySwaps,
      updateWallets,
      updateOneDayWallets,
      updateLoadingWallets,
    ],
  );

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

Provider.propTypes = {
  children: PropTypes.object.isRequired,
};

export function useDashboardChartData() {
  const [state, { updateChart }] = useDashboardDataContext();
  const [oldestDateFetch, setOldestDateFetched] = useState();
  const [activeWindow] = useTimeframe();

  const stackedChartDataDaily = state?.stackedChartData?.daily;

  /**
   * Keep track of oldest date fetched. Used to
   * limit data fetched until its actually needed.
   * (dont fetch year long stuff unless year option selected)
   */
  useEffect(() => {
    // based on window, get starttime
    let startTime = getTimeframe(activeWindow);

    if ((activeWindow && startTime < oldestDateFetch) || !oldestDateFetch) {
      setOldestDateFetched(startTime);
    }
  }, [activeWindow, oldestDateFetch]);

  /**
   * Fetch data if none fetched or older data is needed
   */
  useEffect(() => {
    async function fetchData() {
      const newChartDailyData = await getChartData(oldestDateFetch);
      updateChart(newChartDailyData);
    }
    if (oldestDateFetch && !stackedChartDataDaily) {
      fetchData();
    }
  }, [stackedChartDataDaily, oldestDateFetch, updateChart]);

  return state?.stackedChartData;
}

export const useDashboardComulativeData = () => {
  const [state, { updateComulativeData }] = useDashboardDataContext();

  const existingComulativeData = state?.comulativeData;

  useEffect(() => {
    async function fetchData() {
      const comulativeNetworksData = await getComulativeData();
      updateComulativeData(comulativeNetworksData);
    }

    if (!existingComulativeData || Object.keys(existingComulativeData).length === 0) {
      fetchData();
    }
  }, [updateComulativeData, existingComulativeData]);

  return existingComulativeData;
};

export const useSwapsData = () => {
  const [state, { updateSwaps, updateLoadingSwaps }] = useDashboardDataContext();

  const existingSwaps = state?.swaps?.history;
  const isLoadingSwaps = state?.swaps?.loadingHistory;

  useEffect(() => {
    async function fetchData() {
      updateLoadingSwaps(true);

      const pastMonthSwaps = await getPastMonthSwaps();

      updateSwaps(pastMonthSwaps);
      updateLoadingSwaps(false);
    }

    if (!isLoadingSwaps && (!existingSwaps || existingSwaps.length === 0)) {
      fetchData();
    }
  }, [existingSwaps, updateSwaps, updateLoadingSwaps, isLoadingSwaps]);

  return existingSwaps;
};

export const useOneDaySwapsData = () => {
  const [state, { updateOneDaySwaps }] = useDashboardDataContext();

  const existingSwaps = state?.swaps?.oneDay;

  useEffect(() => {
    async function fetchData() {
      const oneDayTransactions = await getOneDaySwaps();
      updateOneDaySwaps(oneDayTransactions);
    }

    if (!existingSwaps || existingSwaps.length === 0) {
      fetchData();
    }
  }, [existingSwaps, updateOneDaySwaps]);

  return existingSwaps;
};

export const useOneDayWalletsData = () => {
  const [state, { updateOneDayWallets }] = useDashboardDataContext();

  const existingWallets = state?.wallets?.oneDay;

  useEffect(() => {
    async function fetchData() {
      const oneDayWallets = await getOneDayWallets();
      updateOneDayWallets(oneDayWallets);
    }

    if (!existingWallets || existingWallets.length === 0) {
      fetchData();
    }
  }, [existingWallets, updateOneDayWallets]);

  return existingWallets;
};

export const usePastMonthWalletsData = () => {
  const [state, { updateWallets, updateLoadingWallets }] = useDashboardDataContext();

  const existingWallets = state?.wallets?.history;
  const isLoadingWallets = state?.wallets?.loadingHistory;

  useEffect(() => {
    async function fetchData() {
      updateLoadingWallets(true);

      const pastMonthWallets = await getPastMonthWallets();

      updateWallets(pastMonthWallets);
      updateLoadingWallets(false);
    }

    if (!isLoadingWallets && (!existingWallets || existingWallets.length === 0)) {
      fetchData();
    }
  }, [isLoadingWallets, existingWallets, updateWallets, updateLoadingWallets]);

  return existingWallets;
};

/**
 * Get data for unique wallets that provided liquidity or performed a swap,
 * for each network for the past 24h
 */
const getOneDayWallets = async () => {
  try {
    let swapsAndMints = [];

    const utcOneDayBack = dayjs.utc().startOf('day').unix();

    for (const { client, network } of SUPPORTED_CLIENTS) {
      let lastMintId = '';
      let lastSwapId = '';
      let fetchMore = true;

      while (fetchMore) {
        const { data } = await client.query({
          query: DASHBOARD_MINTS_AND_SWAPS,
          variables: {
            startTime: utcOneDayBack,
            lastMintId,
            lastSwapId,
          },
        });

        if (data.mints.length === 0 && data.swaps.length === 0) {
          fetchMore = false;
          continue;
        }

        lastMintId = data.mints.length > 0 ? data.mints[data.mints.length - 1].id : lastMintId;
        lastSwapId = data.swaps.length > 0 ? data.swaps[data.swaps.length - 1].id : lastSwapId;
        swapsAndMints = swapsAndMints.concat(
          ...data.mints.map(({ to }) => ({ to, network })),
          ...data.swaps.map(({ to }) => ({ to, network })),
        );
      }
    }

    const uniqueWallets = swapsAndMints.reduce(
      (accumulator, current) => ({
        ...accumulator,
        [current.network]: {
          ...accumulator[current.network],
          [current.to]: true,
        },
      }),
      {},
    );

    const uniqueWalletsPerNetwork = Object.keys(uniqueWallets).reduce(
      (accumulator, current) => ({
        ...accumulator,
        [current]: Object.values(uniqueWallets[current]).length,
      }),
      {},
    );

    return uniqueWalletsPerNetwork;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get data for unique wallets that provided liquidity or performed a swap,
 * for each network for the past month
 */
const getPastMonthWallets = async () => {
  try {
    let swapsAndMints = [];

    const utcOneDayBack = dayjs.utc().subtract(1, 'month').startOf('day').unix();

    for (const { client, network } of SUPPORTED_CLIENTS) {
      let lastMintId = '';
      let lastSwapId = '';
      let fetchMore = true;

      while (fetchMore) {
        const { data } = await client.query({
          query: DASHBOARD_MINTS_AND_SWAPS_WITH_TIMESTAMP,
          variables: {
            startTime: utcOneDayBack,
            lastMintId,
            lastSwapId,
          },
        });

        if (data.mints.length === 0 && data.swaps.length === 0) {
          fetchMore = false;
          continue;
        }

        lastMintId = data.mints.length > 0 ? data.mints[data.mints.length - 1].id : lastMintId;
        lastSwapId = data.swaps.length > 0 ? data.swaps[data.swaps.length - 1].id : lastSwapId;
        swapsAndMints = swapsAndMints.concat(
          ...data.mints.map(({ timestamp, to }) => ({ timestamp, to, network })),
          ...data.swaps.map(({ timestamp, to }) => ({ timestamp, to, network })),
        );
      }
    }

    const stackedWallets = swapsAndMints.reduce((accumulator, current) => {
      const dayOfTheYear = dayjs.unix(current.timestamp).utc().startOf('day').dayOfYear();

      return {
        ...accumulator,
        [dayOfTheYear]: {
          ...accumulator[dayOfTheYear],
          time: dayjs.utc().dayOfYear(dayOfTheYear).startOf('day').format('YYYY-MM-DD'),
          [current.network]: {
            ...(accumulator[dayOfTheYear] ? accumulator[dayOfTheYear][current.network] : {}),
            [current.to]: true,
          },
        },
      };
    }, {});

    return Object.values(stackedWallets).map((stackedValue) => ({
      time: stackedValue.time,
      [SupportedNetwork.MAINNET]: Object.keys(stackedValue[SupportedNetwork.MAINNET]).length,
      [SupportedNetwork.XDAI]: Object.keys(stackedValue[SupportedNetwork.XDAI]).length,
      [SupportedNetwork.ARBITRUM_ONE]: Object.keys(stackedValue[SupportedNetwork.ARBITRUM_ONE]).length,
    }));
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get historical data for swaps for each network (last 1 month)
 */
const getPastMonthSwaps = async () => {
  try {
    let swaps = [];

    const utcOneMonthBack = dayjs.utc().subtract(1, 'month').startOf('day').unix();

    for (const { client, network } of SUPPORTED_CLIENTS) {
      let lastId = '';
      let fetchMore = true;

      while (fetchMore) {
        const { data } = await client.query({
          query: DASHBOARD_SWAPS_HISTORY_WITH_TIMESTAMP,
          variables: {
            startTime: utcOneMonthBack,
            lastId,
          },
        });

        if (data.swaps.length === 0) {
          fetchMore = false;
          continue;
        }

        lastId = data.swaps[data.swaps.length - 1].id;
        swaps = swaps.concat(data.swaps.map((swap) => ({ swap, network })));
      }
    }

    const stackedSwaps = swaps.reduce((accumulator, current) => {
      const dayOfTheYear = dayjs.unix(current.swap.timestamp).utc().startOf('day').dayOfYear();

      return {
        ...accumulator,
        [dayOfTheYear]: {
          ...accumulator[dayOfTheYear],
          time: dayjs.utc().dayOfYear(dayOfTheYear).startOf('day').format('YYYY-MM-DD'),
          [current.network]:
            accumulator[dayOfTheYear] && accumulator[dayOfTheYear][current.network]
              ? Number(accumulator[dayOfTheYear][current.network]) + 1
              : 1,
        },
      };
    }, {});

    return Object.values(stackedSwaps);
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get data for swaps for each network for the past 24h
 */
const getOneDaySwaps = async () => {
  try {
    let swaps = [];

    const utcOneDayBack = dayjs.utc().startOf('day').unix();

    for (const { client, network } of SUPPORTED_CLIENTS) {
      let lastId = '';
      let fetchMore = true;

      while (fetchMore) {
        const { data } = await client.query({
          query: DASHBOARD_SWAPS_HISTORY,
          variables: {
            startTime: utcOneDayBack,
            lastId,
          },
        });

        if (data.swaps.length === 0) {
          fetchMore = false;
          continue;
        }

        lastId = data.swaps[data.swaps.length - 1].id;
        swaps = swaps.concat(data.swaps.map((swap) => ({ swap, network })));
      }
    }

    const oneDaySwaps = swaps.reduce((accumulator, current) => {
      return {
        ...accumulator,
        [current.network]: accumulator[current.network] ? Number(accumulator[current.network]) + 1 : 1,
      };
    }, {});

    return oneDaySwaps;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get comulative data for volume, txs count and liquidity
 * for each network
 */
const getComulativeData = async () => {
  try {
    const requests = [];
    for (const { client } of SUPPORTED_CLIENTS) {
      requests.push(client.query({ query: DASHBOARD_COMULATIVE_DATA }));
    }

    const networksData = await Promise.all(requests);
    const comulativeNetworksData = networksData.reduce(
      (accumulator, current, index) => {
        const swaprFactoryData = current.data.swaprFactories[0];

        return {
          ...accumulator,
          totalTrades: accumulator.totalTrades + Number(swaprFactoryData.txCount),
          totalVolume: accumulator.totalVolume + Number(swaprFactoryData.totalVolumeUSD),
          [SUPPORTED_CLIENTS[index].network]: {
            totalTrades: Number(swaprFactoryData.txCount),
            totalVolume: Number(swaprFactoryData.totalVolumeUSD),
          },
        };
      },
      { totalTrades: 0, totalVolume: 0 },
    );

    return comulativeNetworksData;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get historical data for volume and liquidity for each network
 * @param {*} oldestDateToFetch // start of window to fetch from
 */
const getChartData = async (oldestDateToFetch) => {
  let data = [];
  try {
    const requests = [];
    for (const { client } of SUPPORTED_CLIENTS) {
      requests.push(
        client.query({
          query: DASHBOARD_CHART,
          variables: {
            startTime: oldestDateToFetch,
            skip: 0,
          },
        }),
      );
    }

    const networksData = await Promise.all(requests);
    networksData.forEach((networkData, index) => {
      data = data.concat(
        networkData.data.swaprDayDatas.map((dayData) => ({
          ...dayData,
          network: SUPPORTED_CLIENTS[index].network,
        })),
      );
    });
  } catch (error) {
    console.error(error);
  }
  return data;
};
