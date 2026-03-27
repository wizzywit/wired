import { describe, expect, it } from 'vitest';
import {
  applyPanDelta,
  screenPointToWorld,
  viewportCenteredOnBoundsAtScale,
  viewportToFitWorldBounds,
  zoomAtCenter,
  zoomWheelAtPointer,
} from './viewport';
import type { Viewport } from './viewport';

describe('screenPointToWorld', () => {
  it('maps stage center to world origin at scale 1 with zero offset', () => {
    const v: Viewport = { scale: 1, offsetX: 0, offsetY: 0 };
    const w = screenPointToWorld(100, 100, 200, 200, v);
    expect(w.x).toBeCloseTo(0);
    expect(w.y).toBeCloseTo(0);
  });

  it('scales distance from origin by scale', () => {
    const v: Viewport = { scale: 2, offsetX: 0, offsetY: 0 };
    const w = screenPointToWorld(100, 100, 200, 200, v);
    expect(w.x).toBeCloseTo(0);
    expect(w.y).toBeCloseTo(0);
    const w2 = screenPointToWorld(120, 100, 200, 200, v);
    expect(w2.x).toBeCloseTo(10);
  });
});

describe('zoomWheelAtPointer', () => {
  it('preserves world point under cursor (algebraic invariant)', () => {
    const prev: Viewport = { scale: 1, offsetX: 0, offsetY: 0 };
    const w = 400;
    const h = 300;
    const pointer = { x: 200, y: 150 };
    const worldBefore = screenPointToWorld(pointer.x, pointer.y, w, h, prev);
    const next = zoomWheelAtPointer(prev, pointer, w, h, 1.1);
    const worldAfter = screenPointToWorld(pointer.x, pointer.y, w, h, next);
    expect(worldAfter.x).toBeCloseTo(worldBefore.x, 5);
    expect(worldAfter.y).toBeCloseTo(worldBefore.y, 5);
  });
});

describe('zoomAtCenter', () => {
  it('keeps world origin at viewport center when zooming', () => {
    const prev: Viewport = { scale: 1, offsetX: 0, offsetY: 0 };
    const w = 200;
    const h = 200;
    const next = zoomAtCenter(prev, w, h, 2);
    const centerWorld = screenPointToWorld(w / 2, h / 2, w, h, next);
    expect(centerWorld.x).toBeCloseTo(0);
    expect(centerWorld.y).toBeCloseTo(0);
  });
});

describe('applyPanDelta', () => {
  it('adds offsets', () => {
    const prev: Viewport = { scale: 1, offsetX: 5, offsetY: -3 };
    const next = applyPanDelta(prev, { dx: 2, dy: 4 });
    expect(next.offsetX).toBe(7);
    expect(next.offsetY).toBe(1);
  });
});

describe('viewportToFitWorldBounds', () => {
  it('places the bounds center at the stage center', () => {
    const w = 800;
    const h = 600;
    const pad = 48;
    const bounds = { minX: 100, minY: 200, maxX: 300, maxY: 400 };
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    const v = viewportToFitWorldBounds(w, h, bounds, pad);
    const centerWorld = screenPointToWorld(w / 2, h / 2, w, h, v);
    expect(centerWorld.x).toBeCloseTo(cx, 5);
    expect(centerWorld.y).toBeCloseTo(cy, 5);
  });
});

describe('viewportCenteredOnBoundsAtScale', () => {
  it('at 100% scale places the bounds center at the stage center', () => {
    const w = 800;
    const h = 600;
    const bounds = { minX: 100, minY: 200, maxX: 300, maxY: 400 };
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    const v = viewportCenteredOnBoundsAtScale(bounds, 1);
    const centerWorld = screenPointToWorld(w / 2, h / 2, w, h, v);
    expect(centerWorld.x).toBeCloseTo(cx, 5);
    expect(centerWorld.y).toBeCloseTo(cy, 5);
    expect(v.scale).toBe(1);
  });

  it('with null bounds centers on world origin at scale 1', () => {
    const w = 400;
    const h = 300;
    const v = viewportCenteredOnBoundsAtScale(null, 1);
    const centerWorld = screenPointToWorld(w / 2, h / 2, w, h, v);
    expect(centerWorld.x).toBeCloseTo(0, 5);
    expect(centerWorld.y).toBeCloseTo(0, 5);
  });
});
