import type Konva from 'konva';
import type { Stage as KonvaStage } from 'konva/lib/Stage';

export type OrientedScreenBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  /** Degrees, clockwise; 0 = unrotated */
  rotationDeg: number;
};

/**
 * Map a Konva node to fixed (viewport) coordinates for HTML overlays.
 * With `worldW`/`worldH`, uses local (0,0)–(w,h) corners so rotation/skew match the node.
 */
export function screenBoxForNode(
  node: Konva.Node,
  stage: KonvaStage,
  worldW?: number,
  worldH?: number
): OrientedScreenBox {
  const cr = stage.container().getBoundingClientRect();
  if (worldW != null && worldH != null && worldW > 0 && worldH > 0) {
    const abs = node.getAbsoluteTransform();
    const p0 = abs.point({ x: 0, y: 0 });
    const pW = abs.point({ x: worldW, y: 0 });
    const pH = abs.point({ x: 0, y: worldH });
    const rotationDeg = (Math.atan2(pW.y - p0.y, pW.x - p0.x) * 180) / Math.PI;
    const width = Math.hypot(pW.x - p0.x, pW.y - p0.y);
    const height = Math.hypot(pH.x - p0.x, pH.y - p0.y);
    return {
      left: cr.left + p0.x,
      top: cr.top + p0.y,
      width,
      height,
      rotationDeg,
    };
  }
  const rect = node.getClientRect({ relativeTo: stage });
  return {
    left: cr.left + rect.x,
    top: cr.top + rect.y,
    width: Math.max(1, rect.width),
    height: Math.max(1, rect.height),
    rotationDeg: 0,
  };
}
