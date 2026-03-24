import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createDocument,
  getDocument,
  listDocuments,
  login,
  logout,
  me,
  patchDocument,
  register,
  type SessionUser,
  type WireDocument,
} from './backend'
import { queryClient } from './queryClient'

const ME_QUERY_KEY = ['auth', 'me'] as const
const DOCUMENTS_QUERY_KEY = ['documents'] as const

const documentQueryKey = (id: string) => ['documents', id] as const

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

export function useDocumentsQuery(enabled = true) {
  return useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: async () => {
      const res = await listDocuments()
      return res.documents
    },
    enabled,
  })
}

export function useDocumentQuery(documentId: string | undefined, enabled = true) {
  const id = documentId?.trim() ?? ''
  return useQuery({
    queryKey: documentQueryKey(id),
    queryFn: async () => {
      const res = await getDocument(id)
      return res.document
    },
    enabled: Boolean(id) && enabled,
    retry: false,
  })
}

export function useCreateDocumentMutation() {
  return useMutation({
    mutationFn: (input?: { title?: string }) => createDocument(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY })
    },
  })
}

export function useUpdateDocumentMutation() {
  return useMutation({
    mutationFn: ({
      documentId,
      title,
    }: {
      documentId: string
      title: string
    }) => patchDocument(documentId, { title }),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: documentQueryKey(vars.documentId),
      })
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY })
    },
  })
}

export type { WireDocument }
