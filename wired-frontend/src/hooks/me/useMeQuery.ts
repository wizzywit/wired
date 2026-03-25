import { me } from './meAdapter';
import { useQuery } from '@tanstack/react-query';

export const ME_QUERY_KEY = ['auth', 'me'] as const;

export function useMeQuery() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: me,
    retry: false,
  });
}
