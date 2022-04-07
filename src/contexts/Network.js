import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { blockClients, clients } from '../apollo/client';
import { ChainId, NATIVE_CURRENCY_SYMBOL, NATIVE_CURRENCY_WRAPPER, SupportedNetworkForChainId } from '../constants';
import { useSavedNetwork } from './LocalStorage';
import qs from 'qs';
import { useApplicationContextResetter } from './Application';
import { useGlobalContextResetter } from './GlobalData';
import { usePairContextResetter } from './PairData';
import { useTokenContextResetter } from './TokenData';
import { useUserContextResetter } from './User';

export const UPDATE_SELECTED_NETWORK = 'UPDATE_SELECTED_NETWORK';

const NetworkContext = createContext();

export function useNetworkContext() {
  return useContext(NetworkContext);
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_SELECTED_NETWORK: {
      const { selectedNetwork } = payload;
      return {
        ...state,
        selectedNetwork,
      };
    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`);
    }
  }
}

export default function Provider({ children }) {
  const [previouslySelectedNetwork, updateSavedSelectedNetwork] = useSavedNetwork();
  const INITIAL_STATE = {
    selectedNetwork: previouslySelectedNetwork,
  };
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const updateSelectedNetwork = useCallback(
    (selectedNetwork) => {
      dispatch({
        type: UPDATE_SELECTED_NETWORK,
        payload: { selectedNetwork },
      });
      updateSavedSelectedNetwork(selectedNetwork);
    },
    [updateSavedSelectedNetwork],
  );

  return (
    <NetworkContext.Provider value={useMemo(() => [state, { updateSelectedNetwork }], [state, updateSelectedNetwork])}>
      {children}
    </NetworkContext.Provider>
  );
}

// must be nested into hashrouter to work
export function Updater() {
  const { search } = useLocation();
  const [state] = useNetworkContext();
  const updateSelectedNetwork = useSelectedNetworkUpdater();

  useEffect(() => {
    const { chainId: chainIdFromUrl } = qs.parse(search, {
      ignoreQueryPrefix: true,
    });
    const currentlySelectedChainId = ChainId[state.selectedNetwork];
    if (
      chainIdFromUrl &&
      Object.values(ChainId).some((chainId) => chainId === parseInt(chainIdFromUrl)) &&
      currentlySelectedChainId !== parseInt(chainIdFromUrl)
    ) {
      updateSelectedNetwork(SupportedNetworkForChainId[chainIdFromUrl]);
    }
  }, [state.selectedNetwork, search, updateSelectedNetwork]);

  return null;
}

export function useSelectedNetwork() {
  const [state] = useNetworkContext();
  return state.selectedNetwork;
}

export function useSelectedNetworkUpdater() {
  const [, { updateSelectedNetwork }] = useNetworkContext();
  const resetApplicationContext = useApplicationContextResetter();
  const resetGlobalContext = useGlobalContextResetter();
  const resetPairContext = usePairContextResetter();
  const resetTokenContext = useTokenContextResetter();
  const resetUserContext = useUserContextResetter();

  return (newNetwork) => {
    resetApplicationContext();
    resetGlobalContext();
    resetPairContext();
    resetTokenContext();
    resetUserContext();
    updateSelectedNetwork(newNetwork);
  };
}

export function useSwaprSubgraphClient() {
  const [state] = useNetworkContext();
  return clients[state.selectedNetwork];
}

export function useBlocksSubgraphClient() {
  const [state] = useNetworkContext();
  return blockClients[state.selectedNetwork];
}

export function useNativeCurrencySymbol() {
  const [state] = useNetworkContext();
  return NATIVE_CURRENCY_SYMBOL[state.selectedNetwork];
}

export function useNativeCurrencyWrapper() {
  const [state] = useNetworkContext();
  return NATIVE_CURRENCY_WRAPPER[state.selectedNetwork];
}
