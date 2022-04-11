import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useReducer, useState, createContext, useContext, useMemo } from 'react';

import { clients } from '../apollo/client';
import { DASHBOARD_CHART } from '../apollo/queries';
import { SupportedNetwork } from '../constants';
import { getTimeframe } from '../utils';
import { useTimeframe } from './Application';

// format dayjs with the libraries needed
dayjs.extend(utc);
dayjs.extend(weekOfYear);

const DashboardDataContext = createContext([]);

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

const INITIAL_STATE = { stackedChartData: {} };
const UPDATE_CHART = 'UPDATE_CHART';
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

  return (
    <DashboardDataContext.Provider value={useMemo(() => [state, updateChart], [state, updateChart])}>
      {children}
    </DashboardDataContext.Provider>
  );
}

Provider.propTypes = {
  children: PropTypes.object.isRequired,
};

export function useDashboardChartData() {
  const [state, updateChart] = useDashboardDataContext();
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
    const startTime = getTimeframe(activeWindow);

    if ((activeWindow && startTime < (oldestDateFetch ?? 0)) || !oldestDateFetch) {
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

/**
 * Get historical data for volume and liquidity for each network
 * used on the dashboard page
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
  } catch (e) {
    console.log(e);
  }
  return data;
};
