const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

const listFacilities = asyncHandler(async (req, res) => {
  const { type, district, search } = req.query;
  const where = {};
  if (type) where.type = type;
  if (district) where.district = { contains: district, mode: "insensitive" };
  if (search) where.name = { contains: search, mode: "insensitive" };

  const facilities = await prisma.facility.findMany({
    where,
    include: { _count: { select: { doctors: true } } },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: facilities });
});

const getFacility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const facility = await prisma.facility.findUnique({
    where: { id },
    include: {
      doctors: { include: { user: { select: { name: true, email: true } } } },
      healthWorkers: { include: { user: { select: { name: true } } } },
      inventories: { include: { medicine: true } },
      diagnostics: true,
      _count: { select: { appointments: true, queueTokens: true, referralsTo: true, referralsFrom: true } },
    },
  });
  if (!facility) throw new AppError("Facility not found.", 404);
  res.json({ success: true, data: facility });
});

const createFacility = asyncHandler(async (req, res) => {
  const { name, type, district, state, latitude, longitude, services } = req.body;
  if (!name || !type || !district) throw new AppError("name, type, district required.", 400);
  const facility = await prisma.facility.create({
    data: {
      name,
      type,
      district,
      state: state || "Maharashtra",
      latitude: latitude || null,
      longitude: longitude || null,
      services: services || [],
      isDemo: true,
    },
  });
  res.status(201).json({ success: true, data: facility });
});

const updateFacility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.role === "FACILITY_ADMIN") {
    const admin = await prisma.facilityAdmin.findUnique({ where: { userId: req.user.id } });
    if (!admin || admin.facilityId !== id) throw new AppError("Cannot modify this facility.", 403);
  }
  const { name, district, state, latitude, longitude, services } = req.body;
  const facility = await prisma.facility.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(district !== undefined ? { district } : {}),
      ...(state !== undefined ? { state } : {}),
      ...(latitude !== undefined ? { latitude } : {}),
      ...(longitude !== undefined ? { longitude } : {}),
      ...(services !== undefined ? { services } : {}),
    },
  });
  res.json({ success: true, data: facility });
});

const getFacilityDoctors = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doctors = await prisma.doctor.findMany({
    where: { facilityId: id },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
  res.json({ success: true, data: doctors });
});

const getFacilityDiagnostics = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const diagnostics = await prisma.diagnosticService.findMany({ where: { facilityId: id } });
  res.json({ success: true, data: diagnostics });
});

module.exports = { listFacilities, getFacility, createFacility, updateFacility, getFacilityDoctors, getFacilityDiagnostics };