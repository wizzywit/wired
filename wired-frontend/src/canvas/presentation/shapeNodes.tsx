import {
  Arrow,
  Ellipse,
  Line,
  Rect,
} from 'react-konva'
import type { DrawShape } from '../../context/canvasTypes'
import type { Draft } from '../domain/drawingDraft'

export function CommittedShapeNode({ shape: s }: { shape: DrawShape }) {
  switch (s.kind) {
    case 'path':
      return (
        <Line
          points={s.points}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          lineCap="round"
          lineJoin="round"
          listening={false}
          perfectDrawEnabled={false}
        />
      )
    case 'rect':
      return (
        <Rect
          x={s.x}
          y={s.y}
          width={s.width}
          height={s.height}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          fill="transparent"
          listening={false}
        />
      )
    case 'ellipse':
      return (
        <Ellipse
          x={s.cx}
          y={s.cy}
          radiusX={s.rx}
          radiusY={s.ry}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          fill="transparent"
          listening={false}
        />
      )
    case 'line':
      return (
        <Line
          points={[s.x1, s.y1, s.x2, s.y2]}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          lineCap="round"
          listening={false}
          perfectDrawEnabled={false}
        />
      )
    case 'arrow':
      return (
        <Arrow
          points={[s.x1, s.y1, s.x2, s.y2]}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          fill={s.stroke}
          pointerLength={12}
          pointerWidth={12}
          listening={false}
        />
      )
    default:
      return null
  }
}

export function DraftShapeNode({
  draft: d,
  stroke,
}: {
  draft: Draft
  stroke: string
}) {
  const dash = [6, 6]
  if (d.kind === 'pen') {
    if (d.points.length < 4) return null
    return (
      <Line
        points={d.points}
        stroke={stroke}
        strokeWidth={2.5}
        lineCap="round"
        lineJoin="round"
        dash={dash}
        listening={false}
        perfectDrawEnabled={false}
      />
    )
  }
  if (d.kind === 'rect') {
    const x = Math.min(d.x1, d.x2)
    const y = Math.min(d.y1, d.y2)
    const w = Math.abs(d.x2 - d.x1)
    const h = Math.abs(d.y2 - d.y1)
    return (
      <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        stroke={stroke}
        strokeWidth={2}
        fill="transparent"
        dash={dash}
        listening={false}
      />
    )
  }
  if (d.kind === 'ellipse') {
    const cx = (d.x1 + d.x2) / 2
    const cy = (d.y1 + d.y2) / 2
    const rx = Math.abs(d.x2 - d.x1) / 2
    const ry = Math.abs(d.y2 - d.y1) / 2
    return (
      <Ellipse
        x={cx}
        y={cy}
        radiusX={rx}
        radiusY={ry}
        stroke={stroke}
        strokeWidth={2}
        fill="transparent"
        dash={dash}
        listening={false}
      />
    )
  }
  if (d.kind === 'line') {
    return (
      <Line
        points={[d.x1, d.y1, d.x2, d.y2]}
        stroke={stroke}
        strokeWidth={2}
        lineCap="round"
        dash={dash}
        listening={false}
        perfectDrawEnabled={false}
      />
    )
  }
  if (d.kind === 'arrow') {
    return (
      <Arrow
        points={[d.x1, d.y1, d.x2, d.y2]}
        stroke={stroke}
        strokeWidth={2}
        fill={stroke}
        pointerLength={12}
        pointerWidth={12}
        dash={dash}
        listening={false}
      />
    )
  }
  return null
}
