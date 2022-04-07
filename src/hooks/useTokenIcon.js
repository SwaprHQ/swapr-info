import { useEffect, useState } from 'react';
import { ChainIdForSupportedNetwork, SupportedNetwork } from '../constants';
import { useSelectedNetwork } from '../contexts/Network';

const CACHE = {
  [SupportedNetwork.MAINNET]: {},
  [SupportedNetwork.XDAI]: {},
  [SupportedNetwork.ARBITRUM_ONE]: {},
};

export function useTokenIcon(address) {
  const selectedNetwork = useSelectedNetwork();
  const [uri, setUri] = useState();

  useEffect(() => {
    let cancelled = false;
    async function fetchTokenLogo() {
      if (!address) return undefined;

      if (Object.values(SupportedNetwork).indexOf(selectedNetwork) < 0) {
        console.warn(`could not fetch token logos for network ${selectedNetwork}`);
      }

      try {
        if (Object.keys(CACHE[selectedNetwork]).length === 0) {
          let tokenListURL = '';
          if (selectedNetwork === SupportedNetwork.MAINNET) {
            tokenListURL = 'https://tokens.coingecko.com/uniswap/all.json'; // coingecko list used for mainnet
          } else if (selectedNetwork === SupportedNetwork.XDAI) {
            tokenListURL = 'https://tokens.honeyswap.org'; // honeyswap list used for xdai
          } else {
            tokenListURL = 'https://ipfs.io/ipfs/QmPQcxPxytZEGBdNSj1gu9QNQScXVVZNat3VcqzdDyR8QU'; // Swapr token list
          }
          const response = await fetch(tokenListURL);
          if (!response.ok) {
            console.warn(`could not fetch token list at ${tokenListURL}`);
            return;
          }
          const { tokens } = await response.json();
          const selectedNetworkChainId = ChainIdForSupportedNetwork[selectedNetwork];
          CACHE[selectedNetwork] = tokens.reduce((cache, token) => {
            if (token.chainId !== selectedNetworkChainId) return cache;
            cache[token.address.toLowerCase()] = token.logoURI;
            return cache;
          }, {});
        }
        if (!cancelled) setUri(CACHE[selectedNetwork][address.toLowerCase()]);
      } catch (e) {
        console.log(`Failed to fetch token logo for ${address}`, e);
      }
    }

    fetchTokenLogo();

    return () => {
      cancelled = true;
    };
  }, [selectedNetwork, address]);

  return uri;
}
