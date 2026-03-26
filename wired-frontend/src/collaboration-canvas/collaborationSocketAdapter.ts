import { getSocket } from '../service';
import type { AwarenessMergePayload } from './collaborationLogic';

export type RoomUsersPayload = { usersOnline: number };

export type RoomUserLeftPayload = { usersOnline: number; user?: { id: string } };

export type YjsRoomUpdatePayload = { roomId: string; update: string };

export type AwarenessLeftPayload = { userId: string };

export type RoomErrorPayload = { roomId: string };
export type RoomDeletedPayload = { roomId: string };

export type CollaborationSocketHandlers = {
  onRoomJoined: (payload: RoomUsersPayload) => void;
  onRoomUserJoined: (payload: RoomUsersPayload) => void;
  onRoomUserLeft: (payload: RoomUserLeftPayload) => void;
  onYjsSync: (payload: YjsRoomUpdatePayload) => void;
  onYjsUpdate: (payload: YjsRoomUpdatePayload) => void;
  onAuthError: () => void;
  onAwarenessPeer: (payload: AwarenessMergePayload) => void;
  onAwarenessLeft: (payload: AwarenessLeftPayload) => void;
  onRoomError: (payload: RoomErrorPayload) => void;
  onRoomDeleted: (payload: RoomDeletedPayload) => void;
};

export type AwarenessEmitPatch = {
  cursor?: { wx: number; wy: number; tool?: string } | null;
  selectedId?: string | null;
  tool?: string;
};

/**
 * Canvas collaboration transport: Socket.IO event wiring and emits.
 * All access to the realtime client lives here so the repository stays transport-agnostic.
 * To swap how the socket is created or which client backs these calls, change this module only.
 */
export function subscribeCanvasCollaborationSocket(
  roomId: string,
  handlers: CollaborationSocketHandlers
): () => void {
  const socket = getSocket();
  socket.on('room:joined', handlers.onRoomJoined);
  socket.on('room:user-joined', handlers.onRoomUserJoined);
  socket.on('room:user-left', handlers.onRoomUserLeft);
  socket.on('yjs:sync', handlers.onYjsSync);
  socket.on('yjs:update', handlers.onYjsUpdate);
  socket.on('auth:error', handlers.onAuthError);
  socket.on('awareness:peer', handlers.onAwarenessPeer);
  socket.on('awareness:left', handlers.onAwarenessLeft);
  socket.on('room:error', handlers.onRoomError);
  socket.on('room:deleted', handlers.onRoomDeleted);

  socket.emit('room:join', { roomId });

  return () => {
    socket.emit('room:leave', { roomId });
    socket.off('room:joined', handlers.onRoomJoined);
    socket.off('room:user-joined', handlers.onRoomUserJoined);
    socket.off('room:user-left', handlers.onRoomUserLeft);
    socket.off('yjs:sync', handlers.onYjsSync);
    socket.off('yjs:update', handlers.onYjsUpdate);
    socket.off('auth:error', handlers.onAuthError);
    socket.off('awareness:peer', handlers.onAwarenessPeer);
    socket.off('awareness:left', handlers.onAwarenessLeft);
    socket.off('room:error', handlers.onRoomError);
    socket.off('room:deleted', handlers.onRoomDeleted);
  };
}

export function emitYjsUpdateToRoom(roomId: string, updateBase64: string): void {
  getSocket().emit('yjs:update', { roomId, update: updateBase64 });
}

export function emitAwarenessUpdateToRoom(roomId: string, patch: AwarenessEmitPatch): void {
  getSocket().emit('awareness:update', { roomId, ...patch });
}
