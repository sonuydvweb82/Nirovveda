const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

const createReferral = asyncHandler(async (req, res) => {
  const { patientId, fromFacilityId, toFacilityId, doctorId, reason, notes, priority } = req.body;
  if (!patientId || !fromFacilityId || !reason) {
    throw new AppError("patientId, fromFacilityId and reason are required.", 400);
  }

  const referral = await prisma.referral.create({
    data: {
      patientId,
      fromFacilityId,
      toFacilityId: toFacilityId || null,
      doctorId: doctorId || null,
      reason,
      notes,
      priority: priority || "MODERATE",
      status: "CREATED",
    },
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
      fromFacility: true,
      toFacility: true,
      doctor: { include: { user: { select: { name: true } } } },
    },
  });

  // Notify the receiving facility admin
  if (toFacilityId) {
    const admin = await prisma.facilityAdmin.findUnique({ where: { facilityId: toFacilityId } });
    if (admin) {
      await prisma.notification.create({
        data: {
          userId: admin.userId,
          type: "REFERRAL",
          title: "New referral received",
          message: `A referral has been sent to your facility. Please review and accept.`,
        },
      });
    }
  }

  res.status(201).json({ success: true, data: referral, message: "Referral created successfully." });
});

const listReferrals = asyncHandler(async (req, res) => {
  const { status, patientId, fromFacilityId, toFacilityId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (patientId) where.patientId = patientId;
  if (fromFacilityId) where.fromFacilityId = fromFacilityId;
  if (toFacilityId) where.toFacilityId = toFacilityId;

  // role scoping
  if (req.user.role === "HEALTH_WORKER") {
    const hw = await prisma.healthWorker.findUnique({ where: { userId: req.user.id } });
    if (!where.fromFacilityId && hw?.facilityId) where.fromFacilityId = hw.facilityId;
  } else if (req.user.role === "DOCTOR") {
    const doc = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!where.fromFacilityId && doc?.facilityId) where.fromFacilityId = doc.facilityId;
  } else if (req.user.role === "FACILITY_ADMIN") {
    const admin = await prisma.facilityAdmin.findUnique({ where: { userId: req.user.id } });
    if (!where.fromFacilityId && !where.toFacilityId && admin?.facilityId) {
      where.OR = [{ fromFacilityId: admin.facilityId }, { toFacilityId: admin.facilityId }];
      delete where.fromFacilityId;
    }
  } else if (req.user.role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (patient) where.patientId = patient.id;
  }

  const referrals = await prisma.referral.findMany({
    where,
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
      fromFacility: true,
      toFacility: true,
      doctor: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: referrals });
});

const getReferral = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const referral = await prisma.referral.findUnique({
    where: { id },
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
      fromFacility: true,
      toFacility: true,
      doctor: { include: { user: { select: { name: true } } } },
    },
  });
  if (!referral) throw new AppError("Referral not found.", 404);
  res.json({ success: true, data: referral });
});

const updateReferralStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const valid = ["CREATED", "ACCEPTED", "REJECTED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
  if (!valid.includes(status)) throw new AppError("Invalid referral status.", 400);

  const referral = await prisma.referral.update({
    where: { id },
    data: { status, ...(notes ? { notes } : {}) },
    include: { patient: { include: { user: true } } },
  });

  const patient = referral.patient;
  if (patient) {
    await prisma.notification.create({
      data: {
        userId: patient.userId,
        type: "REFERRAL",
        title: "Referral update",
        message: `Your referral status changed to ${status}.`,
      },
    });
  }
  res.json({ success: true, data: referral, message: "Referral status updated." });
});

const acceptReferral = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const referral = await prisma.referral.update({
    where: { id },
    data: { status: "ACCEPTED" },
    include: { patient: { include: { user: true } } },
  });

  const patient = referral.patient;
  if (patient) {
    await prisma.notification.create({
      data: {
        userId: patient.userId,
        type: "REFERRAL",
        title: "Referral accepted",
        message: "Your referral has been accepted by the receiving facility. Please plan your visit.",
      },
    });
  }
  res.json({ success: true, data: referral, message: "Referral accepted." });
});

module.exports = { createReferral, listReferrals, getReferral, updateReferralStatus, acceptReferral };