// Real-time layer, additive to the existing REST notification endpoints.
// Nothing here replaces GET/PATCH /api/notification — clients that never
// connect a socket keep working exactly as before, just without the
// instant push. Requires the optional "socket.io" dependency (see
// server/package.json) — if it's not installed, initSocket no-ops safely
// so the server still boots.

let io = null;

function initSocket(httpServer) {
  let Server;
  try {
    ({ Server } = require("socket.io"));
  } catch (err) {
    console.warn("socket.io not installed — real-time notifications disabled. Run `npm install` to enable.");
    return null;
  }

  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || "*" },
  });

  io.on("connection", (socket) => {
    // Client sends its userId right after connecting (see client/src/hooks/useRealtimeNotifications.js)
    socket.on("identify", (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => {});
  });

  console.log("Socket.io real-time layer ready");
  return io;
}

// Called from controllers after a notification is created in the DB (see
// utils/notify.js). Safe to call even if sockets aren't initialized.
function emitNotification(userId, notification) {
  if (!io) return;
  io.to(`user:${userId}`).emit("notification:new", notification);
}

module.exports = { initSocket, emitNotification };
