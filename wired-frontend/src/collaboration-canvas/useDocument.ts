import { queryClient } from '../service';
import { getDocument, patchDocument } from './documentAdapter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DOCUMENTS_QUERY_KEY } from '../dashboard';

const documentQueryKey = (id: string) => ['documents', id] as const;

export function useDocumentQuery(documentId: string | undefined, enabled = true) {
  const id = documentId?.trim() ?? '';
  return useQuery({
    queryKey: documentQueryKey(id),
    queryFn: async () => {
      const res = await getDocument(id);
      return res.document;
    },
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

export function useUpdateDocumentMutation() {
  return useMutation({
    mutationFn: ({ documentId, title }: { documentId: string; title: string }) => patchDocument(documentId, { title }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: documentQueryKey(vars.documentId),
      });
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });
}
