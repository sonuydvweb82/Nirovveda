const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

const getSlots = asyncHandler(async (req, res) => {
  const { facilityId, doctorId, date } = req.query;
  if (!facilityId || !date) throw new AppError("facilityId and date are required.", 400);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await prisma.appointment.findMany({
    where: {
      facilityId,
      ...(doctorId ? { doctorId } : {}),
      scheduledAt: { gte: startOfDay, lte: endOfDay },
      status: { notIn: ["CANCELLED"] },
    },
    select: { scheduledAt: true, doctorId: true },
  });

  const booked = new Set(existing.map((a) => a.scheduledAt.toISOString()));

  const slots = [];
  const startHour = 9;
  const endHour = 17;
  for (let h = startHour; h < endHour; h++) {
    for (const m of [0, 30]) {
      const t = new Date(date);
      t.setHours(h, m, 0, 0);
      if (t > new Date()) {
        slots.push({ time: t.toISOString(), booked: booked.has(t.toISOString()) });
      }
    }
  }
  res.json({ success: true, data: slots });
});

const createAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, facilityId, scheduledAt, reason, consultationType, bookedById } = req.body;
  if (!patientId || !facilityId || !scheduledAt) {
    throw new AppError("patientId, facilityId and scheduledAt are required.", 400);
  }

  const when = new Date(scheduledAt);
  if (isNaN(when)) throw new AppError("Invalid scheduledAt date.", 400);

  // Prevent double-booking of the same doctor at the same time
  if (doctorId) {
    const clash = await prisma.appointment.findFirst({
      where: {
        doctorId,
        scheduledAt: when,
        status: { notIn: ["CANCELLED"] },
      },
    });
    if (clash) throw new AppError("This doctor is already booked for that slot.", 409);
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      doctorId: doctorId || null,
      facilityId,
      bookedById: bookedById || req.user.id,
      consultationType: consultationType || "IN_PERSON",
      status: "CONFIRMED",
      scheduledAt: when,
      reason,
    },
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
      doctor: { include: { user: { select: { name: true, specialization: true } } } },
      facility: true,
    },
  });

  // Notify patient & doctor
  const patientUser = await prisma.patient.findUnique({ where: { id: patientId }, include: { user: true } });
  if (patientUser) {
    await prisma.notification.create({
      data: {
        userId: patientUser.userId,
        type: "APPOINTMENT",
        title: "Appointment confirmed",
        message: `Your appointment is confirmed for ${when.toLocaleString()} at the facility.`,
      },
    });
  }

  res.status(201).json({ success: true, data: appointment, message: "Appointment booked successfully." });
});

const listAppointments = asyncHandler(async (req, res) => {
  const { role, userId } = req.user;
  const { status, date, doctorId, facilityId, patientId } = req.query;
  const where = {};

  if (status) where.status = status;
  if (doctorId) where.doctorId = doctorId;
  if (facilityId) where.facilityId = facilityId;
  if (patientId) where.patientId = patientId;

  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new AppError("No patient profile.", 404);
    where.patientId = patient.id;
  } else if (role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new AppError("No doctor profile.", 404);
    where.doctorId = doctor.id;
  } else if (role === "HEALTH_WORKER") {
    const hw = await prisma.healthWorker.findUnique({ where: { userId } });
    if (hw?.facilityId) where.facilityId = hw.facilityId;
  } else if (role === "FACILITY_ADMIN") {
    const admin = await prisma.facilityAdmin.findUnique({ where: { userId } });
    if (admin?.facilityId) where.facilityId = admin.facilityId;
  }

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.scheduledAt = { gte: start, lte: end };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
      facility: { select: { id: true, name: true, type: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
  res.json({ success: true, data: appointments });
});

const getAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
      facility: true,
    },
  });
  if (!appointment) throw new AppError("Appointment not found.", 404);
  res.json({ success: true, data: appointment });
});

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "RESCHEDULED"];
  if (!valid.includes(status)) throw new AppError("Invalid status.", 400);

  const appointment = await prisma.appointment.update({ where: { id }, data: { status } });
  res.json({ success: true, data: appointment });
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: { patient: true },
  });
  res.json({ success: true, data: appointment, message: "Appointment cancelled." });
});

module.exports = { createAppointment, listAppointments, getAppointment, updateAppointmentStatus, cancelAppointment, getSlots };