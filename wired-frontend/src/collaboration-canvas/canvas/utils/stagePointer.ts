import type { Viewport } from './viewport';
import { screenPointToWorld } from './viewport';

/** Maps DOM client coordinates → world space using the stage container’s bounding rect. */
export function clientToWorldFromStage(
  clientX: number,
  clientY: number,
  stageContainer: HTMLElement | null,
  width: number,
  height: number,
  v: Viewport
): { x: number; y: number } | null {
  if (!stageContainer) return null;
  const rect = stageContainer.getBoundingClientRect();
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  return screenPointToWorld(sx, sy, width, height, v);
}
