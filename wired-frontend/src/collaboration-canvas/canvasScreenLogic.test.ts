import { describe, expect, it } from 'vitest';
import {
  buildCanvasLoginNextParam,
  buildPresenceUsers,
  getPresenceFaces,
  getPresenceOverflow,
  presenceGlowStyle,
  resolveCanvasGateViewState,
} from './canvasScreenLogic';
import type { AwarenessUser, RemotePeerAwareness } from './awarenessTypes';

describe('resolveCanvasGateViewState', () => {
  it('returns redirecting without a document id', () => {
    expect(
      resolveCanvasGateViewState({
        documentId: '',
        mePending: false,
        meError: false,
        hasUser: true,
        docPending: false,
        docError: false,
        hasDoc: true,
      })
    ).toBe('redirecting');
  });

  it('returns loading while auth or document query is pending', () => {
    expect(
      resolveCanvasGateViewState({
        documentId: 'doc-1',
        mePending: true,
        meError: false,
        hasUser: false,
        docPending: false,
        docError: false,
        hasDoc: false,
      })
    ).toBe('loading');
  });

  it('returns ready when all required data is present', () => {
    expect(
      resolveCanvasGateViewState({
        documentId: 'doc-1',
        mePending: false,
        meError: false,
        hasUser: true,
        docPending: false,
        docError: false,
        hasDoc: true,
      })
    ).toBe('ready');
  });
});

describe('buildCanvasLoginNextParam', () => {
  it('encodes the canvas return URL', () => {
    expect(buildCanvasLoginNextParam('doc id')).toBe(
      '%2Fcanvas%3Fdocument%3Ddoc%2520id'
    );
  });
});

describe('presence logic', () => {
  it('merges self + peers, deduplicates, and puts local user first', () => {
    const me: AwarenessUser = {
      id: 'u2',
      email: 'u2@example.com',
      displayName: 'Bravo',
    };
    const peers: RemotePeerAwareness[] = [
      {
        at: Date.now(),
        user: { id: 'u1', email: 'u1@example.com', displayName: 'Alpha' },
      },
      {
        at: Date.now(),
        user: { id: 'u2', email: 'u2-alt@example.com', displayName: 'Bravo Alt' },
      },
      {
        at: Date.now(),
        user: { id: 'u3', email: 'u3@example.com', displayName: 'Charlie' },
      },
    ];

    const users = buildPresenceUsers(me, peers, 'u2');
    expect(users.map((u) => u.id)).toEqual(['u2', 'u1', 'u3']);
  });

  it('computes face subset and overflow safely', () => {
    const users: AwarenessUser[] = [
      { id: '1', email: '1@example.com', displayName: 'A' },
      { id: '2', email: '2@example.com', displayName: 'B' },
      { id: '3', email: '3@example.com', displayName: 'C' },
      { id: '4', email: '4@example.com', displayName: 'D' },
    ];

    const faces = getPresenceFaces(users, 3);
    expect(faces).toHaveLength(3);
    expect(getPresenceOverflow(6, faces.length)).toBe(3);
    expect(getPresenceOverflow(2, faces.length)).toBe(0);
  });

  it('returns stable style object values', () => {
    const style = presenceGlowStyle('#123456');
    expect(style).toEqual({
      backgroundColor: '#123456',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.9), 0 0 4px 0 #123456',
    });
  });
});
