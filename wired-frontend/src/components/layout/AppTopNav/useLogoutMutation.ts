import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '../../../service';
import { ME_QUERY_KEY } from '../../../hooks';
import { type SessionUser } from '../../../domain-types';
import { logout } from './logoutAdapter';

export function useLogoutMutation() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData<{ user: SessionUser } | null>(ME_QUERY_KEY, null);
      navigate('/login', { replace: true });
    },
  });
}
