import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// Hook to parse URL query parameters
function useQueryParams<T extends Record<string, unknown>>(): Partial<T> {
  const { search } = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(search);
    const result: Record<string, unknown> = {};

    for (const [key, value] of params.entries()) {
      // Try to parse numbers
      if (!isNaN(Number(value)) && value !== '') {
        result[key] = Number(value);
      } else {
        result[key] = value;
      }
    }

    return result as Partial<T>;
  }, [search]);
}

export default useQueryParams;