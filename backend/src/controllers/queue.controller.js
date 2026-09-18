const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

const createToken = asyncHandler(async (req, res) => {
  const { patientId, facilityId, doctorId, priority, appointmentId } = req.body;
  if (!patientId || !facilityId) throw new AppError("patientId and facilityId are required.", 400);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const maxToken = await prisma.queueToken.aggregate({
    where: { facilityId, createdAt: { gte: startOfDay, lte: endOfDay } },
    _max: { tokenNumber: true },
  });

  const tokenNumber = (maxToken._max.tokenNumber || 0) + 1;
  const token = await prisma.queueToken.create({
    data: {
      tokenNumber,
      patientId,
      appointmentId,
      facilityId,
      doctorId: doctorId || null,
      priority: priority || "LOW",
      status: "WAITING",
      createdAt: new Date(),
    },
    include: { patient: { include: { user: { select: { name: true, phone: true } } } } },
  });

  const patient = await prisma.patient.findUnique({ where: { id: patientId }, include: { user: true } });
  if (patient) {
    await prisma.notification.create({
      data: {
        userId: patient.userId,
        type: "QUEUE",
        title: "Token generated",
        message: `Your token number is ${tokenNumber}. Please watch the queue display.`,
      },
    });
  }

  res.status(201).json({ success: true, data: token });
});

const listQueue = asyncHandler(async (req, res) => {
  const { facilityId, doctorId, status } = req.query;
  const where = {};
  if (facilityId) where.facilityId = facilityId;
  if (doctorId) where.doctorId = doctorId;
  if (status) where.status = status;

  // role-based default facility
  if (!where.facilityId && req.user.role === "HEALTH_WORKER") {
    const hw = await prisma.healthWorker.findUnique({ where: { userId: req.user.id } });
    if (hw?.facilityId) where.facilityId = hw.facilityId;
  }
  if (!where.facilityId && req.user.role === "DOCTOR") {
    const doc = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (doc?.facilityId) where.facilityId = doc.facilityId;
  }
  if (!where.facilityId && req.user.role === "FACILITY_ADMIN") {
    const admin = await prisma.facilityAdmin.findUnique({ where: { userId: req.user.id } });
    if (admin?.facilityId) where.facilityId = admin.facilityId;
  }

  const queue = await prisma.queueToken.findMany({
    where,
    include: { patient: { include: { user: { select: { name: true, phone: true } } } } },
    orderBy: [{ status: "asc" }, { tokenNumber: "asc" }],
  });
  res.json({ success: true, data: queue });
});

const getCurrentToken = asyncHandler(async (req, res) => {
  const { facilityId } = req.query;
  if (!facilityId) throw new AppError("facilityId is required.", 400);
  const current = await prisma.queueToken.findFirst({
    where: { facilityId, status: "IN_PROGRESS" },
    include: { patient: { include: { user: { select: { name: true } } } } },
  });
  res.json({ success: true, data: current });
});

const callNext = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Cancel any in-progress
  const token = await prisma.queueToken.findUnique({ where: { id } });
  if (!token) throw new AppError("Token not found.", 404);

  await prisma.$transaction([
    prisma.queueToken.updateMany({ where: { facilityId: token.facilityId, status: "IN_PROGRESS" }, data: { status: "COMPLETED" } }),
    prisma.queueToken.update({ where: { id }, data: { status: "IN_PROGRESS" } }),
  ]);

  res.json({ success: true, message: "Token called to consultation." });
});

const completeToken = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const token = await prisma.queueToken.update({ where: { id }, data: { status: "COMPLETED" } });
  res.json({ success: true, data: token });
});

const skipToken = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const token = await prisma.queueToken.update({ where: { id }, data: { status: "SKIPPED" } });
  res.json({ success: true, data: token });
});

const todaySummary = asyncHandler(async (req, res) => {
  const { facilityId } = req.query;
  const where = facilityId ? { facilityId } : {};

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  where.createdAt = { gte: start, lte: end };

  const tokens = await prisma.queueToken.findMany({ where });
  res.json({
    success: true,
    data: {
      total: tokens.length,
      waiting: tokens.filter((t) => t.status === "WAITING").length,
      inProgress: tokens.filter((t) => t.status === "IN_PROGRESS").length,
      completed: tokens.filter((t) => t.status === "COMPLETED").length,
      skipped: tokens.filter((t) => t.status === "SKIPPED").length,
    },
  });
});

module.exports = { createToken, listQueue, callNext, completeToken, skipToken, getCurrentToken, todaySummary };