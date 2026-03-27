import { queryClient } from '../service';
import { createDocument, deleteDocument, listDocuments } from './dashboardAdapter';
import { useMutation, useQuery } from '@tanstack/react-query';

export const DOCUMENTS_QUERY_KEY = ['documents'] as const;

export function useCreateDocumentMutation() {
  return useMutation({
    mutationFn: (input?: { title?: string; initialYjsBase64?: string }) => createDocument(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });
}

export function useDocumentsQuery(enabled = true) {
  return useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: async () => {
      const res = await listDocuments();
      return res.documents;
    },
    enabled,
  });
}

export function useDeleteDocumentMutation() {
  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });
}
