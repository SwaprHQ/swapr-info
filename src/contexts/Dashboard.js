import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
import PropTypes from "prop-types";
import React, {
  useCallback,
  useEffect,
  useReducer,
  useState,
  createContext,
  useContext,
  useMemo,
} from "react";

import { GLOBAL_CHART } from "../apollo/queries";
import { useTimeframe } from "./Application";
import { getTimeframe } from "../utils";
import { clients } from "../apollo/client";
import { SupportedNetwork } from "../constants";

// format dayjs with the libraries needed
dayjs.extend(utc);
dayjs.extend(weekOfYear);

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

const INITIAL_STATE = { stackedChartData: {} };
const UPDATE_CHART = "UPDATE_CHART";
const RESET = "RESET";

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
      throw Error(
        `Unexpected action type in DashboardContext reducer: '${type}'.`
      );
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
    <DashboardDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            updateChart,
          },
        ],
        [state, updateChart]
      )}
    >
      {children}
    </DashboardDataContext.Provider>
  );
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

/**
 * Get historical data for volume and liquidity for each network
 * used on the dashboard page
 * @param {*} oldestDateToFetch // start of window to fetch from
 */
const getChartData = async (oldestDateToFetch) => {
  try {
    let data = [];
    const utcEndTime = dayjs.utc();

    // fetch data for each of the clients and add the
    // linked network key to each day object
    for (const { network, client } of SUPPORTED_CLIENTS) {
      let skip = 0;
      let allFound = false;

      while (!allFound) {
        let result = await client.query({
          query: GLOBAL_CHART,
          variables: {
            startTime: oldestDateToFetch,
            skip,
          },
        });

        skip += 1000;
        data = data.concat(
          result.data.swaprDayDatas.map((dayData) => ({
            ...dayData,
            network,
          }))
        );

        if (result.data.swaprDayDatas.length < 1000) {
          allFound = true;
        }
      }
    }

    if (data && data.length > 0) {
      let dayIndexSet = new Set();
      let dayIndexArray = [];
      const oneDay = 24 * 60 * 60;

      // for each day, parse the daily volume and format for chart array
      data.forEach((dayData, i) => {
        // add the day index to the set of days
        dayIndexSet.add((data[i].date / oneDay).toFixed(0));
        dayIndexArray.push(data[i]);
        dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD);
      });

      // fill in empty days (there will be no day datas if no trades made that day)
      let timestamp = data[0].date ? data[0].date : oldestDateToFetch;
      let latestLiquidityUSD = data[0].totalLiquidityUSD;
      let latestDayDats = data[0].mostLiquidTokens;
      let index = 1;
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay;
        let currentDayIndex = (nextDay / oneDay).toFixed(0);
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dailyVolumeUSD: 0,
            totalLiquidityUSD: latestLiquidityUSD,
            mostLiquidTokens: latestDayDats,
          });
        } else {
          latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD;
          latestDayDats = dayIndexArray[index].mostLiquidTokens;
          index = index + 1;
        }
        timestamp = nextDay;
      }
    }

    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));

    return data;
  } catch (e) {
    console.log(e);
  }
};
