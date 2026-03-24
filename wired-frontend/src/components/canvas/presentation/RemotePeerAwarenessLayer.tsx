import { Group, Path, Rect, Text } from 'react-konva'
import type { DrawShape } from '../../../context/canvasTypes'
import type { RemotePeerAwareness } from '../../../canvas/awarenessTypes'
import { shapeWorldBoundsLoose } from '../utils/shapeWorldBounds'

/** Tip at (0,0); matches a classic arrow pointer hotspot. */
const CURSOR_PATH =
  'M 0 0 L 0 16 L 5 12 L 8 19 L 10 18 L 7 9 L 12 9 Z'

function colorForUserId(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  const hue = Math.abs(h) % 360
  return `hsl(${hue} 72% 48%)`
}

function initialsFromUser(user: RemotePeerAwareness['user']): string {
  const name = user.displayName?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      const first = parts[0]!.charAt(0)
      const last = parts[parts.length - 1]!.charAt(0)
      return (first + last).toUpperCase()
    }
    if (parts.length === 1 && parts[0]!.length >= 2) {
      return parts[0]!.slice(0, 2).toUpperCase()
    }
    if (parts.length === 1 && parts[0]!.length === 1) {
      const e = user.email?.charAt(0) ?? ''
      return (parts[0]! + e).toUpperCase()
    }
  }
  const local = user.email?.split('@')[0]?.trim() ?? ''
  if (local.length >= 2) return local.slice(0, 2).toUpperCase()
  if (local.length === 1) return local.toUpperCase()
  return '?'
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
        const initials = initialsFromUser(p.user)
        const badgeW = Math.max(26, 8 + initials.length * 7)
        const badgeH = 18
        const badgeX = 10
        const badgeY = 4
        return (
          <Group key={`cur-${p.user.id}`} x={c.wx} y={c.wy} listening={false}>
            <Path
              data={CURSOR_PATH}
              fill={fill}
              stroke="#ffffff"
              strokeWidth={1.25}
              lineJoin="round"
              listening={false}
            />
            <Group x={badgeX} y={badgeY} listening={false}>
              <Rect
                width={badgeW}
                height={badgeH}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={1}
                cornerRadius={4}
                listening={false}
              />
              <Text
                text={initials}
                x={0}
                y={0}
                width={badgeW}
                height={badgeH}
                align="center"
                verticalAlign="middle"
                fontSize={10}
                fill="#ffffff"
                fontStyle="bold"
                listening={false}
              />
            </Group>
          </Group>
        )
      })}
    </>
  )
}
