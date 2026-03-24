import { TRANSFORMER_TOOLBAR_CLEARANCE_PX } from './canvasConfig'

/** Gap between toolbar bottom and shape top (matches CSS `8px` in transform). */
export const SELECTION_TOOLBAR_LINE_GAP_PX = 8

export function selectionToolbarGapPx(): number {
  return SELECTION_TOOLBAR_LINE_GAP_PX + TRANSFORMER_TOOLBAR_CLEARANCE_PX
}

export function rectsIntersectScreen(
  shape: { left: number; top: number; right: number; bottom: number },
  container: DOMRect,
): boolean {
  return !(
    shape.right < container.left ||
    shape.left > container.right ||
    shape.bottom < container.top ||
    shape.top > container.bottom
  )
}

/**
 * Keeps the toolbar inside `container` while staying as close as possible to the
 * ideal anchor (top-center of the shape).
 */
export function clampToolbarAnchor(
  idealCx: number,
  idealTop: number,
  toolbarW: number,
  toolbarH: number,
  gap: number,
  container: DOMRect,
): { cx: number; top: number } {
  const margin = 8
  const w = Math.max(24, toolbarW)
  const h = Math.max(24, toolbarH)
  const toolTop = idealTop - h - gap

  const cx = Math.min(
    container.right - margin - w / 2,
    Math.max(container.left + margin + w / 2, idealCx),
  )

  let top = idealTop
  if (toolTop < container.top + margin) {
    top += container.top + margin - toolTop
  }
  return { cx, top }
}
