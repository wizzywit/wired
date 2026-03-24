import { io, type Socket } from 'socket.io-client'
import { API_BASE_URL } from './backend'

let socket: Socket | null = null

export function getSocket() {
  if (!socket) {
    socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}

export function disconnectSocket() {
  if (!socket) return
  socket.disconnect()
  socket = null
}
