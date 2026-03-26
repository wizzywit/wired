import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCanvasStore } from './canvas';
import { useUpdateDocumentMutation } from './useDocument';
import { useMeQuery } from '../hooks';
import { useCollaboration } from './useCollaboration';
import { useCanvasPresenceUsers } from './useCanvasPresenceUsers';

export function useCanvasScreenInnerUseCase({ documentId }: { documentId: string }) {
  const navigate = useNavigate();
  const location = useLocation();
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
  };
}
