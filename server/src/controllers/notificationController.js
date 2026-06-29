const prisma = require("../utils/prisma");

// Get user's notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json(notifications);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.notification.findFirst({
      where: { id, userId: req.user.userId }
    });

    if (!existing) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    res.json(notification);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.userId, read: false },
      data: { read: true }
    });

    res.json({ msg: "All notifications marked as read" });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Helper function to create notification
exports.createNotification = async (userId, message, type) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        message,
        type
      }
    });
  } catch (err) {
    console.log("NOTIFICATION ERROR:", err);
  }
};
