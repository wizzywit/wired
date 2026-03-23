import type { CanvasTool, DrawShape } from '../../context/canvasTypes'
import { PEN_STROKE_WIDTH, STROKE_WIDTH } from './canvasConfig'

export type Draft =
  | { kind: 'pen'; points: number[] }
  | { kind: 'rect'; x1: number; y1: number; x2: number; y2: number }
  | { kind: 'sticky'; x1: number; y1: number; x2: number; y2: number }
  | { kind: 'ellipse'; x1: number; y1: number; x2: number; y2: number }
  | { kind: 'triangle'; x1: number; y1: number; x2: number; y2: number }
  | { kind: 'kite'; x1: number; y1: number; x2: number; y2: number }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { kind: 'arrow'; x1: number; y1: number; x2: number; y2: number }

export function createDraftFromTool(
  tool: CanvasTool,
  w: { x: number; y: number },
): Draft | null {
  if (tool === 'pen') {
    return { kind: 'pen', points: [w.x, w.y] }
  }
  if (tool === 'rect') {
    return {
      kind: 'rect',
      x1: w.x,
      y1: w.y,
      x2: w.x,
      y2: w.y,
    }
  }
  if (tool === 'sticky') {
    return {
      kind: 'sticky',
      x1: w.x,
      y1: w.y,
      x2: w.x,
      y2: w.y,
    }
  }
  if (tool === 'circle') {
    return {
      kind: 'ellipse',
      x1: w.x,
      y1: w.y,
      x2: w.x,
      y2: w.y,
    }
  }
  if (tool === 'triangle') {
    return {
      kind: 'triangle',
      x1: w.x,
      y1: w.y,
      x2: w.x,
      y2: w.y,
    }
  }
  if (tool === 'kite') {
    return {
      kind: 'kite',
      x1: w.x,
      y1: w.y,
      x2: w.x,
      y2: w.y,
    }
  }
  if (tool === 'line') {
    return {
      kind: 'line',
      x1: w.x,
      y1: w.y,
      x2: w.x,
      y2: w.y,
    }
  }
  if (tool === 'arrow') {
    return {
      kind: 'arrow',
      x1: w.x,
      y1: w.y,
      x2: w.x,
      y2: w.y,
    }
  }
  return null
}

export function mergeDraftWithPoint(
  draft: Draft,
  p: { x: number; y: number },
  penMinDist: number,
): Draft {
  if (draft.kind === 'pen') {
    const pts = draft.points
    const lx = pts[pts.length - 2] ?? p.x
    const ly = pts[pts.length - 1] ?? p.y
    if (Math.hypot(p.x - lx, p.y - ly) < penMinDist) {
      return draft
    }
    return { ...draft, points: [...draft.points, p.x, p.y] }
  }
  return { ...draft, x2: p.x, y2: p.y }
}

export type CommitDeps = {
  stroke: string
  newId: () => string
  minShapePx: number
  stickyFill: string
  stickyTextColor: string
  /** Default fill for new rect / ellipse (hex) */
  shapeFill: string
  /** Default fill opacity for new rect / ellipse */
  shapeFillOpacity: number
}

export function commitDraft(d: Draft, deps: CommitDeps): DrawShape | null {
  const {
    stroke,
    newId,
    minShapePx,
    stickyFill,
    stickyTextColor,
    shapeFill,
    shapeFillOpacity,
  } = deps
  const sw = STROKE_WIDTH

  if (d.kind === 'pen') {
    if (d.points.length < 4) return null
    return {
      id: newId(),
      kind: 'path',
      points: d.points,
      stroke,
      strokeWidth: PEN_STROKE_WIDTH,
    }
  }
  if (d.kind === 'rect') {
    const x = Math.min(d.x1, d.x2)
    const y = Math.min(d.y1, d.y2)
    const w = Math.abs(d.x2 - d.x1)
    const h = Math.abs(d.y2 - d.y1)
    if (w < minShapePx || h < minShapePx) return null
    return {
      id: newId(),
      kind: 'rect',
      x,
      y,
      width: w,
      height: h,
      stroke,
      strokeWidth: sw,
      fill: shapeFill,
      fillOpacity: shapeFillOpacity,
    }
  }
  if (d.kind === 'triangle' || d.kind === 'kite') {
    const x = Math.min(d.x1, d.x2)
    const y = Math.min(d.y1, d.y2)
    const w = Math.abs(d.x2 - d.x1)
    const h = Math.abs(d.y2 - d.y1)
    if (w < minShapePx || h < minShapePx) return null
    return {
      id: newId(),
      kind: d.kind === 'triangle' ? 'triangle' : 'kite',
      x,
      y,
      width: w,
      height: h,
      stroke,
      strokeWidth: sw,
      fill: shapeFill,
      fillOpacity: shapeFillOpacity,
    }
  }
  if (d.kind === 'sticky') {
    const x = Math.min(d.x1, d.x2)
    const y = Math.min(d.y1, d.y2)
    const w = Math.abs(d.x2 - d.x1)
    const h = Math.abs(d.y2 - d.y1)
    if (w < minShapePx || h < minShapePx) return null
    return {
      id: newId(),
      kind: 'sticky',
      x,
      y,
      width: w,
      height: h,
      text: 'Note',
      fill: stickyFill,
      textColor: stickyTextColor,
      fillOpacity: 1,
      fontSize: 13,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      align: 'left',
    }
  }
  if (d.kind === 'ellipse') {
    const cx = (d.x1 + d.x2) / 2
    const cy = (d.y1 + d.y2) / 2
    const rx = Math.abs(d.x2 - d.x1) / 2
    const ry = Math.abs(d.y2 - d.y1) / 2
    if (rx < minShapePx / 2 || ry < minShapePx / 2) return null
    return {
      id: newId(),
      kind: 'ellipse',
      cx,
      cy,
      rx,
      ry,
      stroke,
      strokeWidth: sw,
      fill: shapeFill,
      fillOpacity: shapeFillOpacity,
    }
  }
  if (d.kind === 'line' || d.kind === 'arrow') {
    const dist = Math.hypot(d.x2 - d.x1, d.y2 - d.y1)
    if (dist < minShapePx) return null
    if (d.kind === 'line') {
      return {
        id: newId(),
        kind: 'line',
        x1: d.x1,
        y1: d.y1,
        x2: d.x2,
        y2: d.y2,
        stroke,
        strokeWidth: sw,
      }
    }
    return {
      id: newId(),
      kind: 'arrow',
      x1: d.x1,
      y1: d.y1,
      x2: d.x2,
      y2: d.y2,
      stroke,
      strokeWidth: sw,
    }
  }
  return null
}
