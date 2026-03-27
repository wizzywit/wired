import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCanvasStore } from './canvas';
import { useUpdateDocumentMutation } from './useDocument';
import { useMeQuery } from '../hooks';
import { useCollaboration } from './useCollaboration';
import { useCanvasPresenceUsers } from './useCanvasPresenceUsers';
import { getTemplateShapes } from '../templates/getTemplateShapes';
import { unionBoundsForShapes } from './canvas/utils/shapeWorldBounds';
import type { WorldAxisBounds } from './canvas/utils/viewport';

export function useCanvasScreenInnerUseCase({ documentId }: { documentId: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template');
  const templateSeedDoneRef = useRef(false);
  const [worldBoundsToFitOnce, setWorldBoundsToFitOnce] = useState<WorldAxisBounds | null>(null);
  const replaceShapes = useCanvasStore((state) => state.replaceShapes);
  const undo = useCanvasStore((state) => state.undo);
  const redo = useCanvasStore((state) => state.redo);
  const canUndo = useCanvasStore((state) => state.history.past.length > 0);
  const canRedo = useCanvasStore((state) => state.history.future.length > 0);
  const shapes = useCanvasStore((state) => state.history.present);
  const tool = useCanvasStore((state) => state.tool);
  const selectedId = useCanvasStore((state) => state.selectedId);

  const meQuery = useMeQuery();
  const updateDocument = useUpdateDocumentMutation();

  const onAuthRequired = useCallback(() => {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    navigate(`/login?next=${next}`);
  }, [navigate, location.pathname, location.search]);

  const onRoomInvalid = useCallback(() => {
    navigate('/dashboard?notice=document-unavailable', { replace: true });
  }, [navigate]);

  const { usersOnline, isSynced, localUserId, remotePeers, emitCursorWorld, clearCursor, emitSelectionTool } =
    useCollaboration({
      documentId,
      shapes,
      replaceShapes,
      auth: {
        isPending: meQuery.isPending,
        isError: meQuery.isError,
        userId: meQuery.data?.user?.id,
      },
      onAuthRequired,
      onRoomInvalid,
    });

  const { presenceFaceUsers, presenceOverflow } = useCanvasPresenceUsers({
    meUser: meQuery.data?.user,
    remotePeers,
    localUserId,
    usersOnline,
  });

  const handleRenameBreadcrumb = useCallback(
    async (title: string) => {
      await updateDocument.mutateAsync({ documentId, title });
    },
    [documentId, updateDocument]
  );

  useLayoutEffect(() => {
    replaceShapes([]);
  }, [documentId, replaceShapes]);

  useEffect(() => {
    templateSeedDoneRef.current = false;
  }, [documentId]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setWorldBoundsToFitOnce(null);
    }, 0);
    return () => window.clearTimeout(id);
  }, [documentId]);

  const clearWorldBoundsToFitOnce = useCallback(() => {
    setWorldBoundsToFitOnce(null);
  }, []);

  // useLayoutEffect so template shapes are applied before useCollaboration's useEffect([shapes])
  // runs syncShapesToYMap (and emits to the server). useEffect would run after that pass and
  // caused empty→Y sync to race with template seed, especially visible on text nodes.
  useLayoutEffect(() => {
    if (!isSynced || !templateParam) return;
    if (templateSeedDoneRef.current) return;
    if (shapes.length > 0) {
      navigate(
        { pathname: location.pathname, search: new URLSearchParams({ document: documentId }).toString() },
        { replace: true }
      );
      return;
    }
    const seeded = getTemplateShapes(templateParam);
    if (!seeded?.length) {
      navigate(
        { pathname: location.pathname, search: new URLSearchParams({ document: documentId }).toString() },
        { replace: true }
      );
      return;
    }
    templateSeedDoneRef.current = true;
    replaceShapes(seeded);
    const framed = unionBoundsForShapes(seeded);
    if (framed) {
      window.queueMicrotask(() => {
        setWorldBoundsToFitOnce(framed);
      });
    }
    navigate(
      { pathname: location.pathname, search: new URLSearchParams({ document: documentId }).toString() },
      { replace: true }
    );
  }, [documentId, isSynced, location.pathname, navigate, replaceShapes, shapes.length, templateParam]);

  useEffect(() => {
    if (!isSynced) return;
    emitSelectionTool(selectedId ?? null, tool);
  }, [emitSelectionTool, isSynced, selectedId, tool]);

  const onPointerWorldMove = useCallback(
    (pt: { x: number; y: number }) => {
      if (!isSynced) return;
      emitCursorWorld(pt.x, pt.y, tool);
    },
    [emitCursorWorld, isSynced, tool]
  );

  const collaboration = useMemo(
    () => ({
      remotePeers,
      localUserId,
      onPointerWorldMove,
      onStageMouseLeaveExtra: clearCursor,
    }),
    [clearCursor, localUserId, onPointerWorldMove, remotePeers]
  );

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    usersOnline,
    isSynced,
    localUserId,
    presenceFaceUsers,
    presenceOverflow,
    handleRenameBreadcrumb,
    collaboration,
    worldBoundsToFitOnce,
    clearWorldBoundsToFitOnce,
  };
}
