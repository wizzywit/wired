import { queryClient } from '../../../service';
import { ME_QUERY_KEY } from '../../../hooks';
import { type SessionUser } from '../../../domain-types';
import { logout } from './logoutAdapter';
import { useMutation } from '@tanstack/react-query';

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData<{ user: SessionUser } | null>(ME_QUERY_KEY, null);
    },
  });
}
