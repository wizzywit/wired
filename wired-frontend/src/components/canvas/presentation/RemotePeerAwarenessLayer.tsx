import { Circle, Group, Rect, Text } from 'react-konva'
import type { DrawShape } from '../../../context/canvasTypes'
import type { RemotePeerAwareness } from '../../../canvas/awarenessTypes'
import { shapeWorldBoundsLoose } from '../utils/shapeWorldBounds'

function colorForUserId(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  const hue = Math.abs(h) % 360
  return `hsl(${hue} 72% 48%)`
}

export function RemotePeerAwarenessLayer({
  peers,
  localUserId,
  shapes,
}: {
  peers: RemotePeerAwareness[]
  localUserId: string
  shapes: DrawShape[]
}) {
  const byId = new Map(shapes.map((s) => [s.id, s]))
  const remote = peers.filter((p) => p.user.id !== localUserId)

  return (
    <>
      {remote.map((p) => {
        const sid = p.selectedId
        if (!sid) return null
        const shape = byId.get(sid)
        if (!shape) return null
        const b = shapeWorldBoundsLoose(shape)
        if (!b) return null
        const stroke = colorForUserId(p.user.id)
        return (
          <Rect
            key={`sel-${p.user.id}`}
            x={b.x}
            y={b.y}
            width={b.width}
            height={b.height}
            stroke={stroke}
            strokeWidth={1.5}
            dash={[6, 4]}
            listening={false}
          />
        )
      })}
      {remote.map((p) => {
        const c = p.cursor
        if (!c) return null
        const fill = colorForUserId(p.user.id)
        const label = p.user.displayName?.trim() || p.user.email || 'Peer'
        return (
          <Group key={`cur-${p.user.id}`} x={c.wx} y={c.wy} listening={false}>
            <Circle radius={5} fill={fill} stroke="#ffffff" strokeWidth={1.5} />
            <Text
              text={label.length > 18 ? `${label.slice(0, 17)}…` : label}
              x={10}
              y={-18}
              fontSize={11}
              fill={fill}
              fontStyle="bold"
              listening={false}
            />
            {c.tool && c.tool !== 'select' ? (
              <Text
                text={c.tool}
                x={10}
                y={-4}
                fontSize={9}
                fill={fill}
                opacity={0.85}
                listening={false}
              />
            ) : null}
          </Group>
        )
      })}
    </>
  )
}
