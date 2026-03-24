import { useMutation, useQuery } from '@tanstack/react-query'
import {
  login,
  logout,
  me,
  register,
  type SessionUser,
} from './backend'
import { queryClient } from './queryClient'

const ME_QUERY_KEY = ['auth', 'me'] as const

export function useMeQuery() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: me,
    retry: false,
  })
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(ME_QUERY_KEY, { user: data.user })
    },
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      queryClient.setQueryData(ME_QUERY_KEY, { user: data.user })
    },
  })
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData<{ user: SessionUser } | null>(ME_QUERY_KEY, null)
    },
  })
}
