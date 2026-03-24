import type { Server as HttpServer } from "node:http";
import type { RequestHandler } from "express";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import {
  applyIncomingClientUpdate,
  encodeDocAsBase64,
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

    socket.on("yjs:update", ({ roomId, update }: { roomId: string; update: string }) => {
      if (!roomId?.trim() || typeof update !== "string") return;
      applyIncomingClientUpdate(roomId, update);
      socket.to(roomId).emit("yjs:update", {
        roomId,
        update,
        from: user.id
      });
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
