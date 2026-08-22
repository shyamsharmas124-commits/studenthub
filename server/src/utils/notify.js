const prisma = require("./prisma");
const { emitNotification } = require("../realtime/socket");

// Thin wrapper around prisma.notification.create so every place that fires a
// notification also pushes it over the socket, without duplicating that call
// five times across controllers. Return value and DB row shape are identical
// to calling prisma.notification.create directly.
async function notify(data) {
  const notification = await prisma.notification.create({ data });
  emitNotification(data.userId, notification);
  return notification;
}

module.exports = notify;
