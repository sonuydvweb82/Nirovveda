const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

const raiseEmergency = asyncHandler(async (req, res) => {
  const { patientId, alertLevel, location, description } = req.body;
  if (!patientId || !alertLevel) throw new AppError("patientId and alertLevel are required.", 400);

  const alert = await prisma.emergencyAlert.create({
    data: {
      patientId,
      raisedById: req.user.id,
      alertLevel,
      location,
      description,
      status: "ACTIVE",
    },
    include: { patient: { include: { user: { select: { name: true, phone: true } } } } },
  });

  // Notify all FACILITY_ADMIN and SUPER_ADMIN users
  const admins = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "FACILITY_ADMIN"] } },
    select: { id: true },
  });
  for (const a of admins) {
    await prisma.notification.create({
      data: {
        userId: a.id,
        type: "EMERGENCY",
        title: "Emergency escalation",
        message: `Emergency (${alertLevel}) raised for patient. Coordinate nearest facility immediately.`,
      },
    });
  }

  res.status(201).json({ success: true, data: alert, message: "Emergency alert raised." });
});

const listEmergencies = asyncHandler(async (req, res) => {
  const { status, alertLevel } = req.query;
  const where = {};
  if (status) where.status = status;
  if (alertLevel) where.alertLevel = alertLevel;

  const alerts = await prisma.emergencyAlert.findMany({
    where,
    include: { patient: { include: { user: { select: { name: true, phone: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ success: true, data: alerts });
});

const getEmergency = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const alert = await prisma.emergencyAlert.findUnique({
    where: { id },
    include: { patient: { include: { user: { select: { name: true, phone: true } } } } },
  });
  if (!alert) throw new AppError("Emergency alert not found.", 404);
  res.json({ success: true, data: alert });
});

const updateEmergencyStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ["ACTIVE", "ATTENDED", "RESOLVED", "CLOSED"];
  if (!valid.includes(status)) throw new AppError("Invalid emergency status.", 400);
  const alert = await prisma.emergencyAlert.update({ where: { id }, data: { status } });
  res.json({ success: true, data: alert });
});

const nearbyFacilities = asyncHandler(async (req, res) => {
  // Returns facilities that can handle emergencies (Emergency service)
  const facilities = await prisma.facility.findMany({
    where: { services: { has: "Emergency" } },
    include: {
      _count: { select: { doctors: true } },
    },
  });
  res.json({
    success: true,
    data: facilities,
    message: "Demo data — nearest-facility routing uses this list in the prototype.",
  });
});

module.exports = { raiseEmergency, listEmergencies, getEmergency, updateEmergencyStatus, nearbyFacilities };