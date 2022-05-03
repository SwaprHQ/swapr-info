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
    function getTokenLogo() {
      if (!address) {
        return;
      }

      const lowercaseAddress = address.toLowerCase();
      try {
        if (LOGO_CACHE[lowercaseAddress] && !cancelled) {
          setUri(LOGO_CACHE[lowercaseAddress]);
          return;
        }

        const validToken = tokensLists.get(lowercaseAddress);
        if (validToken && validToken?.logoURI) {
          LOGO_CACHE[lowercaseAddress] = uriToHttp(validToken.logoURI);
          if (!cancelled) {
            setUri(LOGO_CACHE[lowercaseAddress]);
          }
          return;
        }
      } catch (e) {
        console.log(`Failed to get token logo for ${address}`, e);
      }
    }

    getTokenLogo();

    return () => {
      cancelled = true;
    };
  }, [selectedNetwork, address, tokensLists]);

  return uri;
}
