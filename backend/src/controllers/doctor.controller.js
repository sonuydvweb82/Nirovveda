const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

const listDoctors = asyncHandler(async (req, res) => {
  const { facilityId, specialization } = req.query;
  const where = {};
  if (facilityId) where.facilityId = facilityId;
  if (specialization) where.specialization = { contains: specialization, mode: "insensitive" };
  const doctors = await prisma.doctor.findMany({
    where,
    include: { user: { select: { name: true, email: true, phone: true } }, facility: true },
  });
  res.json({ success: true, data: doctors });
});

const getDoctorProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true, phone: true } }, facility: true },
  });
  if (!doctor) throw new AppError("Doctor not found.", 404);
  res.json({ success: true, data: doctor });
});

module.exports = { listDoctors, getDoctorProfile };