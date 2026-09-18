const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

const listHealthWorkers = asyncHandler(async (req, res) => {
  const { facilityId } = req.query;
  const where = {};
  if (facilityId) where.facilityId = facilityId;
  const hw = await prisma.healthWorker.findMany({
    where,
    include: { user: { select: { name: true, email: true, phone: true } }, facility: true },
  });
  res.json({ success: true, data: hw });
});

const getHealthWorkerProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hw = await prisma.healthWorker.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true, phone: true } }, facility: true },
  });
  if (!hw) throw new AppError("Health worker not found.", 404);
  res.json({ success: true, data: hw });
});

module.exports = { listHealthWorkers, getHealthWorkerProfile };