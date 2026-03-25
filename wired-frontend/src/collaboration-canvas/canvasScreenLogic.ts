import type { CSSProperties } from 'react';
import type { AwarenessUser, RemotePeerAwareness } from './awarenessTypes';

export const PRESENCE_FACE_MAX = 3;

export type CanvasGateViewState = 'redirecting' | 'loading' | 'ready';

type ResolveCanvasGateViewStateInput = {
  documentId: string;
  mePending: boolean;
  meError: boolean;
  hasUser: boolean;
  docPending: boolean;
  docError: boolean;
  hasDoc: boolean;
};

export function resolveCanvasGateViewState(
  input: ResolveCanvasGateViewStateInput
): CanvasGateViewState {
  const { documentId, mePending, meError, hasUser, docPending, docError, hasDoc } = input;
  if (!documentId) return 'redirecting';
  if (mePending || meError || !hasUser || docPending) return 'loading';
  if (docError || !hasDoc) return 'redirecting';
  return 'ready';
}

export function buildCanvasLoginNextParam(documentId: string): string {
  return encodeURIComponent(`/canvas?document=${encodeURIComponent(documentId)}`);
}

export function buildPresenceUsers(
  meUser: AwarenessUser | undefined,
  remotePeers: RemotePeerAwareness[],
  localUserId: string | null
): AwarenessUser[] {
  if (!meUser?.id) return [];

  const byId = new Map<string, AwarenessUser>();
  byId.set(meUser.id, meUser);

  for (const peer of remotePeers) {
    if (!byId.has(peer.user.id)) {
      byId.set(peer.user.id, peer.user);
    }
  }

  return [...byId.values()].sort((a, b) => {
    if (a.id === localUserId) return -1;
    if (b.id === localUserId) return 1;
    return a.displayName.localeCompare(b.displayName, undefined, {
      sensitivity: 'base',
    });
  });
}

export function getPresenceFaces(users: AwarenessUser[], maxFaces: number): AwarenessUser[] {
  return users.slice(0, maxFaces);
}

export function getPresenceOverflow(usersOnline: number, visibleFaces: number): number {
  return Math.max(0, usersOnline - visibleFaces);
}

export function presenceGlowStyle(accent: string): CSSProperties {
  return {
    backgroundColor: accent,
    boxShadow: `0 0 0 1px rgba(255,255,255,0.9), 0 0 4px 0 ${accent}`,
  };
}
