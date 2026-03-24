import {
  CANVAS_MAX_SCALE,
  CANVAS_MIN_SCALE,
} from './canvasConfig'

export type Viewport = {
  scale: number
  offsetX: number
  offsetY: number
}

export function clampScale(scale: number): number {
  return Math.max(CANVAS_MIN_SCALE, Math.min(CANVAS_MAX_SCALE, scale))
}

/** Stage-local coordinates (px) → world coordinates (before Group scale). */
export function screenPointToWorld(
  sx: number,
  sy: number,
  width: number,
  height: number,
  v: Viewport,
): { x: number; y: number } {
  const ox = width / 2 + v.offsetX
  const oy = height / 2 + v.offsetY
  return {
    x: (sx - ox) / v.scale,
    y: (sy - oy) / v.scale,
  }
}

/** Zoom toward pointer; keeps the point under the cursor stable in world space. */
export function zoomWheelAtPointer(
  prev: Viewport,
  pointer: { x: number; y: number },
  width: number,
  height: number,
  scaleBy: number,
): Viewport {
  const newScale = clampScale(prev.scale * scaleBy)
  const hw = width / 2
  const hh = height / 2
  const ox = hw + prev.offsetX
  const oy = hh + prev.offsetY
  const mousePointTo = {
    x: (pointer.x - ox) / prev.scale,
    y: (pointer.y - oy) / prev.scale,
  }
  const nx = pointer.x - mousePointTo.x * newScale
  const ny = pointer.y - mousePointTo.y * newScale
  return {
    scale: newScale,
    offsetX: nx - hw,
    offsetY: ny - hh,
  }
}

export function zoomAtCenter(
  prev: Viewport,
  width: number,
  height: number,
  factor: number,
): Viewport {
  const newScale = clampScale(prev.scale * factor)
  const cx = width / 2
  const cy = height / 2
  const ox = cx + prev.offsetX
  const oy = cy + prev.offsetY
  const mousePointTo = {
    x: (cx - ox) / prev.scale,
    y: (cy - oy) / prev.scale,
  }
  const nx = cx - mousePointTo.x * newScale
  const ny = cy - mousePointTo.y * newScale
  return {
    scale: newScale,
    offsetX: nx - cx,
    offsetY: ny - cy,
  }
}

export function applyPanDelta(
  prev: Viewport,
  delta: { dx: number; dy: number },
): Viewport {
  return {
    ...prev,
    offsetX: prev.offsetX + delta.dx,
    offsetY: prev.offsetY + delta.dy,
  }
}
