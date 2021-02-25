import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
} from "react";
import { blockClients, clients } from "../apollo/client";
import {
  NATIVE_CURRENCY_SYMBOL,
  NATIVE_CURRENCY_WRAPPER,
  SupportedNetwork,
} from "../constants";

const UPDATE_SELECTED_NETWORK = "UPDATE_SELECTED_NETWORK";

const NetworkContext = createContext();

function useNetworkContext() {
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

const INITIAL_STATE = {
  selectedNetwork: SupportedNetwork.XDAI,
};

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const updateSelectedNetwork = useCallback((selectedNetwork) => {
    dispatch({
      type: UPDATE_SELECTED_NETWORK,
      payload: { selectedNetwork },
    });
  }, []);

  return (
    <NetworkContext.Provider
      value={useMemo(() => [state, { updateSelectedNetwork }], [
        state,
        updateSelectedNetwork,
      ])}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useSelectedNetwork() {
  const [state] = useNetworkContext();
  return state.selectedNetwork;
}

export function useSelectedNetworkUpdater() {
  const [, { updateSelectedNetwork }] = useNetworkContext();
  return updateSelectedNetwork;
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
