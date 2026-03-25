import { queryClient } from '../service';
import { ME_QUERY_KEY } from '../hooks';
import { register } from './registerAdapter';
import { useMutation } from '@tanstack/react-query';

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      queryClient.setQueryData(ME_QUERY_KEY, { user: data.user });
    },
  });
}
