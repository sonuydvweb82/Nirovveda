const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

const listMedicines = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const where = search ? { name: { contains: search, mode: "insensitive" } } : {};
  const medicines = await prisma.medicine.findMany({
    where,
    orderBy: { name: "asc" },
    take: 100,
  });
  res.json({ success: true, data: medicines });
});

const searchMedicineAvailability = asyncHandler(async (req, res) => {
  const { medicine, facilityId, district } = req.query;
  const medWhere = {};
  const facWhere = {};

  if (medicine) medWhere.name = { contains: medicine, mode: "insensitive" };
  if (facilityId) facWhere.id = facilityId;
  if (district) facWhere.district = { contains: district, mode: "insensitive" };

  const inventories = await prisma.medicineInventory.findMany({
    where: {
      medicine: medWhere,
      facility: facWhere,
    },
    include: {
      medicine: true,
      facility: true,
    },
    orderBy: [{ facility: { district: "asc" } }],
  });

  // Deduplicate by medicine+facility
  const map = new Map();
  for (const inv of inventories) {
    const key = inv.medicineId + "|" + inv.facilityId;
    if (!map.has(key)) map.set(key, inv);
  }

  res.json({ success: true, data: Array.from(map.values()) });
});

const listInventory = asyncHandler(async (req, res) => {
  const { facilityId } = req.query;
  const where = {};
  if (facilityId) where.facilityId = facilityId;
  if (!facilityId && req.user.role === "FACILITY_ADMIN") {
    const admin = await prisma.facilityAdmin.findUnique({ where: { userId: req.user.id } });
    if (admin?.facilityId) where.facilityId = admin.facilityId;
  }
  const inventory = await prisma.medicineInventory.findMany({
    where,
    include: { medicine: true, facility: true },
    orderBy: [{ quantity: "asc" }],
  });
  res.json({ success: true, data: inventory });
});

const getLowStock = asyncHandler(async (req, res) => {
  const { facilityId } = req.query;
  const where = {};
  if (facilityId) where.facilityId = facilityId;
  if (!facilityId && req.user.role === "FACILITY_ADMIN") {
    const admin = await prisma.facilityAdmin.findUnique({ where: { userId: req.user.id } });
    if (admin?.facilityId) where.facilityId = admin.facilityId;
  }
  const all = await prisma.medicineInventory.findMany({
    where,
    include: { medicine: true, facility: true },
  });
  const result = all.filter((i) => i.quantity <= i.lowStockThreshold);
  res.json({ success: true, data: result });
});

const addInventory = asyncHandler(async (req, res) => {
  const { medicineId, facilityId, quantity, lowStockThreshold } = req.body;
  if (!medicineId || !facilityId) throw new AppError("medicineId and facilityId are required.", 400);

  const inventory = await prisma.medicineInventory.upsert({
    where: { medicineId_facilityId: { medicineId, facilityId } },
    update: { quantity: Number(quantity) || 0 },
    create: {
      medicineId,
      facilityId,
      quantity: Number(quantity) || 0,
      lowStockThreshold: lowStockThreshold || 20,
    },
  });
  res.status(201).json({ success: true, data: inventory });
});

const updateInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity, lowStockThreshold } = req.body;
  const inventory = await prisma.medicineInventory.update({
    where: { id },
    data: {
      ...(quantity !== undefined ? { quantity: Number(quantity) } : {}),
      ...(lowStockThreshold !== undefined ? { lowStockThreshold: Number(lowStockThreshold) } : {}),
    },
    include: { medicine: true, facility: true },
  });

  if (inventory.quantity <= inventory.lowStockThreshold) {
    const admins = await prisma.facilityAdmin.findMany({ where: { facilityId: inventory.facilityId } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.userId,
          type: "LOW_STOCK",
          title: "Low medicine stock",
          message: `${inventory.medicine.name} is low at ${inventory.facility.name}. Current stock: ${inventory.quantity}.`,
        },
      });
    }
  }

  res.json({ success: true, data: inventory });
});

module.exports = { listMedicines, searchMedicineAvailability, updateInventory, listInventory, getLowStock, addInventory };