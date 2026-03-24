import * as Y from "yjs";
import type { Server } from "socket.io";
import { env } from "../config/env.js";
import { redis } from "./redis.js";

const SHAPES_MAP_NAME = "shapes";

const roomYjsKey = (roomId: string) => `wired:rooms:${roomId}:yjs`;
const roomLegacyStateKey = (roomId: string) => `wired:rooms:${roomId}:state`;

const roomDocs = new Map<string, Y.Doc>();
const roomHydrated = new Set<string>();
const persistTimers = new Map<string, ReturnType<typeof setTimeout>>();

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function getLegacyObjects(snapshot: JsonValue): JsonValue[] {
  if (
    typeof snapshot === "object" &&
    snapshot !== null &&
    "objects" in snapshot &&
    Array.isArray((snapshot as { objects?: JsonValue[] }).objects)
  ) {
    return (snapshot as { objects: JsonValue[] }).objects;
  }
  return [];
}

export function getRoomDoc(roomId: string): Y.Doc {
  let doc = roomDocs.get(roomId);
  if (!doc) {
    doc = new Y.Doc();
    roomDocs.set(roomId, doc);
  }
  return doc;
}

function schedulePersist(roomId: string) {
  const existing = persistTimers.get(roomId);
  if (existing) clearTimeout(existing);
  const t = setTimeout(() => {
    persistTimers.delete(roomId);
    void persistRoomDoc(roomId);
  }, 400);
  persistTimers.set(roomId, t);
}

async function persistRoomDoc(roomId: string) {
  const doc = roomDocs.get(roomId);
  if (!doc) return;
  const update = Y.encodeStateAsUpdate(doc);
  await redis.set(roomYjsKey(roomId), Buffer.from(update).toString("base64"), {
    EX: env.ROOM_STATE_TTL_SECONDS
  });
}

/** Load persisted Yjs state; migrate legacy JSON snapshot once if needed. */
export async function loadRoomDoc(roomId: string): Promise<Y.Doc> {
  const doc = getRoomDoc(roomId);

  if (!roomHydrated.has(roomId)) {
    roomHydrated.add(roomId);

    const yjsRaw = await redis.get(roomYjsKey(roomId));
    if (yjsRaw) {
      const buf = Buffer.from(yjsRaw, "base64");
      Y.applyUpdate(doc, buf, "persist");
      return doc;
    }

    const legacyRaw = await redis.get(roomLegacyStateKey(roomId));
    if (legacyRaw) {
      try {
        const parsed = JSON.parse(legacyRaw) as { snapshot?: JsonValue };
        const objects = getLegacyObjects(parsed.snapshot ?? null);
        const ymap = doc.getMap<string>(SHAPES_MAP_NAME);
        doc.transact(() => {
          for (const obj of objects) {
            if (typeof obj !== "object" || obj === null || !("id" in obj)) continue;
            const id = (obj as { id?: string }).id;
            if (!id) continue;
            ymap.set(id, JSON.stringify(obj));
          }
        }, "migrate-legacy");
        await persistRoomDoc(roomId);
      } catch {
        // ignore corrupt legacy
      }
    }
  }

  return doc;
}

export function encodeDocAsBase64(doc: Y.Doc): string {
  return Buffer.from(Y.encodeStateAsUpdate(doc)).toString("base64");
}

export function applyUpdateFromBase64(doc: Y.Doc, base64: string, origin: unknown) {
  const buf = Buffer.from(base64, "base64");
  Y.applyUpdate(doc, buf, origin);
}

export function applyIncomingClientUpdate(roomId: string, base64: string) {
  const doc = getRoomDoc(roomId);
  applyUpdateFromBase64(doc, base64, "client");
  schedulePersist(roomId);
}

/**
 * When the last socket leaves a room, flush Yjs to Redis and drop the in-memory doc
 * so memory does not grow with abandoned rooms.
 */
export async function evictRoomIfEmpty(
  io: Server,
  roomId: string,
  exceptSocketId?: string
): Promise<void> {
  const sockets = await io.in(roomId).fetchSockets();
  const remaining =
    typeof exceptSocketId === "string"
      ? sockets.filter((s) => s.id !== exceptSocketId)
      : sockets;
  if (remaining.length > 0) return;

  const timer = persistTimers.get(roomId);
  if (timer) {
    clearTimeout(timer);
    persistTimers.delete(roomId);
  }

  if (roomDocs.has(roomId)) {
    await persistRoomDoc(roomId);
    roomDocs.delete(roomId);
  }
  roomHydrated.delete(roomId);
}

export { SHAPES_MAP_NAME };
