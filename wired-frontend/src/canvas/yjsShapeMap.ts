import * as Y from 'yjs'
import type { DrawShape } from '../context/canvasTypes'

/** Must match `SHAPES_MAP_NAME` on the server (`wired-backend/src/lib/yjsRooms.ts`). */
export const SHAPES_MAP_NAME = 'shapes'

export const ORIGIN_LOCAL = 'wired-yjs-local'

export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary)
}

export function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out
}

export function yMapToShapes(ymap: Y.Map<string>): DrawShape[] {
  const list: DrawShape[] = []
  ymap.forEach((val) => {
    if (typeof val !== 'string') return
    try {
      list.push(JSON.parse(val) as DrawShape)
    } catch {
      /* skip invalid */
    }
  })
  list.sort((a, b) => a.id.localeCompare(b.id))
  return list
}

/** Push current editor state into the shared CRDT map (inside a transact). */
export function syncShapesToYMap(ymap: Y.Map<string>, shapes: DrawShape[]) {
  const nextIds = new Set(shapes.map((s) => s.id))
  const toDelete: string[] = []
  ymap.forEach((_, k) => {
    if (!nextIds.has(k)) toDelete.push(k)
  })
  for (const k of toDelete) ymap.delete(k)
  for (const s of shapes) {
    const json = JSON.stringify(s)
    if (ymap.get(s.id) !== json) ymap.set(s.id, json)
  }
}
