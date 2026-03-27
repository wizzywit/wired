import { CANVAS_MAX_SCALE, CANVAS_MIN_SCALE } from './canvasConfig';

export type Viewport = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

/** Axis-aligned bounds in world space (same coordinates as `DrawShape`). */
export type WorldAxisBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

/**
 * Pans/zooms so `bounds` is centered in the stage and fits inside the viewport with screen padding.
 * Matches `screenPointToWorld` / `originX` math in `useCanvasViewport`.
 */
export function viewportToFitWorldBounds(
  width: number,
  height: number,
  bounds: WorldAxisBounds,
  paddingPx: number
): Viewport {
  const bw = Math.max(1, bounds.maxX - bounds.minX);
  const bh = Math.max(1, bounds.maxY - bounds.minY);
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const aw = Math.max(1, width - 2 * paddingPx);
  const ah = Math.max(1, height - 2 * paddingPx);
  const scale = clampScale(Math.min(aw / bw, ah / bh));
  return {
    scale,
    offsetX: -cx * scale,
    offsetY: -cy * scale,
  };
}

/**
 * Fixed zoom level with the center of `bounds` at the screen center (same offset math as fit-to-bounds).
 * Use for "100%" reset so content stays centered when it does not sit at world origin.
 * When `bounds` is null (empty canvas), centers on world (0, 0).
 */
export function viewportCenteredOnBoundsAtScale(bounds: WorldAxisBounds | null, scale: number): Viewport {
  const s = clampScale(scale);
  if (!bounds) {
    return { scale: s, offsetX: 0, offsetY: 0 };
  }
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  return {
    scale: s,
    offsetX: -cx * s,
    offsetY: -cy * s,
  };
}

export function clampScale(scale: number): number {
  return Math.max(CANVAS_MIN_SCALE, Math.min(CANVAS_MAX_SCALE, scale));
}

/** Stage-local coordinates (px) → world coordinates (before Group scale). */
export function screenPointToWorld(
  sx: number,
  sy: number,
  width: number,
  height: number,
  v: Viewport
): { x: number; y: number } {
  const ox = width / 2 + v.offsetX;
  const oy = height / 2 + v.offsetY;
  return {
    x: (sx - ox) / v.scale,
    y: (sy - oy) / v.scale,
  };
}

/** Zoom toward pointer; keeps the point under the cursor stable in world space. */
export function zoomWheelAtPointer(
  prev: Viewport,
  pointer: { x: number; y: number },
  width: number,
  height: number,
  scaleBy: number
): Viewport {
  const newScale = clampScale(prev.scale * scaleBy);
  const hw = width / 2;
  const hh = height / 2;
  const ox = hw + prev.offsetX;
  const oy = hh + prev.offsetY;
  const mousePointTo = {
    x: (pointer.x - ox) / prev.scale,
    y: (pointer.y - oy) / prev.scale,
  };
  const nx = pointer.x - mousePointTo.x * newScale;
  const ny = pointer.y - mousePointTo.y * newScale;
  return {
    scale: newScale,
    offsetX: nx - hw,
    offsetY: ny - hh,
  };
}

export function zoomAtCenter(prev: Viewport, width: number, height: number, factor: number): Viewport {
  const newScale = clampScale(prev.scale * factor);
  const cx = width / 2;
  const cy = height / 2;
  const ox = cx + prev.offsetX;
  const oy = cy + prev.offsetY;
  const mousePointTo = {
    x: (cx - ox) / prev.scale,
    y: (cy - oy) / prev.scale,
  };
  const nx = cx - mousePointTo.x * newScale;
  const ny = cy - mousePointTo.y * newScale;
  return {
    scale: newScale,
    offsetX: nx - cx,
    offsetY: ny - cy,
  };
}

export function applyPanDelta(prev: Viewport, delta: { dx: number; dy: number }): Viewport {
  return {
    ...prev,
    offsetX: prev.offsetX + delta.dx,
    offsetY: prev.offsetY + delta.dy,
  };
}
