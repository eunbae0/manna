import { useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

/**
 * Calls the provided refetch function whenever the screen is focused.
 * @param refetch - The function to be called on focus
 */
export function useRefetchOnFocus(refetch: () => void): void {
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);
}
