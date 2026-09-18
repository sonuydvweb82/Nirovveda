const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

const listRecords = asyncHandler(async (req, res) => {
  const { patientId } = req.query;
  const where = {};
  if (patientId) where.patientId = patientId;
  const records = await prisma.medicalRecord.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json({ success: true, data: records });
});

const createRecord = asyncHandler(async (req, res) => {
  const { patientId, type, title, notes } = req.body;
  if (!patientId || !type || !title) throw new AppError("patientId, type, title required.", 400);
  const record = await prisma.medicalRecord.create({
    data: { patientId, type, title, notes, createdById: req.user.id },
  });
  res.status(201).json({ success: true, data: record });
});

module.exports = { listRecords, createRecord };