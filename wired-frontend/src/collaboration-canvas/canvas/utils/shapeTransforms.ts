import type { DrawShape } from '../../../theme/canvasTypes';

/** Normalize Konva transform into model state (scale baked into geometry). */
export function rectFromTransformedNode(
  s: Extract<DrawShape, { kind: 'rect' }>,
  node: {
    x: () => number;
    y: () => number;
    width: () => number;
    height: () => number;
    scaleX: () => number;
    scaleY: () => number;
    rotation: () => number;
  }
): DrawShape {
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();
  const w = Math.max(8, node.width() * scaleX);
  const h = Math.max(8, node.height() * scaleY);
  return {
    ...s,
    x: node.x(),
    y: node.y(),
    width: w,
    height: h,
  };
}

export function ellipseFromTransformedNode(
  s: Extract<DrawShape, { kind: 'ellipse' }>,
  node: {
    x: () => number;
    y: () => number;
    radiusX: () => number;
    radiusY: () => number;
    scaleX: () => number;
    scaleY: () => number;
  }
): DrawShape {
  const sx = node.scaleX();
  const sy = node.scaleY();
  return {
    ...s,
    cx: node.x(),
    cy: node.y(),
    rx: Math.max(4, node.radiusX() * sx),
    ry: Math.max(4, node.radiusY() * sy),
  };
}

export function textFromTransformedNode(
  s: Extract<DrawShape, { kind: 'text' }>,
  node: {
    x: () => number;
    y: () => number;
    width: () => number;
    height: () => number;
    scaleX: () => number;
    scaleY: () => number;
  }
): DrawShape {
  const sx = node.scaleX();
  const sy = node.scaleY();
  return {
    ...s,
    x: node.x(),
    y: node.y(),
    width: Math.max(40, node.width() * sx),
    fontSize: Math.max(8, s.fontSize * sy),
  };
}

export function stickyFromTransformedNode(
  s: Extract<DrawShape, { kind: 'sticky' }>,
  node: {
    x: () => number;
    y: () => number;
    width: () => number;
    height: () => number;
    scaleX: () => number;
    scaleY: () => number;
  }
): DrawShape {
  const sx = node.scaleX();
  const sy = node.scaleY();
  return {
    ...s,
    x: node.x(),
    y: node.y(),
    width: Math.max(48, node.width() * sx),
    height: Math.max(40, node.height() * sy),
  };
}
