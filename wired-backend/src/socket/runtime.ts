import type { Server } from "socket.io";

let collaborationIo: Server | null = null;

export function setCollaborationIo(io: Server): void {
  collaborationIo = io;
}

export function getCollaborationIo(): Server | null {
  return collaborationIo;
}
