import type { DrawShape } from '../../../context/canvasTypes'

/** Loose axis-aligned bounds in world space for presence / overlays. */
export function shapeWorldBoundsLoose(
  s: DrawShape,
): { x: number; y: number; width: number; height: number } | null {
  const pad = (w: number) => Math.max(2, w / 2)
  switch (s.kind) {
    case 'path': {
      if (s.points.length < 2) return null
      let minX = s.points[0]!
      let minY = s.points[1]!
      let maxX = minX
      let maxY = minY
      for (let i = 0; i < s.points.length; i += 2) {
        const x = s.points[i]!
        const y = s.points[i + 1]!
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
      const p = pad(s.strokeWidth)
      return {
        x: minX - p,
        y: minY - p,
        width: maxX - minX + 2 * p,
        height: maxY - minY + 2 * p,
      }
    }
    case 'rect':
    case 'triangle':
    case 'kite':
      return { x: s.x, y: s.y, width: s.width, height: s.height }
    case 'ellipse':
      return {
        x: s.cx - s.rx,
        y: s.cy - s.ry,
        width: s.rx * 2,
        height: s.ry * 2,
      }
    case 'line':
    case 'arrow': {
      const p = pad(s.strokeWidth)
      const minX = Math.min(s.x1, s.x2)
      const maxX = Math.max(s.x1, s.x2)
      const minY = Math.min(s.y1, s.y2)
      const maxY = Math.max(s.y1, s.y2)
      return {
        x: minX - p,
        y: minY - p,
        width: maxX - minX + 2 * p,
        height: maxY - minY + 2 * p,
      }
    }
    case 'text': {
      const lh = s.fontSize * 1.25
      return { x: s.x, y: s.y, width: s.width, height: lh }
    }
    case 'sticky':
      return { x: s.x, y: s.y, width: s.width, height: s.height }
    default:
      return null
  }
}
