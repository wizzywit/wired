import { useCallback, useMemo, useState } from 'react';
import {
  useDocumentShareQuery,
  useInviteDocumentCollaboratorMutation,
  useRevokeDocumentInviteMutation,
  useRemoveDocumentCollaboratorMutation,
  useUpdateDocumentCollaboratorRoleMutation,
  useUpdateDocumentLinkAccessMutation,
} from './useShare';
import type { LinkAccess } from './shareTypes';

export function useShareDialogUseCase({
  documentId,
  documentTitle,
  open,
}: {
  documentId: string;
  documentTitle: string;
  open: boolean;
}) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [copySuccess, setCopySuccess] = useState(false);
  const [toast, setToast] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const shareQuery = useDocumentShareQuery(documentId, open);
  const inviteMutation = useInviteDocumentCollaboratorMutation(documentId);
  const updateRoleMutation = useUpdateDocumentCollaboratorRoleMutation(documentId);
  const removeMutation = useRemoveDocumentCollaboratorMutation(documentId);
  const linkAccessMutation = useUpdateDocumentLinkAccessMutation(documentId);
  const revokeInviteMutation = useRevokeDocumentInviteMutation(documentId);

  const share = shareQuery.data;
  const canShare = Boolean(share?.canShare);
  const isBusy =
    inviteMutation.isPending ||
    updateRoleMutation.isPending ||
    removeMutation.isPending ||
    linkAccessMutation.isPending ||
    revokeInviteMutation.isPending;
  const isLoading = open && (shareQuery.isPending || shareQuery.isFetching);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return `/canvas?document=${encodeURIComponent(documentId)}`;
    return `${window.location.origin}/canvas?document=${encodeURIComponent(documentId)}`;
  }, [documentId]);

  const resetDialogTransientState = useCallback(() => {
    setCopySuccess(false);
    setToast(null);
  }, []);

  const submitInvite = useCallback(async () => {
    const email = inviteEmail.trim();
    if (!email || !canShare) return;
    try {
      await inviteMutation.mutateAsync({ email, role: inviteRole });
      setInviteEmail('');
      setToast({ tone: 'success', message: 'Invite sent.' });
    } catch (error) {
      setToast({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to send invite.',
      });
    }
  }, [canShare, inviteEmail, inviteMutation, inviteRole]);

  const changeUserRole = useCallback(
    async (userId: string, role: 'editor' | 'viewer') => {
      if (!canShare) return;
      try {
        await updateRoleMutation.mutateAsync({ userId, role });
        setToast({ tone: 'success', message: 'Role updated.' });
      } catch (error) {
        setToast({
          tone: 'error',
          message: error instanceof Error ? error.message : 'Unable to update role.',
        });
      }
    },
    [canShare, updateRoleMutation]
  );

  const removeUser = useCallback(
    async (userId: string) => {
      if (!canShare) return;
      try {
        await removeMutation.mutateAsync(userId);
        setToast({ tone: 'success', message: 'Access removed.' });
      } catch (error) {
        setToast({
          tone: 'error',
          message: error instanceof Error ? error.message : 'Unable to remove access.',
        });
      }
    },
    [canShare, removeMutation]
  );

  const changeLinkAccess = useCallback(
    async (access: LinkAccess) => {
      if (!canShare) return;
      try {
        await linkAccessMutation.mutateAsync(access);
        setToast({ tone: 'success', message: 'General access updated.' });
      } catch (error) {
        setToast({
          tone: 'error',
          message: error instanceof Error ? error.message : 'Unable to update general access.',
        });
      }
    },
    [canShare, linkAccessMutation]
  );

  const revokeInvite = useCallback(
    async (email: string) => {
      if (!canShare) return;
      try {
        await revokeInviteMutation.mutateAsync(email);
        setToast({ tone: 'success', message: 'Invite revoked.' });
      } catch (error) {
        setToast({
          tone: 'error',
          message: error instanceof Error ? error.message : 'Unable to revoke invite.',
        });
      }
    },
    [canShare, revokeInviteMutation]
  );

  const copyShareUrl = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setToast({ tone: 'success', message: 'Link copied.' });
    setTimeout(() => setCopySuccess(false), 1800);
  }, [shareUrl]);

  return {
    resetDialogTransientState,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    submitInvite,
    changeUserRole,
    removeUser,
    changeLinkAccess,
    copyShareUrl,
    copySuccess,
    shareUrl,
    canShare,
    isBusy,
    isLoading,
    toast,
    clearToast: () => setToast(null),
    share,
    fallbackTitle: documentTitle,
    revokeInvite,
  };
}
