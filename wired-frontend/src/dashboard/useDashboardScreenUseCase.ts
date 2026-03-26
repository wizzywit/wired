import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeQuery } from '../hooks';
import { useCreateDocumentMutation, useDeleteDocumentMutation, useDocumentsQuery } from './useDashboard';
import { type WireDocument } from '../domain-types';
import {
  buildCanvasPathForDocumentId,
  DASHBOARD_LOGIN_NEXT_ENCODED,
  normalizeDocumentsViewMode,
  resolveDashboardViewState,
} from './dashboardScreenLogic';

export function useDashboardScreenUseCase() {
  const navigate = useNavigate();
  const meQuery = useMeQuery();
  const docsQuery = useDocumentsQuery(Boolean(meQuery.data?.user));
  const createMutation = useCreateDocumentMutation();
  const deleteMutation = useDeleteDocumentMutation();
  const [documentsViewMode, setDocumentsViewMode] = useState<'grid' | 'list'>('grid');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (meQuery.isPending) return;
    if (meQuery.isError || !meQuery.data?.user) {
      navigate(`/login?next=${DASHBOARD_LOGIN_NEXT_ENCODED}`, { replace: true });
    }
  }, [meQuery.isPending, meQuery.isError, meQuery.data?.user, navigate]);

  const handleCreate = useCallback(async () => {
    try {
      const res = await createMutation.mutateAsync({});
      navigate(buildCanvasPathForDocumentId(res.document.id));
    } catch {
      /* surfaced via mutation state if needed */
    }
  }, [createMutation, navigate]);

  const openDocument = useCallback(
    (id: string) => {
      navigate(buildCanvasPathForDocumentId(id));
    },
    [navigate]
  );

  const requestDeleteDocument = useCallback((id: string) => {
    setPendingDeleteId(id);
  }, []);

  const cancelDeleteDocument = useCallback(() => {
    setPendingDeleteId(null);
  }, []);

  const confirmDeleteDocument = useCallback(async () => {
    if (!pendingDeleteId) return;
    await deleteMutation.mutateAsync(pendingDeleteId);
    setPendingDeleteId(null);
  }, [deleteMutation, pendingDeleteId]);

  const viewState = useMemo(
    () =>
      resolveDashboardViewState({
        mePending: meQuery.isPending,
        meError: meQuery.isError,
        hasUser: Boolean(meQuery.data?.user),
      }),
    [meQuery.data?.user, meQuery.isError, meQuery.isPending]
  );

  const documents: WireDocument[] = useMemo(() => docsQuery.data ?? [], [docsQuery.data]);
  const pendingDeleteDocument = useMemo(
    () => documents.find((doc) => doc.id === pendingDeleteId) ?? null,
    [documents, pendingDeleteId]
  );
  const normalizedDocumentsViewMode = useMemo(
    () => normalizeDocumentsViewMode(documentsViewMode),
    [documentsViewMode]
  );

  return {
    viewState,
    documents,
    docsQueryPending: docsQuery.isPending,
    createPending: createMutation.isPending,
    deletePending: deleteMutation.isPending,
    handleCreate,
    openDocument,
    requestDeleteDocument,
    cancelDeleteDocument,
    confirmDeleteDocument,
    pendingDeleteDocument,
    documentsViewMode: normalizedDocumentsViewMode,
    setDocumentsViewMode,
  };
}
