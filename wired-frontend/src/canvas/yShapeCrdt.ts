import * as Y from 'yjs'
import type { DrawShape, StrokeDashPreset } from '../context/canvasTypes'

/** Root map values: nested `Y.Map` (structured CRDT) or legacy JSON `string`. */
export type ShapeRootMap = Y.Map<unknown>

function yStr(m: Y.Map<unknown>, key: string, v: string | undefined) {
  if (v === undefined) {
    if (m.has(key)) m.delete(key)
    return
  }
  if (m.get(key) !== v) m.set(key, v)
}

function yNum(m: Y.Map<unknown>, key: string, v: number | undefined) {
  if (v === undefined) {
    if (m.has(key)) m.delete(key)
    return
  }
  if (m.get(key) !== v) m.set(key, v)
}

function readStr(m: Y.Map<unknown>, key: string): string | undefined {
  const v = m.get(key)
  return typeof v === 'string' ? v : undefined
}

function readNum(m: Y.Map<unknown>, key: string): number | undefined {
  const v = m.get(key)
  return typeof v === 'number' && !Number.isNaN(v) ? v : undefined
}

function readPoints(inner: Y.Map<unknown>): number[] {
  const arr = inner.get('points')
  if (!(arr instanceof Y.Array)) return []
  const out: number[] = []
  arr.forEach((v) => {
    if (typeof v === 'number') out.push(v)
  })
  return out
}

function pointsEqual(a: number[], b: number[]) {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

function writePoints(inner: Y.Map<unknown>, points: number[]) {
  const current = readPoints(inner)
  if (pointsEqual(current, points)) return

  let arr = inner.get('points')
  if (!(arr instanceof Y.Array)) {
    arr = new Y.Array<number>()
    inner.set('points', arr)
  }
  const yarr = arr as Y.Array<number>
  yarr.delete(0, yarr.length)
  if (points.length > 0) {
    yarr.push(points)
  }
}

function getOrCreateInner(root: ShapeRootMap, shape: DrawShape): Y.Map<unknown> {
  const existing = root.get(shape.id)
  if (existing instanceof Y.Map) {
    const k = existing.get('kind')
    if (k === shape.kind) return existing
  }
  root.delete(shape.id)
  const inner = new Y.Map<unknown>()
  root.set(shape.id, inner)
  return inner
}

function writeCommon(
  inner: Y.Map<unknown>,
  id: string,
  kind: DrawShape['kind'],
) {
  yStr(inner, 'id', id)
  yStr(inner, 'kind', kind)
}

function shapeFromInnerMap(id: string, inner: Y.Map<unknown>): DrawShape | null {
  const kind = readStr(inner, 'kind') as DrawShape['kind'] | undefined
  if (!kind) return null

  switch (kind) {
    case 'path': {
      const points = readPoints(inner)
      const stroke = readStr(inner, 'stroke')
      const strokeWidth = readNum(inner, 'strokeWidth')
      if (!stroke || strokeWidth === undefined) return null
      const dash = readStr(inner, 'strokeDash') as StrokeDashPreset | undefined
      return {
        id,
        kind: 'path',
        points,
        stroke,
        strokeWidth,
        ...(dash ? { strokeDash: dash } : {}),
      }
    }
    case 'rect': {
      const x = readNum(inner, 'x')
      const y = readNum(inner, 'y')
      const width = readNum(inner, 'width')
      const height = readNum(inner, 'height')
      const stroke = readStr(inner, 'stroke')
      const strokeWidth = readNum(inner, 'strokeWidth')
      if (
        x === undefined ||
        y === undefined ||
        width === undefined ||
        height === undefined ||
        !stroke ||
        strokeWidth === undefined
      )
        return null
      return {
        id,
        kind: 'rect',
        x,
        y,
        width,
        height,
        stroke,
        strokeWidth,
        fill: readStr(inner, 'fill'),
        fillOpacity: readNum(inner, 'fillOpacity'),
        strokeDash: readStr(inner, 'strokeDash') as StrokeDashPreset | undefined,
      }
    }
    case 'ellipse': {
      const cx = readNum(inner, 'cx')
      const cy = readNum(inner, 'cy')
      const rx = readNum(inner, 'rx')
      const ry = readNum(inner, 'ry')
      const stroke = readStr(inner, 'stroke')
      const strokeWidth = readNum(inner, 'strokeWidth')
      if (
        cx === undefined ||
        cy === undefined ||
        rx === undefined ||
        ry === undefined ||
        !stroke ||
        strokeWidth === undefined
      )
        return null
      return {
        id,
        kind: 'ellipse',
        cx,
        cy,
        rx,
        ry,
        stroke,
        strokeWidth,
        fill: readStr(inner, 'fill'),
        fillOpacity: readNum(inner, 'fillOpacity'),
        strokeDash: readStr(inner, 'strokeDash') as StrokeDashPreset | undefined,
      }
    }
    case 'triangle':
    case 'kite': {
      const x = readNum(inner, 'x')
      const y = readNum(inner, 'y')
      const width = readNum(inner, 'width')
      const height = readNum(inner, 'height')
      const stroke = readStr(inner, 'stroke')
      const strokeWidth = readNum(inner, 'strokeWidth')
      if (
        x === undefined ||
        y === undefined ||
        width === undefined ||
        height === undefined ||
        !stroke ||
        strokeWidth === undefined
      )
        return null
      return {
        id,
        kind,
        x,
        y,
        width,
        height,
        rotation: readNum(inner, 'rotation'),
        stroke,
        strokeWidth,
        fill: readStr(inner, 'fill'),
        fillOpacity: readNum(inner, 'fillOpacity'),
        strokeDash: readStr(inner, 'strokeDash') as StrokeDashPreset | undefined,
      }
    }
    case 'line':
    case 'arrow': {
      const x1 = readNum(inner, 'x1')
      const y1 = readNum(inner, 'y1')
      const x2 = readNum(inner, 'x2')
      const y2 = readNum(inner, 'y2')
      const stroke = readStr(inner, 'stroke')
      const strokeWidth = readNum(inner, 'strokeWidth')
      if (
        x1 === undefined ||
        y1 === undefined ||
        x2 === undefined ||
        y2 === undefined ||
        !stroke ||
        strokeWidth === undefined
      )
        return null
      return {
        id,
        kind,
        x1,
        y1,
        x2,
        y2,
        stroke,
        strokeWidth,
        strokeDash: readStr(inner, 'strokeDash') as StrokeDashPreset | undefined,
      }
    }
    case 'text': {
      const x = readNum(inner, 'x')
      const y = readNum(inner, 'y')
      const text = readStr(inner, 'text')
      const fontSize = readNum(inner, 'fontSize')
      const fill = readStr(inner, 'fill')
      const width = readNum(inner, 'width')
      if (
        x === undefined ||
        y === undefined ||
        text === undefined ||
        fontSize === undefined ||
        !fill ||
        width === undefined
      )
        return null
      const fontStyle = readStr(inner, 'fontStyle')
      const align = readStr(inner, 'align')
      const fs =
        fontStyle === 'normal' ||
        fontStyle === 'bold' ||
        fontStyle === 'italic' ||
        fontStyle === 'bold italic'
          ? fontStyle
          : undefined
      const al =
        align === 'left' || align === 'center' || align === 'right'
          ? align
          : undefined
      const t: DrawShape = {
        id,
        kind: 'text',
        x,
        y,
        text,
        fontSize,
        fill,
        width,
        fontFamily: readStr(inner, 'fontFamily'),
        ...(fs ? { fontStyle: fs } : {}),
        ...(al ? { align: al } : {}),
      }
      return t
    }
    case 'sticky': {
      const x = readNum(inner, 'x')
      const y = readNum(inner, 'y')
      const width = readNum(inner, 'width')
      const height = readNum(inner, 'height')
      const text = readStr(inner, 'text')
      const fill = readStr(inner, 'fill')
      const textColor = readStr(inner, 'textColor')
      if (
        x === undefined ||
        y === undefined ||
        width === undefined ||
        height === undefined ||
        text === undefined ||
        !fill ||
        !textColor
      )
        return null
      return {
        id,
        kind: 'sticky',
        x,
        y,
        width,
        height,
        rotation: readNum(inner, 'rotation'),
        text,
        fill,
        textColor,
        fillOpacity: readNum(inner, 'fillOpacity'),
        stroke: readStr(inner, 'stroke'),
        strokeWidth: readNum(inner, 'strokeWidth'),
        fontSize: readNum(inner, 'fontSize'),
        fontFamily: readStr(inner, 'fontFamily'),
        fontStyle: readStr(inner, 'fontStyle') as
          | 'normal'
          | 'bold'
          | 'italic'
          | 'bold italic'
          | undefined,
        align: readStr(inner, 'align') as 'left' | 'center' | 'right' | undefined,
      }
    }
    default:
      return null
  }
}

export function readShapeEntry(id: string, val: unknown): DrawShape | null {
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val) as DrawShape
      return parsed?.id === id ? parsed : null
    } catch {
      return null
    }
  }
  if (val instanceof Y.Map) {
    return shapeFromInnerMap(id, val)
  }
  return null
}

export function writeShapeToRoot(root: ShapeRootMap, shape: DrawShape) {
  const inner = getOrCreateInner(root, shape)
  writeCommon(inner, shape.id, shape.kind)

  switch (shape.kind) {
    case 'path':
      writePoints(inner, shape.points)
      yStr(inner, 'stroke', shape.stroke)
      yNum(inner, 'strokeWidth', shape.strokeWidth)
      yStr(inner, 'strokeDash', shape.strokeDash)
      break
    case 'rect':
      yNum(inner, 'x', shape.x)
      yNum(inner, 'y', shape.y)
      yNum(inner, 'width', shape.width)
      yNum(inner, 'height', shape.height)
      yStr(inner, 'stroke', shape.stroke)
      yNum(inner, 'strokeWidth', shape.strokeWidth)
      yStr(inner, 'fill', shape.fill)
      yNum(inner, 'fillOpacity', shape.fillOpacity)
      yStr(inner, 'strokeDash', shape.strokeDash)
      break
    case 'ellipse':
      yNum(inner, 'cx', shape.cx)
      yNum(inner, 'cy', shape.cy)
      yNum(inner, 'rx', shape.rx)
      yNum(inner, 'ry', shape.ry)
      yStr(inner, 'stroke', shape.stroke)
      yNum(inner, 'strokeWidth', shape.strokeWidth)
      yStr(inner, 'fill', shape.fill)
      yNum(inner, 'fillOpacity', shape.fillOpacity)
      yStr(inner, 'strokeDash', shape.strokeDash)
      break
    case 'triangle':
    case 'kite':
      yNum(inner, 'x', shape.x)
      yNum(inner, 'y', shape.y)
      yNum(inner, 'width', shape.width)
      yNum(inner, 'height', shape.height)
      yNum(inner, 'rotation', shape.rotation)
      yStr(inner, 'stroke', shape.stroke)
      yNum(inner, 'strokeWidth', shape.strokeWidth)
      yStr(inner, 'fill', shape.fill)
      yNum(inner, 'fillOpacity', shape.fillOpacity)
      yStr(inner, 'strokeDash', shape.strokeDash)
      break
    case 'line':
    case 'arrow':
      yNum(inner, 'x1', shape.x1)
      yNum(inner, 'y1', shape.y1)
      yNum(inner, 'x2', shape.x2)
      yNum(inner, 'y2', shape.y2)
      yStr(inner, 'stroke', shape.stroke)
      yNum(inner, 'strokeWidth', shape.strokeWidth)
      yStr(inner, 'strokeDash', shape.strokeDash)
      break
    case 'text':
      yNum(inner, 'x', shape.x)
      yNum(inner, 'y', shape.y)
      yStr(inner, 'text', shape.text)
      yNum(inner, 'fontSize', shape.fontSize)
      yStr(inner, 'fill', shape.fill)
      yNum(inner, 'width', shape.width)
      yStr(inner, 'fontFamily', shape.fontFamily)
      yStr(inner, 'fontStyle', shape.fontStyle)
      yStr(inner, 'align', shape.align)
      break
    case 'sticky':
      yNum(inner, 'x', shape.x)
      yNum(inner, 'y', shape.y)
      yNum(inner, 'width', shape.width)
      yNum(inner, 'height', shape.height)
      yNum(inner, 'rotation', shape.rotation)
      yStr(inner, 'text', shape.text)
      yStr(inner, 'fill', shape.fill)
      yStr(inner, 'textColor', shape.textColor)
      yNum(inner, 'fillOpacity', shape.fillOpacity)
      yStr(inner, 'stroke', shape.stroke)
      yNum(inner, 'strokeWidth', shape.strokeWidth)
      yNum(inner, 'fontSize', shape.fontSize)
      yStr(inner, 'fontFamily', shape.fontFamily)
      yStr(inner, 'fontStyle', shape.fontStyle)
      yStr(inner, 'align', shape.align)
      break
    default:
      break
  }
}

export function yRootMapToShapes(root: ShapeRootMap): DrawShape[] {
  const list: DrawShape[] = []
  root.forEach((val, id) => {
    const shape = readShapeEntry(id, val)
    if (shape) list.push(shape)
  })
  list.sort((a, b) => a.id.localeCompare(b.id))
  return list
}

export function syncShapesToYRoot(root: ShapeRootMap, shapes: DrawShape[]) {
  const nextIds = new Set(shapes.map((s) => s.id))
  const toDelete: string[] = []
  root.forEach((_, k) => {
    if (!nextIds.has(k)) toDelete.push(k)
  })
  for (const k of toDelete) root.delete(k)
  for (const s of shapes) {
    writeShapeToRoot(root, s)
  }
}
