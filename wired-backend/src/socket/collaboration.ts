import type { Server as HttpServer } from "node:http";
import type { RequestHandler } from "express";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { redis } from "../lib/redis.js";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type CanvasPatchOp =
  | { type: "add"; shape: JsonValue }
  | { type: "update"; id: string; shape: JsonValue }
  | { type: "remove"; id: string }
  | { type: "replace_all"; shapes: JsonValue[] };

type RoomState = {
  roomId: string;
  snapshot: JsonValue;
  updatedAt: string;
};

const roomStateKey = (roomId: string) => `wired:rooms:${roomId}:state`;

async function getRoomState(roomId: string): Promise<RoomState> {
  const raw = await redis.get(roomStateKey(roomId));
  if (!raw) {
    return {
      roomId,
      snapshot: { objects: [], version: 1 },
      updatedAt: new Date().toISOString()
    };
  }
  return JSON.parse(raw) as RoomState;
}

function getSnapshotObjects(snapshot: JsonValue): JsonValue[] {
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

function applyPatchOps(snapshot: JsonValue, operations: CanvasPatchOp[]): JsonValue {
  const objects = getSnapshotObjects(snapshot);
  let nextObjects = objects;

  for (const op of operations) {
    if (op.type === "replace_all") {
      nextObjects = op.shapes;
      continue;
    }

    if (op.type === "add") {
      const shapeId =
        typeof op.shape === "object" && op.shape !== null && "id" in op.shape
          ? (op.shape as { id?: string }).id
          : undefined;
      if (!shapeId) continue;
      const exists = nextObjects.some((shape) => {
        if (typeof shape !== "object" || shape === null || !("id" in shape)) return false;
        return (shape as { id?: string }).id === shapeId;
      });
      nextObjects = exists
        ? nextObjects.map((shape) => {
            if (typeof shape !== "object" || shape === null || !("id" in shape)) return shape;
            return (shape as { id?: string }).id === shapeId ? op.shape : shape;
          })
        : [...nextObjects, op.shape];
      continue;
    }

    if (op.type === "update") {
      nextObjects = nextObjects.map((shape) => {
        if (typeof shape !== "object" || shape === null || !("id" in shape)) return shape;
        return (shape as { id?: string }).id === op.id ? op.shape : shape;
      });
      continue;
    }

    nextObjects = nextObjects.filter((shape) => {
      if (typeof shape !== "object" || shape === null || !("id" in shape)) return true;
      return (shape as { id?: string }).id !== op.id;
    });
  }

  const nextVersion =
    typeof snapshot === "object" &&
    snapshot !== null &&
    "version" in snapshot &&
    typeof (snapshot as { version?: number }).version === "number"
      ? ((snapshot as { version: number }).version || 1) + 1
      : 2;

  return { objects: nextObjects, version: nextVersion };
}

async function saveRoomState(roomId: string, snapshot: JsonValue): Promise<RoomState> {
  const nextState: RoomState = {
    roomId,
    snapshot,
    updatedAt: new Date().toISOString()
  };

  await redis.set(roomStateKey(roomId), JSON.stringify(nextState), {
    EX: env.ROOM_STATE_TTL_SECONDS
  });

  return nextState;
}

export function buildCollaborationServer(httpServer: HttpServer, sessionMiddleware: RequestHandler) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_ORIGIN,
      credentials: true
    }
  });

  io.engine.use(sessionMiddleware);

  io.on("connection", (socket) => {
    const req = socket.request as typeof socket.request & {
      session?: {
        user?: {
          id: string;
          email: string;
          displayName: string;
        };
      };
    };

    const user = req.session?.user;
    if (!user) {
      socket.emit("auth:error", { message: "Authentication required." });
      socket.disconnect();
      return;
    }

    socket.on("room:join", async ({ roomId }: { roomId: string }) => {
      if (!roomId?.trim()) return;
      await socket.join(roomId);

      const doc = await loadRoomDoc(roomId);
      const socketsInRoom = await io.in(roomId).allSockets();

      socket.emit("room:joined", {
        roomId,
        usersOnline: socketsInRoom.size
      });

      socket.emit("yjs:sync", {
        roomId,
        update: encodeDocAsBase64(doc)
      });

      socket.to(roomId).emit("room:user-joined", {
        roomId,
        user,
        usersOnline: socketsInRoom.size
      });
    });

    socket.on("room:leave", async ({ roomId }: { roomId: string }) => {
      if (!roomId?.trim()) return;
      await socket.leave(roomId);
      const socketsInRoom = await io.in(roomId).allSockets();
      socket.to(roomId).emit("room:user-left", {
        roomId,
        user,
        usersOnline: socketsInRoom.size
      });
    });

    socket.on(
      "canvas:replace",
      async ({ roomId, snapshot }: { roomId: string; snapshot: JsonValue }) => {
        if (!roomId?.trim()) return;
        const state = await saveRoomState(roomId, snapshot);
        socket.to(roomId).emit("canvas:state", {
          roomId,
          state,
          from: user.id
        });
      }
    );

    socket.on(
      "canvas:patch",
      async ({ roomId, operations }: { roomId: string; operations: CanvasPatchOp[] }) => {
        if (!roomId?.trim()) return;
        if (!Array.isArray(operations) || operations.length === 0) return;
        const current = await getRoomState(roomId);
        const nextSnapshot = applyPatchOps(current.snapshot, operations);
        const state = await saveRoomState(roomId, nextSnapshot);
        socket.to(roomId).emit("canvas:patch", {
          roomId,
          operations,
          stateVersion:
            typeof state.snapshot === "object" &&
            state.snapshot !== null &&
            "version" in state.snapshot
              ? (state.snapshot as { version?: number }).version ?? null
              : null,
          from: user.id
        });
      }
    );

    socket.on("canvas:request-state", async ({ roomId }: { roomId: string }) => {
      if (!roomId?.trim()) return;
      const state = await getRoomState(roomId);
      socket.emit("canvas:state", { roomId, state, from: "server" });
    });

    socket.on(
      "cursor:update",
      ({ roomId, cursor }: { roomId: string; cursor: { x: number; y: number; tool?: string } }) => {
        if (!roomId?.trim()) return;
        socket.to(roomId).emit("cursor:update", {
          roomId,
          user,
          cursor
        });
      }
    );

    socket.on("disconnecting", async () => {
      const rooms = [...socket.rooms].filter((room) => room !== socket.id);
      for (const roomId of rooms) {
        const socketsInRoom = await io.in(roomId).allSockets();
        socket.to(roomId).emit("room:user-left", {
          roomId,
          user,
          usersOnline: Math.max(0, socketsInRoom.size - 1)
        });
      }
    });
  });

  return io;
}
