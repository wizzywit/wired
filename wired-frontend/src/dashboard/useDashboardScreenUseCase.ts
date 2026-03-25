import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeQuery } from '../hooks';
import { useCreateDocumentMutation, useDocumentsQuery } from './useDashboard';
import { type WireDocument } from '../domain-types';
import {
  buildCanvasPathForDocumentId,
  DASHBOARD_LOGIN_NEXT_ENCODED,
  resolveDashboardViewState,
} from './dashboardScreenLogic';

export function useDashboardScreenUseCase() {
  const navigate = useNavigate();
  const meQuery = useMeQuery();
  const docsQuery = useDocumentsQuery(Boolean(meQuery.data?.user));
  const createMutation = useCreateDocumentMutation();

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

  return {
    viewState,
    documents,
    docsQueryPending: docsQuery.isPending,
    createPending: createMutation.isPending,
    handleCreate,
    openDocument,
  };
}
