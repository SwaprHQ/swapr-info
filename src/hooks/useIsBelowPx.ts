import { useMedia } from 'react-use';

export function useIsBelowPx(px: number): boolean {
  return useMedia(`(max-width: ${px}px)`);
}
