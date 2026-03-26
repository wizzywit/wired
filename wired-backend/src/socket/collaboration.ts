import type { Server as HttpServer } from "node:http";
import type { RequestHandler } from "express";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { documentExists } from "../lib/documents.js";
import { setCollaborationIo } from "./runtime.js";
import {
  applyIncomingClientUpdate,
  encodeDocAsBase64,
  evictRoomIfEmpty,
  loadRoomDoc
} from "../lib/yjsRooms.js";

export function buildCollaborationServer(httpServer: HttpServer, sessionMiddleware: RequestHandler) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_ORIGIN,
      credentials: true
    }
  });

  io.engine.use(sessionMiddleware);
  setCollaborationIo(io);

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
      if (!(await documentExists(roomId))) {
        socket.emit("room:error", { roomId, message: "Document not found." });
        return;
      }
      await socket.join(roomId);

      const doc = await loadRoomDoc(roomId);
      const socketsInRoom = await io.in(roomId).fetchSockets();

      socket.emit("room:joined", {
        roomId,
        usersOnline: socketsInRoom.length
      });

      socket.emit("yjs:sync", {
        roomId,
        update: encodeDocAsBase64(doc)
      });

      socket.to(roomId).emit("room:user-joined", {
        roomId,
        user,
        usersOnline: socketsInRoom.length
      });
    });

    socket.on("room:leave", async ({ roomId }: { roomId: string }) => {
      if (!roomId?.trim()) return;
      await socket.leave(roomId);
      const socketsInRoom = await io.in(roomId).fetchSockets();
      socket.to(roomId).emit("room:user-left", {
        roomId,
        user,
        usersOnline: socketsInRoom.length
      });
      socket.to(roomId).emit("awareness:left", { userId: user.id });
      await evictRoomIfEmpty(io, roomId);
    });

    socket.on("yjs:update", async ({ roomId, update }: { roomId: string; update: string }) => {
      if (!roomId?.trim() || typeof update !== "string") return;
      if (!(await documentExists(roomId))) {
        socket.emit("room:deleted", { roomId });
        void socket.leave(roomId);
        return;
      }
      applyIncomingClientUpdate(roomId, update);
      socket.to(roomId).emit("yjs:update", {
        roomId,
        update,
        from: user.id
      });
    });

    socket.on(
      "awareness:update",
      async (raw: {
        roomId?: string;
        cursor?: { wx: number; wy: number; tool?: string } | null;
        selectedId?: string | null;
        tool?: string;
      }) => {
        const roomId = raw?.roomId?.trim();
        if (!roomId) return;
        if (!(await documentExists(roomId))) {
          socket.emit("room:deleted", { roomId });
          void socket.leave(roomId);
          return;
        }
        const payload: Record<string, unknown> = {
          user,
          at: Date.now()
        };
        if (Object.prototype.hasOwnProperty.call(raw, "cursor")) {
          payload.cursor = raw.cursor;
        }
        if (Object.prototype.hasOwnProperty.call(raw, "selectedId")) {
          payload.selectedId = raw.selectedId;
        }
        if (Object.prototype.hasOwnProperty.call(raw, "tool")) {
          payload.tool = raw.tool;
        }
        socket.to(roomId).emit("awareness:peer", payload);
      }
    );

    socket.on("disconnecting", async () => {
      const rooms = [...socket.rooms].filter((room) => room !== socket.id);
      for (const roomId of rooms) {
        const socketsInRoom = await io.in(roomId).fetchSockets();
        socket.to(roomId).emit("room:user-left", {
          roomId,
          user,
          usersOnline: Math.max(0, socketsInRoom.length - 1)
        });
        socket.to(roomId).emit("awareness:left", { userId: user.id });
        await evictRoomIfEmpty(io, roomId, socket.id);
      }
    });
  });

  return io;
}
