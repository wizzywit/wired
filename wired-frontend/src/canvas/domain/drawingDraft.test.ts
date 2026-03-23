import { describe, expect, it } from 'vitest'
import { MIN_SHAPE_PX } from './canvasConfig'
import {
  commitDraft,
  createDraftFromTool,
  mergeDraftWithPoint,
} from './drawingDraft'

describe('createDraftFromTool', () => {
  it('returns null for select', () => {
    expect(createDraftFromTool('select', { x: 0, y: 0 })).toBeNull()
  })

  it('creates pen draft with initial point', () => {
    const d = createDraftFromTool('pen', { x: 1, y: 2 })
    expect(d).toEqual({ kind: 'pen', points: [1, 2] })
  })

  it('maps circle tool to ellipse draft', () => {
    const d = createDraftFromTool('circle', { x: 0, y: 0 })
    expect(d?.kind).toBe('ellipse')
  })
})

describe('mergeDraftWithPoint', () => {
  it('extends pen stroke when point is far enough', () => {
    const d0 = createDraftFromTool('pen', { x: 0, y: 0 })!
    const d1 = mergeDraftWithPoint(d0, { x: 10, y: 0 }, 1)
    expect(d1.kind).toBe('pen')
    if (d1.kind === 'pen') {
      expect(d1.points.length).toBeGreaterThan(2)
    }
  })

  it('skips pen point when too close', () => {
    const d0 = createDraftFromTool('pen', { x: 0, y: 0 })!
    const d1 = mergeDraftWithPoint(d0, { x: 0.2, y: 0 }, 1.5)
    expect(d1).toEqual(d0)
  })

  it('updates drag end for rect', () => {
    const d0 = createDraftFromTool('rect', { x: 0, y: 0 })!
    const d1 = mergeDraftWithPoint(d0, { x: 5, y: 6 }, 1)
    expect(d1).toMatchObject({ kind: 'rect', x2: 5, y2: 6 })
  })
})

describe('commitDraft', () => {
  const ids = () => {
    let n = 0
    return () => `t-${++n}`
  }

  it('returns null for pen with too few points', () => {
    const d = createDraftFromTool('pen', { x: 0, y: 0 })!
    const shape = commitDraft(d, {
      stroke: '#000',
      newId: ids(),
      minShapePx: MIN_SHAPE_PX,
    })
    expect(shape).toBeNull()
  })

  it('commits rectangle when large enough', () => {
    const d = {
      kind: 'rect' as const,
      x1: 0,
      y1: 0,
      x2: 10,
      y2: 10,
    }
    const shape = commitDraft(d, {
      stroke: '#2962ff',
      newId: ids(),
      minShapePx: MIN_SHAPE_PX,
    })
    expect(shape?.kind).toBe('rect')
    if (shape?.kind === 'rect') {
      expect(shape.width).toBe(10)
      expect(shape.height).toBe(10)
    }
  })

  it('rejects tiny rectangle', () => {
    const d = {
      kind: 'rect' as const,
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 1,
    }
    const shape = commitDraft(d, {
      stroke: '#2962ff',
      newId: ids(),
      minShapePx: MIN_SHAPE_PX,
    })
    expect(shape).toBeNull()
  })
})
