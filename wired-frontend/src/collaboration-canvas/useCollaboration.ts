import * as Y from 'yjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DrawShape } from '../theme/canvasTypes';
import type { RemotePeerAwareness } from './awarenessTypes';
import {
  CURSOR_EMIT_MIN_INTERVAL_MS,
  shouldEmitCursor,
  upsertRemotePeersAfterAwareness,
} from './collaborationLogic';
import {
  emitAwarenessUpdateToRoom,
  emitYjsUpdateToRoom,
  subscribeCanvasCollaborationSocket,
  type AwarenessEmitPatch,
} from './collaborationSocketAdapter';
import {
  ORIGIN_LOCAL,
  base64ToUint8,
  getShapesRoot,
  syncShapesToYMap,
  uint8ToBase64,
  yMapToShapes,
} from './yjsShapeMap';

export type UseCollaborationAuth = {
  isPending: boolean;
  isError: boolean;
  userId: string | undefined;
};

/**
 * Repository-style hook: Yjs document sync + collaboration socket lifecycle.
 * Navigation on auth/room errors is supplied by the use case (`onAuthRequired` / `onRoomInvalid`).
 */
export function useCollaboration(options: {
  documentId: string;
  shapes: DrawShape[];
  replaceShapes: (shapes: DrawShape[]) => void;
  auth: UseCollaborationAuth;
  onAuthRequired: () => void;
  onRoomInvalid: () => void;
}) {
  const { documentId, shapes, replaceShapes, auth, onAuthRequired, onRoomInvalid } = options;
  const roomId = documentId.trim();
  const [usersOnline, setUsersOnline] = useState(1);
  const [isSynced, setIsSynced] = useState(false);
  const [remotePeers, setRemotePeers] = useState<RemotePeerAwareness[]>([]);
  const syncReadyRef = useRef(false);
  const ydocRef = useRef<Y.Doc | null>(null);
  const ymapRef = useRef<ReturnType<typeof getShapesRoot> | null>(null);
  const lastCursorEmitRef = useRef(0);
  const localUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    localUserIdRef.current = auth.userId;
  }, [auth.userId]);

  useEffect(() => {
    if (!roomId) return;
    if (auth.isPending) return;
    if (auth.isError || !auth.userId) {
      onAuthRequired();
      return;
    }

    let mounted = true;

    const ydoc = new Y.Doc();
    const ymap = getShapesRoot(ydoc);
    ydocRef.current = ydoc;
    ymapRef.current = ymap;

    const onUpdate = (update: Uint8Array, origin: unknown) => {
      if (origin === ORIGIN_LOCAL) {
        emitYjsUpdateToRoom(roomId, uint8ToBase64(update));
        return;
      }
      replaceShapes(yMapToShapes(ymap));
    };
    ydoc.on('update', onUpdate);

    const unsubscribeSocket = subscribeCanvasCollaborationSocket(roomId, {
      onRoomJoined: (payload) => {
        setUsersOnline(payload.usersOnline || 1);
      },
      onRoomUserJoined: (payload) => {
        setUsersOnline(payload.usersOnline || 1);
      },
      onRoomUserLeft: (payload) => {
        setUsersOnline(payload.usersOnline || 1);
        const leftId = payload.user?.id;
        if (leftId) {
          setRemotePeers((prev) => prev.filter((p) => p.user.id !== leftId));
        }
      },
      onYjsSync: (payload) => {
        if (payload.roomId !== roomId || !mounted) return;
        Y.applyUpdate(ydoc, base64ToUint8(payload.update), 'socket-sync');
        syncReadyRef.current = true;
        setIsSynced(true);
      },
      onYjsUpdate: (payload) => {
        if (payload.roomId !== roomId || !mounted) return;
        Y.applyUpdate(ydoc, base64ToUint8(payload.update), 'socket-remote');
      },
      onAuthError: () => {
        onAuthRequired();
      },
      onRoomError: (payload) => {
        if (payload.roomId !== roomId || !mounted) return;
        onRoomInvalid();
      },
      onAwarenessPeer: (payload) => {
        if (!mounted) return;
        setRemotePeers((prev) =>
          upsertRemotePeersAfterAwareness(prev, payload, localUserIdRef.current)
        );
      },
      onAwarenessLeft: (payload) => {
        if (!mounted) return;
        setRemotePeers((prev) => prev.filter((p) => p.user.id !== payload.userId));
      },
    });

    return () => {
      mounted = false;
      syncReadyRef.current = false;
      setIsSynced(false);
      setRemotePeers([]);
      ydoc.off('update', onUpdate);
      ydoc.destroy();
      ydocRef.current = null;
      ymapRef.current = null;
      unsubscribeSocket();
    };
  }, [
    auth.isError,
    auth.isPending,
    auth.userId,
    onAuthRequired,
    onRoomInvalid,
    replaceShapes,
    roomId,
  ]);

  useEffect(() => {
    const ydoc = ydocRef.current;
    const ymap = ymapRef.current;
    if (!syncReadyRef.current || !ydoc || !ymap) return;

    ydoc.transact(() => {
      syncShapesToYMap(ymap, shapes);
    }, ORIGIN_LOCAL);
  }, [shapes, roomId]);

  const emitAwarenessPatch = useCallback(
    (patch: AwarenessEmitPatch) => {
      emitAwarenessUpdateToRoom(roomId, patch);
    },
    [roomId]
  );

  const emitCursorWorld = useCallback(
    (wx: number, wy: number, tool: string) => {
      const now = Date.now();
      if (!shouldEmitCursor(now, lastCursorEmitRef.current, CURSOR_EMIT_MIN_INTERVAL_MS)) return;
      lastCursorEmitRef.current = now;
      emitAwarenessPatch({ cursor: { wx, wy, tool } });
    },
    [emitAwarenessPatch]
  );

  const clearCursor = useCallback(() => {
    emitAwarenessPatch({ cursor: null });
  }, [emitAwarenessPatch]);

  const emitSelectionTool = useCallback(
    (selectedId: string | null, tool: string) => {
      emitAwarenessPatch({ selectedId, tool });
    },
    [emitAwarenessPatch]
  );

  return {
    roomId,
    usersOnline,
    isSynced,
    localUserId: auth.userId ?? '',
    remotePeers,
    emitCursorWorld,
    clearCursor,
    emitSelectionTool,
  };
}
