const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

const createFollowUp = asyncHandler(async (req, res) => {
  const { patientId, doctorId, facilityId, scheduledFor, reason } = req.body;
  if (!patientId || !scheduledFor) throw new AppError("patientId and scheduledFor are required.", 400);

  const followUp = await prisma.followUp.create({
    data: {
      patientId,
      doctorId: doctorId || null,
      facilityId: facilityId || null,
      scheduledFor: new Date(scheduledFor),
      reason: reason || "Routine follow-up",
      status: "SCHEDULED",
    },
    include: { patient: { include: { user: { select: { name: true } } } }, doctor: { include: { user: { select: { name: true } } } } },
  });

  const patient = await prisma.patient.findUnique({ where: { id: patientId }, include: { user: true } });
  if (patient) {
    await prisma.notification.create({
      data: {
        userId: patient.userId,
        type: "FOLLOW_UP",
        title: "Follow-up scheduled",
        message: `A follow-up visit is scheduled for ${new Date(scheduledFor).toLocaleDateString()}. Reason: ${reason || "Routine"}.`,
      },
    });
  }
  res.status(201).json({ success: true, data: followUp });
});

const listFollowUps = asyncHandler(async (req, res) => {
  const { status, patientId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (patientId) where.patientId = patientId;

  if (req.user.role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (patient) where.patientId = patient.id;
  }

  const followUps = await prisma.followUp.findMany({
    where,
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
    orderBy: { scheduledFor: "asc" },
  });
  res.json({ success: true, data: followUps });
});

const updateFollowUpStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ["SCHEDULED", "DUE", "COMPLETED", "MISSED", "CANCELLED"];
  if (!valid.includes(status)) throw new AppError("Invalid follow-up status.", 400);

  const followUp = await prisma.followUp.update({
    where: { id },
    data: {
      status,
      ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
    },
  });
  res.json({ success: true, data: followUp });
});

const getOverdueFollowUps = asyncHandler(async (req, res) => {
  const now = new Date();
  const followUps = await prisma.followUp.findMany({
    where: { scheduledFor: { lt: now }, status: { in: ["SCHEDULED", "DUE"] } },
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
    orderBy: { scheduledFor: "asc" },
  });
  res.json({ success: true, data: followUps });
});

module.exports = { createFollowUp, listFollowUps, updateFollowUpStatus, getOverdueFollowUps };