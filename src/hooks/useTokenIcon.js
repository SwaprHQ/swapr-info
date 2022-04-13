import { useEffect, useState } from 'react';

import { useTokensLists } from '../contexts/Application';
import { useSelectedNetwork } from '../contexts/Network';
import { uriToHttp } from '../utils';

const LOGO_CACHE = {};

export function useTokenIcon(address) {
  const selectedNetwork = useSelectedNetwork();
  const tokensLists = useTokensLists();
  const [uri, setUri] = useState();

  useEffect(() => {
    let cancelled = false;
    async function fetchTokenLogo() {
      if (!address) return undefined;

      try {
        if (LOGO_CACHE[address.toLowerCase()]) {
          if (!cancelled) {
            setUri(LOGO_CACHE[address.toLowerCase()]);
          }

          return;
        }

        const matchingTokens = tokensLists.map((list) =>
          list.tokens.find((token) => token.address.toLowerCase() === address.toLowerCase() && token.logoURI),
        );

        const firstValidToken = matchingTokens.find((token) => !!token);
        if (firstValidToken && firstValidToken.logoURI) {
          LOGO_CACHE[address.toLowerCase()] = uriToHttp(firstValidToken.logoURI)[0];

          if (!cancelled) {
            setUri(LOGO_CACHE[address.toLowerCase()]);
          }

          return;
        }
      } catch (e) {
        console.log(`Failed to fetch token logo for ${address}`, e);
      }
    }

    fetchTokenLogo();

    return () => {
      cancelled = true;
    };
  }, [selectedNetwork, address, tokensLists]);

  return uri;
}
