import { useEffect, useMemo, useState } from "react";
import { CHAIN_READONLY_PROVIDERS } from "../constants";
import { useSelectedNetwork } from "../contexts/Network";
import { Contract } from "@ethersproject/contracts";
import PAIR_ABI from "../abis/pair.json";

export function usePairSwapFee(pairAddress) {
  const selectedNetwork = useSelectedNetwork();
  const readonlyProvider = CHAIN_READONLY_PROVIDERS[selectedNetwork];
  const pairContract = useMemo(() => {
    if (!pairAddress || !readonlyProvider) return undefined;
    return new Contract(pairAddress, PAIR_ABI, readonlyProvider);
  }, [readonlyProvider, pairAddress]);
  const [swapFee, setSwapFee] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchTokenLogo() {
      if (!pairContract) return undefined;
      const swapFeeBips = await pairContract.swapFee();
      if (!cancelled) setSwapFee(swapFeeBips);
    }
    fetchTokenLogo();
    return () => {
      cancelled = true;
    };
  }, [pairContract]);

  return swapFee;
}
