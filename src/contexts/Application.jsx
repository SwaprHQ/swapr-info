import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { createContext, useContext, useReducer, useMemo, useCallback, useState, useEffect } from 'react';

import { healthClient } from '../apollo/client';
import { SUBGRAPH_HEALTH } from '../apollo/queries';
import {
  BLOCK_DIFFERENCE_THRESHOLD,
  DEFAULT_BLOCK_DIFFERENCE_THRESHOLD,
  NETWORK_SUBGRAPH_URLS,
  timeframeOptions,
  TOKEN_LISTS,
} from '../constants';
import { useSelectedNetwork } from './Network';

dayjs.extend(utc);

const RESET = 'RESET';
const UPDATE = 'UPDATE';
const UPDATE_TIMEFRAME = 'UPDATE_TIMEFRAME';
const UPDATE_SESSION_START = 'UPDATE_SESSION_START';
const UPDATED_SUPPORTED_TOKENS = 'UPDATED_SUPPORTED_TOKENS';
const UPDATED_TOKENS_LISTS = 'UPDATE_TOKENS_LISTS';
const UPDATE_LATEST_BLOCK = 'UPDATE_LATEST_BLOCK';
const UPDATE_HEAD_BLOCK = 'UPDATE_HEAD_BLOCK';

const SUPPORTED_TOKENS = 'SUPPORTED_TOKENS';
const TIME_KEY = 'TIME_KEY';
const CURRENCY = 'CURRENCY';
const SESSION_START = 'SESSION_START';
const LATEST_BLOCK = 'LATEST_BLOCK';
const HEAD_BLOCK = 'HEAD_BLOCK';
const BAD_IMAGE_URLS = 'BAD_IMAGE_URLS';

export const ApplicationContext = createContext();

export function useApplicationContext() {
  return useContext(ApplicationContext);
}

const INITIAL_STATE = {
  CURRENCY: 'USD',
  TIME_KEY: timeframeOptions.ALL_TIME,
  [BAD_IMAGE_URLS]: {},
  TOKEN_LISTS: new Map(),
};

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { currency } = payload;
      return {
        ...state,
        [CURRENCY]: currency,
      };
    }

    case UPDATE_TIMEFRAME: {
      const { newTimeFrame } = payload;
      return {
        ...state,
        [TIME_KEY]: newTimeFrame,
      };
    }

    case UPDATE_SESSION_START: {
      const { timestamp } = payload;
      return {
        ...state,
        [SESSION_START]: timestamp,
      };
    }

    case UPDATE_LATEST_BLOCK: {
      const { block } = payload;
      return {
        ...state,
        [LATEST_BLOCK]: block,
      };
    }

    case UPDATE_HEAD_BLOCK: {
      const { block } = payload;
      return {
        ...state,
        [HEAD_BLOCK]: block,
      };
    }

    case UPDATED_SUPPORTED_TOKENS: {
      const { supportedTokens } = payload;
      return {
        ...state,
        [SUPPORTED_TOKENS]: supportedTokens,
      };
    }

    case UPDATED_TOKENS_LISTS: {
      const { tokens } = payload;
      return {
        ...state,
        TOKEN_LISTS: tokens,
      };
    }

    case RESET: {
      return INITIAL_STATE;
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`);
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const update = useCallback((currency) => {
    dispatch({
      type: UPDATE,
      payload: {
        currency,
      },
    });
  }, []);

  // global time window for charts - see timeframe options in constants
  const updateTimeframe = useCallback((newTimeFrame) => {
    dispatch({
      type: UPDATE_TIMEFRAME,
      payload: {
        newTimeFrame,
      },
    });
  }, []);

  // used for refresh button
  const updateSessionStart = useCallback((timestamp) => {
    dispatch({
      type: UPDATE_SESSION_START,
      payload: {
        timestamp,
      },
    });
  }, []);

  const updateSupportedTokens = useCallback((supportedTokens) => {
    dispatch({
      type: UPDATED_SUPPORTED_TOKENS,
      payload: {
        supportedTokens,
      },
    });
  }, []);

  const updateLatestBlock = useCallback((block) => {
    dispatch({
      type: UPDATE_LATEST_BLOCK,
      payload: {
        block,
      },
    });
  }, []);

  const updateHeadBlock = useCallback((block) => {
    dispatch({
      type: UPDATE_HEAD_BLOCK,
      payload: {
        block,
      },
    });
  }, []);

  const updateTokenLists = useCallback((tokens) => {
    dispatch({
      type: UPDATED_TOKENS_LISTS,
      payload: {
        tokens,
      },
    });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: RESET });
  }, []);

  return (
    <ApplicationContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateSessionStart,
            updateTimeframe,
            updateSupportedTokens,
            updateTokenLists,
            updateLatestBlock,
            updateHeadBlock,
            reset,
          },
        ],
        [
          state,
          update,
          updateTimeframe,
          updateSessionStart,
          updateSupportedTokens,
          updateTokenLists,
          updateLatestBlock,
          updateHeadBlock,
          reset,
        ],
      )}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useLatestBlocks() {
  const [state, { updateLatestBlock, updateHeadBlock }] = useApplicationContext();
  const network = useSelectedNetwork();

  const latestBlock = state?.[LATEST_BLOCK];
  const headBlock = state?.[HEAD_BLOCK];

  useEffect(() => {
    async function fetch() {
      healthClient
        .query({
          query: SUBGRAPH_HEALTH,
          variables: {
            name: NETWORK_SUBGRAPH_URLS[network],
          },
        })
        .then((res) => {
          const [chainData] = res.data.indexingStatusForCurrentVersion.chains;
          const syncedBlock = parseInt(chainData?.latestBlock?.number);
          const headBlock = parseInt(chainData?.chainHeadBlock?.number);

          if (syncedBlock && headBlock) {
            updateLatestBlock(syncedBlock);
            updateHeadBlock(headBlock);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
    if (!latestBlock) {
      fetch();
    }
  }, [latestBlock, updateHeadBlock, updateLatestBlock, network]);

  return [latestBlock, headBlock];
}

export function isSyncedBlockAboveThreshold(latestBlock, headBlock, selectedNetwork = undefined) {
  if (isNaN(latestBlock) || isNaN(headBlock)) {
    return false;
  }

  const threshold = selectedNetwork
    ? BLOCK_DIFFERENCE_THRESHOLD[selectedNetwork] || DEFAULT_BLOCK_DIFFERENCE_THRESHOLD
    : DEFAULT_BLOCK_DIFFERENCE_THRESHOLD;

  return Math.abs(latestBlock - headBlock) > threshold;
}

export function useTimeframe() {
  const [state, { updateTimeframe }] = useApplicationContext();
  const activeTimeframe = state?.[TIME_KEY];
  return [activeTimeframe, updateTimeframe];
}

export function useStartTimestamp() {
  const [activeWindow] = useTimeframe();
  const [startDateTimestamp, setStartDateTimestamp] = useState();

  // monitor the old date fetched
  useEffect(() => {
    let startTime =
      dayjs
        .utc()
        .subtract(
          1,
          activeWindow === timeframeOptions.week
            ? 'week'
            : activeWindow === timeframeOptions.ALL_TIME
            ? 'year'
            : 'year',
        )
        .startOf('day')
        .unix() - 1;
    // if we find a new start time less than the current startrtime - update oldest pooint to fetch
    setStartDateTimestamp(startTime);
  }, [activeWindow, startDateTimestamp]);

  return startDateTimestamp;
}

// keep track of session length for refresh ticker
export function useSessionStart() {
  const [state, { updateSessionStart }] = useApplicationContext();
  const sessionStart = state?.[SESSION_START];

  useEffect(() => {
    if (!sessionStart) {
      updateSessionStart(Date.now());
    }
  });

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    interval = setInterval(() => {
      setSeconds(Date.now() - sessionStart ?? Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, sessionStart]);

  return parseInt(seconds / 1000);
}

export function useApplicationContextResetter() {
  const [, { reset }] = useApplicationContext();
  return reset;
}

export function useTokensLists() {
  const [state, { updateTokenLists }] = useApplicationContext();

  useEffect(() => {
    const tokenMap = new Map();
    async function fetchTokensLists() {
      const tokensLists = await Promise.all(
        TOKEN_LISTS.map(async (url) => {
          try {
            const resp = await fetch(url);
            return await resp.json();
          } catch (error) {
            console.warn("Couldn't load a token list", url, error);
          }
        }),
      );

      tokensLists
        .filter((list) => list)
        .forEach((list) => {
          if (list?.tokens?.length > 0) {
            list.tokens.forEach(({ address, logoURI }) => {
              if (address && logoURI) {
                tokenMap.set(address.toLowerCase(), { logoURI });
              }
            });
          }
        });

      updateTokenLists(tokenMap);
    }

    if (state.TOKEN_LISTS.size === 0) {
      fetchTokensLists();
    }
  }, [state.TOKEN_LISTS, updateTokenLists]);

  return state.TOKEN_LISTS;
}
