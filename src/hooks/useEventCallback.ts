import { useCallback } from 'react';

import useLatestRef from './useLatestRef';

type AnyFunction = (...args: any[]) => any;

export default function useEventCallback<Fn extends AnyFunction>(
  fn: Fn,
): keyof Fn extends keyof AnyFunction ? Fn : Omit<Fn, Exclude<keyof Fn, keyof AnyFunction>> {
  const fnRef = useLatestRef(fn);
  // @ts-expect-error return type mismatch
  return useCallback((...args: Parameters<Fn>): ReturnType<Fn> => fnRef.current(...args), [fnRef]);
}
