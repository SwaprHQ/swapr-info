import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import utc from 'dayjs/plugin/utc';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useReducer, useState, createContext, useContext, useMemo } from 'react';

import { clients } from '../apollo/client';
import {
  DASHBOARD_CHART,
  DASHBOARD_COMULATIVE_DATA,
  DASHBOARD_SWAPS_HISTORY_WITH_TIMESTAMP,
  DASHBOARD_UNIQUE_DAILY_INTERACTIONS,
  DASHBOARD_UNIQUE_WEEKLY_INTERACTIONS,
  DASHBOARD_UNIQUE_MONTHLY_INTERACTIONS,
} from '../apollo/queries';
import { SupportedNetwork, SWAPR_COINGECKO_ENDPOINT } from '../constants';
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
  uncollectedFeesData: {
    loading: false,
  },
  swaps: { loadingHistory: false },
  wallets: { daily: { loadingHistory: false }, weekly: { loadingHistory: false }, monthly: { loadingHistory: false } },
};
const UPDATE_CHART = 'UPDATE_CHART';
const UPDATE_COMULATIVE_DATA = 'UPDATE_COMULATIVE_DATA';
const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS';
const UPDATE_ONE_DAY_SWAPS = 'UPDATE_ONE_DAY_SWAPS';
const UPDATE_LOADING_SWAPS = 'UPDATE_LOADING_SWAPS';
const UPDATE_ONE_DAY_WALLETS = 'UPDATE_ONE_DAY_WALLETS';
const UPDATE_UNIQUE_WALLETS_INTERACTIONS = 'UPDATE_UNIQUE_WALLETS_INTERACTIONS';
const UPDATE_UNIQUE_WALLETS_INTERACTIONS_HISTORY = 'UPDATE_UNIQUE_WALLETS_INTERACTIONS_HISTORY_HISTORY';
const UPDATE_WALLETS = 'UPDATE_WALLETS';
const UPDATE_LOADING_WALLETS = 'UPDATE_LOADING_WALLETS';
const UPDATE_UNCOLLECTED_FEES_DATA = 'UPDATE_UNCOLLECTED_FEES_DATA';
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

    case UPDATE_UNIQUE_WALLETS_INTERACTIONS: {
      const { uniqueness, timeframe, data } = payload;

      return {
        ...state,
        wallets: {
          ...state.wallets,
          [uniqueness]: {
            ...state.wallets[uniqueness],
            [timeframe]: data,
          },
        },
      };
    }

    case UPDATE_UNIQUE_WALLETS_INTERACTIONS_HISTORY: {
      const { uniqueness, data } = payload;

      return {
        ...state,
        wallets: {
          ...state.wallets,
          [uniqueness]: {
            ...state.wallets[uniqueness],
            history: data,
          },
        },
      };
    }

    case UPDATE_LOADING_WALLETS: {
      const { uniqueness, loading } = payload;
      return {
        ...state,
        wallets: {
          ...state.wallets,
          [uniqueness]: {
            ...state.wallets[uniqueness],
            loadingHistory: loading,
          },
        },
      };
    }

    case UPDATE_UNCOLLECTED_FEES_DATA: {
      const { uncollectedFees, loading } = payload;
      return {
        ...state,
        uncollectedFeesData: {
          loading,
          data: uncollectedFees,
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

  const updateUniqueWalletsInteractions = useCallback((uniqueness, timeframe, data) => {
    dispatch({
      type: UPDATE_UNIQUE_WALLETS_INTERACTIONS,
      payload: {
        uniqueness,
        timeframe,
        data,
      },
    });
  }, []);

  const updateUniqueWalletsInteractionsHistory = useCallback((uniqueness, data) => {
    dispatch({
      type: UPDATE_UNIQUE_WALLETS_INTERACTIONS_HISTORY,
      payload: {
        uniqueness,
        data,
      },
    });
  }, []);

  const updateLoadingWallets = useCallback((uniqueness, loading) => {
    dispatch({
      type: UPDATE_LOADING_WALLETS,
      payload: {
        uniqueness,
        loading,
      },
    });
  }, []);

  const updateUncollectedFees = useCallback((payload) => {
    dispatch({
      type: UPDATE_UNCOLLECTED_FEES_DATA,
      payload,
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
        updateUniqueWalletsInteractions,
        updateUniqueWalletsInteractionsHistory,
        updateLoadingWallets,
        updateUncollectedFees,
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
      updateUniqueWalletsInteractions,
      updateUniqueWalletsInteractionsHistory,
      updateLoadingWallets,
      updateUncollectedFees,
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

      const pastYearSwaps = await getPastYearSwaps();

      console.log('PAST YEAR SWAPS', pastYearSwaps);

      updateSwaps(pastYearSwaps);
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

export const useUniqueDailyWalletsData = (startTime) => {
  const [state, { updateUniqueWalletsInteractions }] = useDashboardDataContext();

  const existingUniqueWalletsInteractions = state?.wallets?.daily?.oneDay;

  useEffect(() => {
    async function fetchData() {
      const uniqueWalletsInteractions = await getDailyUniqueInteractions(startTime);
      updateUniqueWalletsInteractions('daily', 'oneDay', uniqueWalletsInteractions);
    }

    if (!existingUniqueWalletsInteractions || existingUniqueWalletsInteractions.length === 0) {
      fetchData();
    }
  }, [existingUniqueWalletsInteractions, updateUniqueWalletsInteractions, startTime]);

  return existingUniqueWalletsInteractions;
};

export const useUniqueWeeklyWalletsData = (startTime) => {
  const [state, { updateUniqueWalletsInteractions }] = useDashboardDataContext();

  const existingUniqueWalletsInteractions = state?.wallets?.weekly?.oneWeek;

  useEffect(() => {
    async function fetchData() {
      const uniqueWalletsInteractions = await getWeeklyUniqueInteractions(startTime);
      updateUniqueWalletsInteractions('weekly', 'oneWeek', uniqueWalletsInteractions);
    }

    if (!existingUniqueWalletsInteractions || existingUniqueWalletsInteractions.length === 0) {
      fetchData();
    }
  }, [existingUniqueWalletsInteractions, updateUniqueWalletsInteractions, startTime]);

  return existingUniqueWalletsInteractions;
};

export const useUniqueMonthlyWalletsData = (startTime) => {
  const [state, { updateUniqueWalletsInteractions }] = useDashboardDataContext();

  const existingUniqueWalletsInteractions = state?.wallets?.monthly?.oneMonth;

  useEffect(() => {
    async function fetchData() {
      const uniqueWalletsInteractions = await getMonthlyUniqueInteractions(startTime);
      updateUniqueWalletsInteractions('monthly', 'oneMonth', uniqueWalletsInteractions);
    }

    if (!existingUniqueWalletsInteractions || existingUniqueWalletsInteractions.length === 0) {
      fetchData();
    }
  }, [existingUniqueWalletsInteractions, updateUniqueWalletsInteractions, startTime]);

  return existingUniqueWalletsInteractions;
};

export const usePastYearUniqueDailyWalletsData = () => {
  const [state, { updateUniqueWalletsInteractionsHistory, updateLoadingWallets }] = useDashboardDataContext();

  const existingWallets = state?.wallets?.daily?.history;
  const isLoadingWallets = state?.wallets?.daily?.loadingHistory;

  useEffect(() => {
    async function fetchData() {
      updateLoadingWallets('daily', true);

      const pastYearWallets = await getOneYearDailyUniqueInteractions();

      updateUniqueWalletsInteractionsHistory('daily', pastYearWallets);
      updateLoadingWallets('daily', false);
    }

    if (!isLoadingWallets && (!existingWallets || existingWallets.length === 0)) {
      fetchData();
    }
  }, [isLoadingWallets, existingWallets, updateUniqueWalletsInteractionsHistory, updateLoadingWallets]);

  return existingWallets;
};

export const usePastYearUniqueWeeklyWalletsData = () => {
  const [state, { updateUniqueWalletsInteractionsHistory, updateLoadingWallets }] = useDashboardDataContext();

  const existingWallets = state?.wallets?.weekly?.history;
  const isLoadingWallets = state?.wallets?.weekly?.loadingHistory;

  useEffect(() => {
    async function fetchData() {
      updateLoadingWallets('weekly', true);

      const pastYearWallets = await getPastYearWeeklyUniqueInteractions();

      updateUniqueWalletsInteractionsHistory('weekly', pastYearWallets);
      updateLoadingWallets('weekly', false);
    }

    if (!isLoadingWallets && (!existingWallets || existingWallets.length === 0)) {
      fetchData();
    }
  }, [isLoadingWallets, existingWallets, updateUniqueWalletsInteractionsHistory, updateLoadingWallets]);

  return existingWallets;
};

export const usePastYearUniqueMonthlyWalletsData = () => {
  const [state, { updateUniqueWalletsInteractionsHistory, updateLoadingWallets }] = useDashboardDataContext();

  const existingWallets = state?.wallets?.monthly?.history;
  const isLoadingWallets = state?.wallets?.monthly?.loadingHistory;

  useEffect(() => {
    async function fetchData() {
      updateLoadingWallets('monthly', true);

      const pastYearWallets = await getPastYearMonthlyUniqueInteractions();

      updateUniqueWalletsInteractionsHistory('monthly', pastYearWallets);
      updateLoadingWallets('monthly', false);
    }

    if (!isLoadingWallets && (!existingWallets || existingWallets.length === 0)) {
      fetchData();
    }
  }, [isLoadingWallets, existingWallets, updateUniqueWalletsInteractionsHistory, updateLoadingWallets]);

  return existingWallets;
};

export const useUncollectedFeesData = () => {
  const [state, { updateUncollectedFees }] = useDashboardDataContext();

  const { data: uncollectedFeesData, loading } = state?.uncollectedFeesData;

  useEffect(() => {
    async function fetchData() {
      updateUncollectedFees({ loading: true });
      const uncollectedFees = await getUncollectedFees();
      updateUncollectedFees({ uncollectedFees, loading: false });
    }

    if (!loading && Object.keys(uncollectedFeesData ?? {}).length === 0) {
      fetchData();
    }
  }, [loading, uncollectedFeesData, updateUncollectedFees]);

  return { uncollectedFeesData, loading };
};

const getUncollectedFees = async () => {
  try {
    const response = await fetch(`${SWAPR_COINGECKO_ENDPOINT}/uncollected-protocol-fees`);
    const uncollectedFees = await response.json();

    return {
      [SupportedNetwork.MAINNET]: uncollectedFees.mainnetUSD,
      [SupportedNetwork.ARBITRUM_ONE]: uncollectedFees.arbitrumOneUSD,
      [SupportedNetwork.XDAI]: uncollectedFees.gnosisUSD,
      total: uncollectedFees.totalUSD,
    };
  } catch (error) {
    console.error(error);
    return {
      [SupportedNetwork.MAINNET]: 0,
      [SupportedNetwork.ARBITRUM_ONE]: 0,
      [SupportedNetwork.XDAI]: 0,
      total: 0,
    };
  }
};

/**
 * Get data for unique daily wallets that provided liquidity, performed a swap, or removed
 * liquidity for each network for the past year
 */
const getOneYearDailyUniqueInteractions = async () => {
  try {
    let uniqueInteractions = [];

    const utcOneMonthBack = dayjs.utc().subtract(1, 'year').startOf('day').unix();

    for (const { client, network } of SUPPORTED_CLIENTS) {
      const { data } = await client.query({
        query: DASHBOARD_UNIQUE_DAILY_INTERACTIONS,
        variables: {
          startTime: utcOneMonthBack,
        },
      });

      uniqueInteractions = uniqueInteractions.concat(
        ...data.dailyUniqueAddressInteractions.map(({ id, timestamp, addresses }) => ({
          id,
          network,
          timestamp,
          interactions: addresses.length,
        })),
      );
    }

    const stackedWallets = uniqueInteractions.reduce((accumulator, current) => {
      const dayOfTheYear = dayjs.unix(current.timestamp).utc();

      return {
        ...accumulator,
        [dayOfTheYear]: {
          ...accumulator[dayOfTheYear],
          time: dayOfTheYear.startOf('day').format('YYYY-MM-DD'),
          [current.network]: current.interactions,
        },
      };
    }, {});

    return Object.values(stackedWallets);
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get data for unique weekly wallets that provided liquidity, performed a swap, or removed
 * liquidity for each network for the past year
 */
const getPastYearWeeklyUniqueInteractions = async () => {
  try {
    let uniqueInteractions = [];

    const utcOneYearBack = dayjs.utc().subtract(1, 'year').startOf('day').unix();

    for (const { client, network } of SUPPORTED_CLIENTS) {
      const { data } = await client.query({
        query: DASHBOARD_UNIQUE_WEEKLY_INTERACTIONS,
        variables: {
          startTime: utcOneYearBack,
        },
      });

      uniqueInteractions = uniqueInteractions.concat(
        ...data.weeklyUniqueAddressInteractions.map(({ id, timestampStart, addresses }) => ({
          id,
          network,
          timestamp: timestampStart,
          interactions: addresses.length,
        })),
      );
    }

    const stackedWallets = uniqueInteractions.reduce((accumulator, current) => {
      const dayOfTheYear = dayjs.unix(current.timestamp).utc();

      return {
        ...accumulator,
        [current.id]: {
          ...accumulator[current.id],
          time: dayOfTheYear.startOf('day').format('YYYY-MM-DD'),
          [current.network]: current.interactions,
        },
      };
    }, {});

    return Object.values(stackedWallets);
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get data for unique monthly wallets that provided liquidity, performed a swap, or removed
 * liquidity for each network for the past year
 */
const getPastYearMonthlyUniqueInteractions = async () => {
  try {
    let uniqueInteractions = [];

    const utcOneYearBack = dayjs.utc().subtract(1, 'year').startOf('day').unix();

    for (const { client, network } of SUPPORTED_CLIENTS) {
      const { data } = await client.query({
        query: DASHBOARD_UNIQUE_MONTHLY_INTERACTIONS,
        variables: {
          startTime: utcOneYearBack,
        },
      });

      uniqueInteractions = uniqueInteractions.concat(
        ...data.monthlyUniqueAddressInteractions.map(({ id, timestamp, addresses }) => ({
          id,
          network,
          timestamp,
          interactions: addresses.length,
        })),
      );
    }

    const stackedWallets = uniqueInteractions.reduce((accumulator, current) => {
      const dayOfTheYear = dayjs.unix(current.timestamp).utc();

      return {
        ...accumulator,
        [dayOfTheYear]: {
          ...accumulator[dayOfTheYear],
          time: dayOfTheYear.startOf('day').format('YYYY-MM-DD'),
          [current.network]: current.interactions,
        },
      };
    }, {});

    return Object.values(stackedWallets);
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get the count for unique daily wallets that provided liquidity, performed a swap, or removed
 * liquidity for each network
 */
const getDailyUniqueInteractions = async (startTime) => {
  try {
    let uniqueInteractions = [];

    for (const { client, network } of SUPPORTED_CLIENTS) {
      const { data } = await client.query({
        query: DASHBOARD_UNIQUE_DAILY_INTERACTIONS,
        variables: {
          startTime,
        },
      });

      uniqueInteractions = uniqueInteractions.concat(
        data.dailyUniqueAddressInteractions.map(({ id, timestamp, addresses }) => ({
          id,
          network,
          timestamp,
          interactions: addresses.length,
        })),
      );
    }

    return uniqueInteractions.reduce((accumulator, current) => {
      return {
        ...accumulator,
        [current.network]: Number(current.interactions),
      };
    }, {});
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get the count for unique weekly wallets that provided liquidity, performed a swap, or removed
 * liquidity for each network
 */
const getWeeklyUniqueInteractions = async (startTime) => {
  try {
    let uniqueInteractions = [];

    for (const { client, network } of SUPPORTED_CLIENTS) {
      const { data } = await client.query({
        query: DASHBOARD_UNIQUE_WEEKLY_INTERACTIONS,
        variables: {
          startTime,
        },
      });

      uniqueInteractions = uniqueInteractions.concat(
        data.weeklyUniqueAddressInteractions.map(({ id, timestampStart, addresses }) => ({
          id,
          network,
          timestamp: timestampStart,
          interactions: addresses.length,
        })),
      );
    }

    return uniqueInteractions.reduce((accumulator, current) => {
      return {
        ...accumulator,
        [current.network]: Number(current.interactions),
      };
    }, {});
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get the count for unique monthly wallets that provided liquidity, performed a swap, or removed
 * liquidity for each network
 */
const getMonthlyUniqueInteractions = async (startTime) => {
  try {
    let uniqueInteractions = [];

    for (const { client, network } of SUPPORTED_CLIENTS) {
      const { data } = await client.query({
        query: DASHBOARD_UNIQUE_MONTHLY_INTERACTIONS,
        variables: {
          startTime,
        },
      });

      uniqueInteractions = uniqueInteractions.concat(
        data.monthlyUniqueAddressInteractions.map(({ id, timestamp, addresses }) => ({
          id,
          network,
          timestamp,
          interactions: addresses.length,
        })),
      );
    }

    return uniqueInteractions.reduce((accumulator, current) => {
      return {
        ...accumulator,
        [current.network]: Number(current.interactions),
      };
    }, {});
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get historical data for swaps for each network (last 1 month)
 */
const getPastYearSwaps = async () => {
  try {
    let swaps = [];

    const utcOneYearBack = dayjs.utc().subtract(1, 'year').startOf('day').unix();

    for (const { client, network } of SUPPORTED_CLIENTS) {
      const { data } = await client.query({
        query: DASHBOARD_SWAPS_HISTORY_WITH_TIMESTAMP,
        variables: {
          startTime: utcOneYearBack,
        },
      });

      swaps = swaps.concat(data.swaprDayDatas.map((swap) => ({ swap, network })));
    }

    const stackedSwaps = swaps.reduce((accumulator, current) => {
      const timestamp = dayjs.unix(current.swap.date).format('YYYY-MM-DD');

      return {
        ...accumulator,
        [timestamp]: {
          ...accumulator[timestamp],
          time: timestamp,
          [current.network]: Number(current.swap.dailySwaps),
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
      const { data } = await client.query({
        query: DASHBOARD_SWAPS_HISTORY_WITH_TIMESTAMP,
        variables: {
          startTime: utcOneDayBack,
        },
      });

      swaps = swaps.concat(data.swaprDayDatas.map((swap) => ({ swap, network })));
    }

    const oneDaySwaps = swaps.reduce((accumulator, current) => {
      return {
        ...accumulator,
        [current.network]: Number(current.swap.dailySwaps),
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
