import * as Y from 'yjs'
import type { DrawShape } from '../context/canvasTypes'
import {
  type ShapeRootMap,
  syncShapesToYRoot,
  yRootMapToShapes,
} from './yShapeCrdt'

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

export function getShapesRoot(ydoc: Y.Doc): ShapeRootMap {
  return ydoc.getMap(SHAPES_MAP_NAME)
}

export function yMapToShapes(ymap: ShapeRootMap): DrawShape[] {
  return yRootMapToShapes(ymap)
}

/** Push current editor state into the shared CRDT map (inside a transact). */
export function syncShapesToYMap(ymap: ShapeRootMap, shapes: DrawShape[]) {
  syncShapesToYRoot(ymap, shapes)
}
