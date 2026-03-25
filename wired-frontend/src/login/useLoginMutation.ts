import { queryClient } from '../service';
import { ME_QUERY_KEY } from '../hooks';
import { login } from './loginAdapter';
import { useMutation } from '@tanstack/react-query';

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(ME_QUERY_KEY, { user: data.user });
    },
  });
}
