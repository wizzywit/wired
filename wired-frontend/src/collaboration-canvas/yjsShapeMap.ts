import * as Y from 'yjs';
import type { DrawShape } from '../theme/canvasTypes';
import { type ShapeRootMap, syncShapesToYRoot, yRootMapToShapes } from './yShapeCrdt';

/** Must match `SHAPES_MAP_NAME` on the server (`wired-backend/src/lib/yjsRooms.ts`). */
export const SHAPES_MAP_NAME = 'shapes';

export const ORIGIN_LOCAL = 'wired-yjs-local';

export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

export function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export function getShapesRoot(ydoc: Y.Doc): ShapeRootMap {
  return ydoc.getMap(SHAPES_MAP_NAME);
}

export function yMapToShapes(ymap: ShapeRootMap): DrawShape[] {
  return yRootMapToShapes(ymap);
}

/** Push current editor state into the shared CRDT map (inside a transact). */
export function syncShapesToYMap(ymap: ShapeRootMap, shapes: DrawShape[]) {
  syncShapesToYRoot(ymap, shapes);
}

/**
 * Encode a full Yjs document update for shapes only — used when creating a document
 * so the server can persist room state before the canvas opens (no client-side template race).
 */
export function buildInitialYjsBase64FromShapes(shapes: DrawShape[]): string {
  const ydoc = new Y.Doc();
  const ymap = getShapesRoot(ydoc);
  ydoc.transact(() => {
    syncShapesToYMap(ymap, shapes);
  });
  return uint8ToBase64(Y.encodeStateAsUpdate(ydoc));
}
