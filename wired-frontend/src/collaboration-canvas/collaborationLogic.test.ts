import { describe, expect, it } from 'vitest';
import type { RemotePeerAwareness } from './awarenessTypes';
import { mergePeer, shouldEmitCursor, upsertRemotePeersAfterAwareness } from './collaborationLogic';

describe('mergePeer', () => {
  it('merges cursor when provided', () => {
    const old = undefined;
    const next = mergePeer(old, {
      user: { id: '1', email: 'a@b.co', displayName: 'A' },
      at: 100,
      cursor: { wx: 1, wy: 2, tool: 'select' },
    });
    expect(next.cursor).toEqual({ wx: 1, wy: 2, tool: 'select' });
  });

  it('clears cursor when null', () => {
    const old = {
      user: { id: '1', email: 'a@b.co', displayName: 'A' },
      at: 1,
      cursor: { wx: 0, wy: 0, tool: 'pen' },
    };
    const next = mergePeer(old, {
      user: old.user,
      at: 200,
      cursor: null,
    });
    expect(next.cursor).toBeUndefined();
  });
});

describe('upsertRemotePeersAfterAwareness', () => {
  it('ignores local user', () => {
    const prev: RemotePeerAwareness[] = [];
    const out = upsertRemotePeersAfterAwareness(
      prev,
      {
        user: { id: 'me', email: 'm@b.co', displayName: 'Me' },
        at: 1,
      },
      'me'
    );
    expect(out).toBe(prev);
  });
});

describe('shouldEmitCursor', () => {
  it('respects interval', () => {
    expect(shouldEmitCursor(100, 0, 45)).toBe(true);
    expect(shouldEmitCursor(100, 80, 45)).toBe(false);
    expect(shouldEmitCursor(125, 80, 45)).toBe(true);
  });
});
