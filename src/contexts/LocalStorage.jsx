import { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react';

import { ChainId, SupportedNetwork } from '../constants';
import { useSelectedNetwork } from './Network';

const SWAPR = 'SWAPR';

const VERSION = 'VERSION';
const CURRENT_VERSION = 0;
const LAST_SAVED = 'LAST_SAVED';
const DISMISSED_PATHS = 'DISMISSED_PATHS';
const SAVED_ACCOUNTS = 'SAVED_ACCOUNTS';
const SAVED_TOKENS = 'SAVED_TOKENS';
const SAVED_PAIRS = 'SAVED_PAIRS';
const SAVED_SELECTED_NETWORK = 'SAVED_SELECTED_NETWORK';

const DARK_MODE = 'DARK_MODE';

const UPDATABLE_KEYS = [DARK_MODE, DISMISSED_PATHS, SAVED_ACCOUNTS, SAVED_PAIRS, SAVED_TOKENS, SAVED_SELECTED_NETWORK];

const UPDATE_KEY = 'UPDATE_KEY';

const LocalStorageContext = createContext();

function useLocalStorageContext() {
  return useContext(LocalStorageContext);
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_KEY: {
      const { key, value } = payload;
      if (!UPDATABLE_KEYS.some((k) => k === key)) {
        throw Error(`Unexpected key in LocalStorageContext reducer: '${key}'.`);
      } else {
        return {
          ...state,
          [key]: value,
        };
      }
    }
    default: {
      throw Error(`Unexpected action type in LocalStorageContext reducer: '${type}'.`);
    }
  }
}

function init() {
  const defaultLocalStorage = {
    [VERSION]: CURRENT_VERSION,
    [DARK_MODE]: true,
    [DISMISSED_PATHS]: {},
    [SAVED_ACCOUNTS]: [],
    [SAVED_TOKENS]: {},
    [SAVED_PAIRS]: {},
    [SAVED_SELECTED_NETWORK]: SupportedNetwork.MAINNET,
  };

  try {
    const parsed = JSON.parse(window.localStorage.getItem(SWAPR));
    if (parsed[VERSION] !== CURRENT_VERSION) {
      // this is where we could run migration logic
      return defaultLocalStorage;
    } else {
      return { ...defaultLocalStorage, ...parsed };
    }
  } catch {
    return defaultLocalStorage;
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  const updateKey = useCallback((key, value) => {
    dispatch({ type: UPDATE_KEY, payload: { key, value } });
  }, []);

  return (
    <LocalStorageContext.Provider value={useMemo(() => [state, { updateKey }], [state, updateKey])}>
      {children}
    </LocalStorageContext.Provider>
  );
}

export function Updater() {
  const [state] = useLocalStorageContext();

  useEffect(() => {
    window.localStorage.setItem(SWAPR, JSON.stringify({ ...state, [LAST_SAVED]: Math.floor(Date.now() / 1000) }));
  });

  return null;
}

export function useDarkModeManager() {
  return [true];
}

export function usePathDismissed(path) {
  const [state, { updateKey }] = useLocalStorageContext();
  const pathDismissed = state?.[DISMISSED_PATHS]?.[path];
  function dismiss() {
    let newPaths = state?.[DISMISSED_PATHS];
    newPaths[path] = true;
    updateKey(DISMISSED_PATHS, newPaths);
  }

  return [pathDismissed, dismiss];
}

export function useSavedAccounts() {
  const [state, { updateKey }] = useLocalStorageContext();
  const selectedNetwork = useSelectedNetwork();
  const savedAccounts = state?.[SAVED_ACCOUNTS];

  const addAccount = useCallback(
    (account) => {
      const isAlreadySaved = savedAccounts?.findIndex((savedAccount) => savedAccount.id === account.id) ?? -1;

      if (isAlreadySaved === -1) {
        updateKey(SAVED_ACCOUNTS, [...(savedAccounts ?? []), account]);
      }
    },
    [savedAccounts, updateKey],
  );

  const removeAccount = useCallback(
    (accountId) => {
      let index = savedAccounts?.findIndex((account) => account.id === accountId) ?? -1;

      if (index > -1) {
        updateKey(SAVED_ACCOUNTS, [
          ...savedAccounts.slice(0, index),
          ...savedAccounts.slice(index + 1, savedAccounts.length),
        ]);
      }
    },
    [savedAccounts, updateKey],
  );

  // return the saved accounts only for the currently active network
  const savedAccountForActiveNetwork = savedAccounts.filter(
    (savedAccount) => savedAccount.network === ChainId[selectedNetwork],
  );

  return [savedAccountForActiveNetwork, addAccount, removeAccount];
}

export function useSavedPairs() {
  const [state, { updateKey }] = useLocalStorageContext();
  const savedPairs = state?.[SAVED_PAIRS];

  function addPair(address, token0Address, token1Address, token0Symbol, token1Symbol) {
    let newList = state?.[SAVED_PAIRS];
    newList[address] = {
      address,
      token0Address,
      token1Address,
      token0Symbol,
      token1Symbol,
    };
    updateKey(SAVED_PAIRS, newList);
  }

  function removePair(address) {
    let newList = state?.[SAVED_PAIRS];
    newList[address] = null;
    updateKey(SAVED_PAIRS, newList);
  }

  return [savedPairs, addPair, removePair];
}

export function useSavedTokens() {
  const [state, { updateKey }] = useLocalStorageContext();
  const savedTokens = state?.[SAVED_TOKENS];

  function addToken(address, symbol) {
    let newList = state?.[SAVED_TOKENS];
    newList[address] = {
      symbol,
    };
    updateKey(SAVED_TOKENS, newList);
  }

  function removeToken(address) {
    let newList = state?.[SAVED_TOKENS];
    newList[address] = null;
    updateKey(SAVED_TOKENS, newList);
  }

  return [savedTokens, addToken, removeToken];
}

export function useSavedNetwork() {
  const [state, { updateKey }] = useLocalStorageContext();
  const savedSelectedNetwork = state?.[SAVED_SELECTED_NETWORK];

  function updateSavedSelectedNetwork(newSelectedNetwork) {
    updateKey(SAVED_SELECTED_NETWORK, newSelectedNetwork);
  }

  return [savedSelectedNetwork, updateSavedSelectedNetwork];
}
