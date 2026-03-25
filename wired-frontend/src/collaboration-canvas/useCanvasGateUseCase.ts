import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDocumentQuery } from './useDocument';
import { useMeQuery } from '../hooks';
import { buildCanvasLoginNextParam, resolveCanvasGateViewState } from './canvasScreenLogic';

export function useCanvasGateUseCase() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const documentId = searchParams.get('document')?.trim() ?? '';

  const meQuery = useMeQuery();
  const docQuery = useDocumentQuery(documentId, Boolean(documentId) && meQuery.isSuccess);

  useEffect(() => {
    if (!documentId) {
      navigate('/dashboard', { replace: true });
    }
  }, [documentId, navigate]);

  useEffect(() => {
    if (meQuery.isPending) return;
    if (meQuery.isError || !meQuery.data?.user) {
      const next = buildCanvasLoginNextParam(documentId);
      navigate(`/login?next=${next}`, { replace: true });
    }
  }, [documentId, meQuery.data?.user, meQuery.isError, meQuery.isPending, navigate]);

  useEffect(() => {
    if (!docQuery.isError) return;
    navigate('/dashboard', { replace: true });
  }, [docQuery.isError, navigate]);

  const viewState = useMemo(
    () =>
      resolveCanvasGateViewState({
        documentId,
        mePending: meQuery.isPending,
        meError: meQuery.isError,
        hasUser: Boolean(meQuery.data?.user),
        docPending: docQuery.isPending,
        docError: docQuery.isError,
        hasDoc: Boolean(docQuery.data),
      }),
    [
      docQuery.data,
      docQuery.isError,
      docQuery.isPending,
      documentId,
      meQuery.data?.user,
      meQuery.isError,
      meQuery.isPending,
    ]
  );

  return {
    viewState,
    documentId,
    documentTitle: docQuery.data?.title ?? '',
    documentOwnerId: docQuery.data?.ownerId ?? '',
  };
}
