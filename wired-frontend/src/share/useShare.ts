import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../service';
import { DOCUMENTS_QUERY_KEY } from '../dashboard';
import {
  getDocumentShareState,
  inviteDocumentCollaborator,
  revokeDocumentInvite,
  removeDocumentCollaborator,
  updateDocumentCollaboratorRole,
  updateDocumentLinkAccess,
} from './shareAdapter';
import type { LinkAccess } from './shareTypes';

const documentShareQueryKey = (documentId: string) => ['documents', documentId, 'share'] as const;

function invalidateShareRelatedQueries(documentId: string) {
  void queryClient.invalidateQueries({ queryKey: documentShareQueryKey(documentId) });
  void queryClient.invalidateQueries({ queryKey: ['documents', documentId] });
  void queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
}

export function useDocumentShareQuery(documentId: string, enabled = true) {
  const id = documentId.trim();
  return useQuery({
    queryKey: documentShareQueryKey(id),
    queryFn: async () => {
      const res = await getDocumentShareState(id);
      return res.share;
    },
    enabled: Boolean(id) && enabled,
  });
}

export function useInviteDocumentCollaboratorMutation(documentId: string) {
  return useMutation({
    mutationFn: (vars: { email: string; role: 'editor' | 'viewer' }) =>
      inviteDocumentCollaborator(documentId, vars),
    onSuccess: () => invalidateShareRelatedQueries(documentId),
  });
}

export function useUpdateDocumentCollaboratorRoleMutation(documentId: string) {
  return useMutation({
    mutationFn: (vars: { userId: string; role: 'editor' | 'viewer' }) =>
      updateDocumentCollaboratorRole(documentId, vars.userId, { role: vars.role }),
    onSuccess: () => invalidateShareRelatedQueries(documentId),
  });
}

export function useRemoveDocumentCollaboratorMutation(documentId: string) {
  return useMutation({
    mutationFn: (userId: string) => removeDocumentCollaborator(documentId, userId),
    onSuccess: () => invalidateShareRelatedQueries(documentId),
  });
}

export function useUpdateDocumentLinkAccessMutation(documentId: string) {
  return useMutation({
    mutationFn: (access: LinkAccess) => updateDocumentLinkAccess(documentId, access),
    onSuccess: () => invalidateShareRelatedQueries(documentId),
  });
}

export function useRevokeDocumentInviteMutation(documentId: string) {
  return useMutation({
    mutationFn: (email: string) => revokeDocumentInvite(documentId, email),
    onSuccess: () => invalidateShareRelatedQueries(documentId),
  });
}
