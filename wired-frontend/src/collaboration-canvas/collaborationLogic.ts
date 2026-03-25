import type { RemotePeerAwareness } from './awarenessTypes';

export type AwarenessMergePayload = {
  user: RemotePeerAwareness['user'];
  at: number;
  cursor?: { wx: number; wy: number; tool?: string } | null;
  selectedId?: string | null;
  tool?: string;
};

export const CURSOR_EMIT_MIN_INTERVAL_MS = 45;

export function mergePeer(
  old: RemotePeerAwareness | undefined,
  payload: AwarenessMergePayload
): RemotePeerAwareness {
  const cursor =
    'cursor' in payload
      ? payload.cursor === null || payload.cursor === undefined
        ? undefined
        : payload.cursor
      : old?.cursor;
  return {
    user: payload.user,
    cursor,
    selectedId: 'selectedId' in payload ? payload.selectedId : old?.selectedId,
    tool: 'tool' in payload ? payload.tool : old?.tool,
    at: payload.at,
  };
}

export function upsertRemotePeersAfterAwareness(
  prev: RemotePeerAwareness[],
  payload: AwarenessMergePayload,
  localUserId: string | undefined
): RemotePeerAwareness[] {
  if (payload.user.id === localUserId) return prev;
  const map = new Map(prev.map((p) => [p.user.id, p]));
  const old = map.get(payload.user.id);
  map.set(payload.user.id, mergePeer(old, payload));
  return [...map.values()].sort((a, b) => a.user.id.localeCompare(b.user.id));
}

export function shouldEmitCursor(nowMs: number, lastEmitMs: number, minIntervalMs: number): boolean {
  return nowMs - lastEmitMs >= minIntervalMs;
}
