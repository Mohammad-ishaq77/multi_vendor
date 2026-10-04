import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

let io = null;
const userSockets = new Map(); // userId -> Set(socketId)
const roleSockets = new Map(); // role -> Set(socketId)

/**
 * The client may only *claim* an identity; the room a socket joins comes from the
 * verified access token, never from `handshake.auth`. An unauthenticated socket
 * is refused so it can never receive another user's events.
 */
function identityFromHandshake(socket) {
  const raw = socket.handshake.auth?.token || socket.handshake.headers?.authorization || "";
  const token = String(raw).replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    if (!payload?.sub) return null;
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export function initSocket(httpServer, corsOrigin) {
  io = new Server(httpServer, {
    cors: { origin: corsOrigin, methods: ["GET", "POST"] },
  });

  io.use((socket, next) => {
    const identity = identityFromHandshake(socket);
    if (!identity) return next(new Error("unauthorized"));
    socket.data.userId = identity.userId;
    socket.data.role = identity.role;
    return next();
  });

  io.on("connection", (socket) => {
    const { userId, role } = socket.data;
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);
    if (role) {
      if (!roleSockets.has(role)) roleSockets.set(role, new Set());
      roleSockets.get(role).add(socket.id);
    }
    socket.on("disconnect", () => {
      userSockets.get(userId)?.delete(socket.id);
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
