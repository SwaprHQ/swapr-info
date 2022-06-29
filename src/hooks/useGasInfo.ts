import { useEffect, useState } from 'react';

import { Networks } from '../constants';
import { useSelectedNetwork } from '../contexts/Network';

interface ChainGasInfo {
  [chain: string]: {
    url: string;
    requestConfig?: RequestInit;
    keys?: string[];
  };
}

const gasInfoChainUrls: ChainGasInfo = {
  [Networks.MAINNET]: {
    url: `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${
      process.env.REACT_APP_ETHERSCAN_API_KEY ?? ''
    }`,
    keys: ['ProposeGasPrice', 'FastGasPrice', 'SafeGasPrice'],
  },
  [Networks.XDAI]: {
    url: 'https://blockscout.com/xdai/mainnet/api/v1/gas-price-oracle',
    keys: ['average', 'fast', 'slow'],
  },
  [Networks.ARBITRUM_ONE]: {
    url: `https://arbitrum-mainnet.infura.io/v3/0ebf4dd05d6740f482938b8a80860d13`,
    requestConfig: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1,
      }),
    },
  },
};

interface Gas {
  fast: number;
  normal: number;
  slow: number;
}

const defaultGasState: Gas = {
  fast: 0,
  normal: 0,
  slow: 0,
};

/**
 * Fetches and return gas price information for the current active chain
 * @returns Gas prices
 */
export function useGasInfo(): { loading: boolean; gas: Gas } {
  const selectedNetwork = useSelectedNetwork();
  const [loading, setLoading] = useState<boolean>(true);
  const [gas, setGas] = useState<Gas>(defaultGasState);

  useEffect(() => {
    if (!selectedNetwork || !gasInfoChainUrls[selectedNetwork]) {
      setLoading(false);
      setGas(defaultGasState);
      return;
    }

    // Fetch gas price data
    const chainGasInfo = gasInfoChainUrls[selectedNetwork];

    fetch(chainGasInfo.url, chainGasInfo.requestConfig)
      .then((res) => res.json())
      .then((data) => {
        // Default gas prices
        let { normal, slow, fast } = defaultGasState;

        // Mainnet and xDAI uses external API
        if (selectedNetwork === Networks.MAINNET) {
          const keys = chainGasInfo.keys ?? [];

          normal = data.result[keys[0]];
          fast = data.result[keys[1]];
          slow = data.result[keys[2]];
        } else if (selectedNetwork === Networks.XDAI) {
          const keys = chainGasInfo.keys ?? [];

          normal = data[keys[0]];
          fast = data[keys[1]];
          slow = data[keys[2]];
        } else {
          // On Arbitrum (and other L2's), parse Gwei to decimal and round the number
          // There is no fast nor slow gas prices
          normal = parseFloat((parseInt(data.result, 16) / 1e9).toFixed(2));
        }
        // Update state
        setGas({ normal, fast, slow });
      })
      .catch((e) => {
        console.error('useGasInfo error: ', e);
        setGas(defaultGasState);
      })
      .finally(() => setLoading(false));
  }, [selectedNetwork]);

  return {
    loading,
    gas,
  };
}
