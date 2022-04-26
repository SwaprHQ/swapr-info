import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useReducer, useState, createContext, useContext, useMemo } from 'react';

import { clients } from '../apollo/client';
import { DASHBOARD_CHART, DASHBOARD_COMULATIVE_DATA, DASHBOARD_TRANSACTION_HISTORY } from '../apollo/queries';
import { SupportedNetwork } from '../constants';
import { getTimeframe } from '../utils';
import { useTimeframe } from './Application';

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
  { network: SupportedNetwork.XDAI, client: clients[SupportedNetwork.XDAI] },
  {
    network: SupportedNetwork.ARBITRUM_ONE,
    client: clients[SupportedNetwork.ARBITRUM_ONE],
  },
];

const INITIAL_STATE = { stackedChartData: {}, comulativeData: {}, transactions: [] };
const UPDATE_CHART = 'UPDATE_CHART';
const UPDATE_COMULATIVE_DATA = 'UPDATE_COMULATIVE_DATA';
const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS';
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
        comulativeData: {
          ...comulativeNetworksData,
        },
      };
    }

    case UPDATE_TRANSACTIONS: {
      const { transactions } = payload;
      return {
        ...state,
        transactions,
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

  const updateTransactions = useCallback((transactions) => {
    dispatch({
      type: UPDATE_TRANSACTIONS,
      payload: {
        transactions,
      },
    });
  }, []);

  const value = useMemo(
    () => [state, { updateChart, updateComulativeData, updateTransactions }],
    [state, updateChart, updateComulativeData, updateTransactions],
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

export const useTransactionsData = () => {
  const [state, { updateTransactions }] = useDashboardDataContext();

  const existingTransactions = state?.transactions;

  useEffect(() => {
    async function fetchData() {
      const transactions = await getTransactions();
      updateTransactions(transactions);
    }

    if (!existingTransactions || existingTransactions.length === 0) {
      fetchData();
    }
  }, [existingTransactions, updateTransactions]);

  return existingTransactions;
};

/**
 * Get historical data for transaction for each network (last 3 months)
 */
const getTransactions = async () => {
  try {
    let transactions = [];

    const utcCurrentTime = dayjs();
    const utcThreeMonthsBack = utcCurrentTime.subtract(1, 'month').startOf('minute').unix();

    for (const { client, network } of SUPPORTED_CLIENTS) {
      let lastId = '';
      let fetchMore = true;

      while (fetchMore) {
        const { data } = await client.query({
          query: DASHBOARD_TRANSACTION_HISTORY,
          variables: {
            startTime: utcThreeMonthsBack,
            lastId,
          },
        });

        if (data.transactions.length === 0) {
          fetchMore = false;
          continue;
        }

        lastId = data.transactions[data.transactions.length - 1].id;
        transactions = transactions.concat(data.transactions.map((transaction) => ({ transaction, network })));
      }
    }

    const stackedTransactions = transactions.reduce((accumulator, current) => {
      const dayOfTheYear = dayjs.unix(current.transaction.timestamp).dayOfYear();

      return {
        ...accumulator,
        [dayOfTheYear]: {
          ...accumulator[dayOfTheYear],
          time: dayjs().dayOfYear(dayOfTheYear).utc().format('YYYY-MM-DD'),
          [current.network]:
            accumulator[dayOfTheYear] && accumulator[dayOfTheYear][current.network]
              ? Number(accumulator[dayOfTheYear][current.network]) + 1
              : 1,
        },
      };
    }, {});

    return Object.values(stackedTransactions);
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
