import type Konva from 'konva'
import type { Context } from 'konva/lib/Context'
import type { KonvaEventObject } from 'konva/lib/Node'
import {
  Arrow,
  Ellipse,
  Group,
  Line,
  Rect,
  Text,
} from 'react-konva'
import type { DrawShape } from '../../../context/canvasTypes'
import { dashToKonva, resolveKonvaFill, type Draft } from '../utils'

function trianglePoints(w: number, h: number) {
  return [w / 2, 0, w, h, 0, h]
}

function kitePoints(w: number, h: number) {
  return [w / 2, 0, w, h / 2, w / 2, h, 0, h / 2]
}

export type ShapeInteractionProps = {
  interactive: boolean
  onSelect: () => void
  onChange: (next: DrawShape) => void
  /** Register Konva node for Transformer / hit testing */
  innerRef: (node: Konva.Node | null) => void
  /** Inline editor covers Konva text while true */
  isEditing?: boolean
  /** Select tool: double-click to edit body */
  onBeginEdit?: () => void
}

function stopBubble(e: KonvaEventObject<unknown>) {
  e.cancelBubble = true
}

/** Tight hit around glyphs; default Text hit is the full fixed width × height box. */
function textShapeHitFunc(ctx: Context, shape: Konva.Shape) {
  const t = shape as Konva.Text
  const pad = t.padding() ?? 0
  const tw = t.getTextWidth()
  const th = t.getHeight()
  const bw = t.width()
  const align = t.align() ?? 'left'
  const innerW = Math.min(Math.max(0, tw), Math.max(0, bw - pad * 2))
  let x0 = pad
  if (align === 'center') {
    x0 = (bw - innerW) / 2
  } else if (align === 'right') {
    x0 = bw - innerW - pad
  }
  ctx.beginPath()
  ctx.rect(x0, pad, innerW, th - pad * 2)
  ctx.closePath()
  ctx.fillStrokeShape(t)
}

export function CommittedShapeNode({
  shape: s,
  interaction,
}: {
  shape: DrawShape
  interaction: ShapeInteractionProps
}) {
  const {
    interactive,
    onSelect,
    onChange,
    innerRef,
    isEditing = false,
    onBeginEdit,
  } = interaction
  const drag = interactive
  const listen = interactive

  switch (s.kind) {
    case 'path':
      return (
        <Line
          ref={innerRef as (n: Konva.Line | null) => void}
          points={s.points}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          dash={dashToKonva(s.strokeDash, s.strokeWidth)}
          lineCap="round"
          lineJoin="round"
          listening={listen}
          draggable={drag}
          onMouseDown={stopBubble}
          onClick={(e) => {
            stopBubble(e)
            onSelect()
          }}
          onDragEnd={(e) => {
            const n = e.target
            const dx = n.x()
            const dy = n.y()
            n.position({ x: 0, y: 0 })
            onChange({
              ...s,
              points: s.points.map((v, i) =>
                i % 2 === 0 ? v + dx : v + dy,
              ),
            })
          }}
          perfectDrawEnabled={false}
        />
      )
    case 'rect': {
      const kf = resolveKonvaFill(s.fill, s.fillOpacity)
      return (
        <Rect
          ref={innerRef as (n: Konva.Rect | null) => void}
          x={s.x}
          y={s.y}
          width={s.width}
          height={s.height}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          fill={kf.fill}
          fillOpacity={kf.fillOpacity}
          fillEnabled={kf.fillEnabled}
          dash={dashToKonva(s.strokeDash, s.strokeWidth)}
          listening={listen}
          draggable={drag}
          onMouseDown={stopBubble}
          onClick={(e) => {
            stopBubble(e)
            onSelect()
          }}
          onDragEnd={(e) => {
            const n = e.target as Konva.Rect
            onChange({ ...s, x: n.x(), y: n.y() })
          }}
          onTransformEnd={(e) => {
            const n = e.target as Konva.Rect
            const sx = n.scaleX()
            const sy = n.scaleY()
            onChange({
              ...s,
              x: n.x(),
              y: n.y(),
              width: Math.max(8, n.width() * sx),
              height: Math.max(8, n.height() * sy),
            })
            n.scaleX(1)
            n.scaleY(1)
          }}
        />
      )
    }
    case 'ellipse': {
      const kf = resolveKonvaFill(s.fill, s.fillOpacity)
      return (
        <Ellipse
          ref={innerRef as (n: Konva.Ellipse | null) => void}
          x={s.cx}
          y={s.cy}
          radiusX={s.rx}
          radiusY={s.ry}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          fill={kf.fill}
          fillOpacity={kf.fillOpacity}
          fillEnabled={kf.fillEnabled}
          dash={dashToKonva(s.strokeDash, s.strokeWidth)}
          listening={listen}
          draggable={drag}
          onMouseDown={stopBubble}
          onClick={(e) => {
            stopBubble(e)
            onSelect()
          }}
          onDragEnd={(e) => {
            const n = e.target as Konva.Ellipse
            onChange({ ...s, cx: n.x(), cy: n.y() })
          }}
          onTransformEnd={(e) => {
            const n = e.target as Konva.Ellipse
            const sx = n.scaleX()
            const sy = n.scaleY()
            onChange({
              ...s,
              cx: n.x(),
              cy: n.y(),
              rx: Math.max(4, n.radiusX() * sx),
              ry: Math.max(4, n.radiusY() * sy),
            })
            n.scaleX(1)
            n.scaleY(1)
          }}
        />
      )
    }
    case 'triangle': {
      const kf = resolveKonvaFill(s.fill, s.fillOpacity)
      const pts = trianglePoints(s.width, s.height)
      return (
        <Group
          ref={innerRef as (n: Konva.Group | null) => void}
          x={s.x}
          y={s.y}
          rotation={s.rotation ?? 0}
          listening={listen}
          draggable={drag}
          onMouseDown={stopBubble}
          onClick={(e) => {
            stopBubble(e)
            onSelect()
          }}
          onDragEnd={(e) => {
            const n = e.target as Konva.Group
            onChange({ ...s, x: n.x(), y: n.y() })
          }}
          onTransformEnd={(e) => {
            const n = e.target as Konva.Group
            const sx = n.scaleX()
            const sy = n.scaleY()
            onChange({
              ...s,
              x: n.x(),
              y: n.y(),
              width: Math.max(8, s.width * sx),
              height: Math.max(8, s.height * sy),
              rotation: n.rotation(),
            })
            n.scaleX(1)
            n.scaleY(1)
          }}
        >
          <Line
            points={pts}
            closed
            fill={kf.fill}
            fillOpacity={kf.fillOpacity}
            fillEnabled={kf.fillEnabled}
            stroke={s.stroke}
            strokeWidth={s.strokeWidth}
            dash={dashToKonva(s.strokeDash, s.strokeWidth)}
            lineJoin="round"
            listening={listen}
          />
        </Group>
      )
    }
    case 'kite': {
      const kf = resolveKonvaFill(s.fill, s.fillOpacity)
      const pts = kitePoints(s.width, s.height)
      return (
        <Group
          ref={innerRef as (n: Konva.Group | null) => void}
          x={s.x}
          y={s.y}
          rotation={s.rotation ?? 0}
          listening={listen}
          draggable={drag}
          onMouseDown={stopBubble}
          onClick={(e) => {
            stopBubble(e)
            onSelect()
          }}
          onDragEnd={(e) => {
            const n = e.target as Konva.Group
            onChange({ ...s, x: n.x(), y: n.y() })
          }}
          onTransformEnd={(e) => {
            const n = e.target as Konva.Group
            const sx = n.scaleX()
            const sy = n.scaleY()
            onChange({
              ...s,
              x: n.x(),
              y: n.y(),
              width: Math.max(8, s.width * sx),
              height: Math.max(8, s.height * sy),
              rotation: n.rotation(),
            })
            n.scaleX(1)
            n.scaleY(1)
          }}
        >
          <Line
            points={pts}
            closed
            fill={kf.fill}
            fillOpacity={kf.fillOpacity}
            fillEnabled={kf.fillEnabled}
            stroke={s.stroke}
            strokeWidth={s.strokeWidth}
            dash={dashToKonva(s.strokeDash, s.strokeWidth)}
            lineJoin="round"
            listening={listen}
          />
        </Group>
      )
    }
    case 'line':
      return (
        <Line
          ref={innerRef as (n: Konva.Line | null) => void}
          points={[s.x1, s.y1, s.x2, s.y2]}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          dash={dashToKonva(s.strokeDash, s.strokeWidth)}
          lineCap="round"
          listening={listen}
          draggable={drag}
          onMouseDown={stopBubble}
          onClick={(e) => {
            stopBubble(e)
            onSelect()
          }}
          onDragEnd={(e) => {
            const n = e.target as Konva.Line
            const dx = n.x()
            const dy = n.y()
            n.position({ x: 0, y: 0 })
            onChange({
              ...s,
              x1: s.x1 + dx,
              y1: s.y1 + dy,
              x2: s.x2 + dx,
              y2: s.y2 + dy,
            })
          }}
          onTransformEnd={(e) => {
            const n = e.target as Konva.Line
            const sx = n.scaleX()
            const sy = n.scaleY()
            const pts = n.points()
            const mx = (pts[0] + pts[2]) / 2
            const my = (pts[1] + pts[3]) / 2
            const x1 = mx + (pts[0] - mx) * sx
            const y1 = my + (pts[1] - my) * sy
            const x2 = mx + (pts[2] - mx) * sx
            const y2 = my + (pts[3] - my) * sy
            onChange({ ...s, x1, y1, x2, y2 })
            n.scaleX(1)
            n.scaleY(1)
            n.points([x1, y1, x2, y2])
          }}
          perfectDrawEnabled={false}
        />
      )
    case 'arrow':
      return (
        <Arrow
          ref={innerRef as (n: Konva.Arrow | null) => void}
          points={[s.x1, s.y1, s.x2, s.y2]}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          dash={dashToKonva(s.strokeDash, s.strokeWidth)}
          fill={s.stroke}
          pointerLength={12}
          pointerWidth={12}
          listening={listen}
          draggable={drag}
          onMouseDown={stopBubble}
          onClick={(e) => {
            stopBubble(e)
            onSelect()
          }}
          onDragEnd={(e) => {
            const n = e.target as Konva.Arrow
            const dx = n.x()
            const dy = n.y()
            n.position({ x: 0, y: 0 })
            onChange({
              ...s,
              x1: s.x1 + dx,
              y1: s.y1 + dy,
              x2: s.x2 + dx,
              y2: s.y2 + dy,
            })
          }}
          onTransformEnd={(e) => {
            const n = e.target as Konva.Arrow
            const sx = n.scaleX()
            const sy = n.scaleY()
            const pts = n.points()
            const mx = (pts[0] + pts[2]) / 2
            const my = (pts[1] + pts[3]) / 2
            const x1 = mx + (pts[0] - mx) * sx
            const y1 = my + (pts[1] - my) * sy
            const x2 = mx + (pts[2] - mx) * sx
            const y2 = my + (pts[3] - my) * sy
            onChange({ ...s, x1, y1, x2, y2 })
            n.scaleX(1)
            n.scaleY(1)
            n.points([x1, y1, x2, y2])
          }}
        />
      )
    case 'text':
      return (
        <Text
          ref={innerRef as (n: Konva.Text | null) => void}
          x={s.x}
          y={s.y}
          width={s.width}
          text={s.text || ' '}
          fontSize={s.fontSize}
          fontFamily={s.fontFamily ?? 'Inter, sans-serif'}
          fontStyle={s.fontStyle ?? 'normal'}
          align={s.align ?? 'left'}
          fill={s.fill}
          opacity={isEditing ? 0 : 1}
          listening={listen}
          draggable={drag}
          hitFunc={textShapeHitFunc}
          onMouseDown={stopBubble}
          onClick={(e) => {
            stopBubble(e)
            onSelect()
          }}
          onDblClick={(e) => {
            stopBubble(e)
            onBeginEdit?.()
          }}
          onDragEnd={(e) => {
            const n = e.target as Konva.Text
            onChange({ ...s, x: n.x(), y: n.y() })
          }}
          onTransformEnd={(e) => {
            const n = e.target as Konva.Text
            const sx = n.scaleX()
            const sy = n.scaleY()
            onChange({
              ...s,
              x: n.x(),
              y: n.y(),
              width: Math.max(40, n.width() * sx),
              fontSize: Math.max(8, s.fontSize * sy),
            })
            n.scaleX(1)
            n.scaleY(1)
          }}
        />
      )
    case 'sticky': {
      const stickyFill = resolveKonvaFill(s.fill, s.fillOpacity)
      return (
        <Group
          ref={innerRef as (n: Konva.Group | null) => void}
          x={s.x}
          y={s.y}
          rotation={s.rotation ?? 0}
          listening={listen}
          draggable={drag}
          onMouseDown={stopBubble}
          onClick={(e) => {
            stopBubble(e)
            onSelect()
          }}
          onDblClick={(e) => {
            stopBubble(e)
            onBeginEdit?.()
          }}
          onDragEnd={(e) => {
            const n = e.target as Konva.Group
            onChange({ ...s, x: n.x(), y: n.y() })
          }}
          onTransformEnd={(e) => {
            const n = e.target as Konva.Group
            const sx = n.scaleX()
            const sy = n.scaleY()
            onChange({
              ...s,
              x: n.x(),
              y: n.y(),
              width: Math.max(48, s.width * sx),
              height: Math.max(40, s.height * sy),
              rotation: n.rotation(),
            })
            n.scaleX(1)
            n.scaleY(1)
          }}
        >
          <Rect
            width={s.width}
            height={s.height}
            cornerRadius={8}
            fill={stickyFill.fill}
            fillOpacity={stickyFill.fillOpacity}
            fillEnabled={stickyFill.fillEnabled}
          />
          <Text
            x={10}
            y={10}
            width={s.width - 20}
            text={s.text || ' '}
            fontSize={s.fontSize ?? 13}
            fontFamily={s.fontFamily ?? 'Inter, sans-serif'}
            fontStyle={s.fontStyle ?? 'normal'}
            align={s.align ?? 'left'}
            fill={s.textColor}
            opacity={isEditing ? 0 : 1}
            listening={false}
          />
        </Group>
      )
    }
    default:
      return null
  }
}

export function DraftShapeNode({
  draft: d,
  stroke,
  stickyFill,
}: {
  draft: Draft
  stroke: string
  stickyFill: string
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
  if (d.kind === 'sticky') {
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
        fill={stickyFill}
        opacity={0.9}
        cornerRadius={8}
        listening={false}
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
  if (d.kind === 'triangle') {
    const x = Math.min(d.x1, d.x2)
    const y = Math.min(d.y1, d.y2)
    const w = Math.abs(d.x2 - d.x1)
    const h = Math.abs(d.y2 - d.y1)
    return (
      <Line
        points={trianglePoints(w, h)}
        x={x}
        y={y}
        closed
        stroke={stroke}
        strokeWidth={2}
        fill="transparent"
        dash={dash}
        lineJoin="round"
        listening={false}
        perfectDrawEnabled={false}
      />
    )
  }
  if (d.kind === 'kite') {
    const x = Math.min(d.x1, d.x2)
    const y = Math.min(d.y1, d.y2)
    const w = Math.abs(d.x2 - d.x1)
    const h = Math.abs(d.y2 - d.y1)
    return (
      <Line
        points={kitePoints(w, h)}
        x={x}
        y={y}
        closed
        stroke={stroke}
        strokeWidth={2}
        fill="transparent"
        dash={dash}
        lineJoin="round"
        listening={false}
        perfectDrawEnabled={false}
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
