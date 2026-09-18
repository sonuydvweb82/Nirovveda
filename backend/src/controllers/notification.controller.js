const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = await prisma.notification.count({
    where: { userId: req.user.id, read: false },
  });
  res.json({ success: true, data: notifications, unread });
});

const createNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, message, link } = req.body;
  if (!userId || !title || !message) throw new AppError("userId, title, message required.", 400);
  const notification = await prisma.notification.create({
    data: { userId, type: type || "SYSTEM", title, message, link },
  });
  res.status(201).json({ success: true, data: notification });
});

const markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await prisma.notification.updateMany({
    where: { id, userId: req.user.id },
    data: { read: true },
  });
  res.json({ success: true, data: notification });
});

const markAllRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true },
  });
  res.json({ success: true, message: "All notifications marked as read." });
});

module.exports = { listNotifications, markRead, markAllRead, createNotification };