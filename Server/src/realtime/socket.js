import { Server } from "socket.io";

let io = null;
const userSockets = new Map(); // userId -> Set(socketId)
const roleSockets = new Map(); // role -> Set(socketId)

export function initSocket(httpServer, corsOrigin) {
  io = new Server(httpServer, {
    cors: { origin: corsOrigin, methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    const { userId, role } = socket.handshake.auth || {};
    if (userId) {
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId).add(socket.id);
    }
    if (role) {
      if (!roleSockets.has(role)) roleSockets.set(role, new Set());
      roleSockets.get(role).add(socket.id);
    }
    socket.on("disconnect", () => {
      if (userId) userSockets.get(userId)?.delete(socket.id);
      if (role) roleSockets.get(role)?.delete(socket.id);
    });
  });

  return io;
}

export function emitToUser(userId, event, payload) {
  try {
    for (const sid of userSockets.get(userId) || []) io?.to(sid).emit(event, payload);
  } catch { /* socket not initialized */ }
}

export function emitToRole(role, event, payload) {
  try {
    for (const sid of roleSockets.get(role) || []) io?.to(sid).emit(event, payload);
  } catch { /* socket not initialized */ }
}
