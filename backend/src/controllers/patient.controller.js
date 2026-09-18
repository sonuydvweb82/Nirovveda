const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

const listPatients = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const where = {};
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { phone: { contains: search } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { abhaId: { contains: search } },
    ];
  }
  const patients = await prisma.patient.findMany({
    where,
    include: { user: { select: { id: true, name: true, phone: true, email: true } } },
    orderBy: { createdAt: "desc" },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });
  const total = await prisma.patient.count({ where });
  res.json({ success: true, data: patients, total, page: Number(page), limit: Number(limit) });
});

const getPatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.role === "PATIENT") {
    const own = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (!own || own.id !== id) throw new AppError("Cannot access other patient records.", 403);
  }
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, languagePref: true } },
      medicalRecords: { orderBy: { createdAt: "desc" }, take: 20 },
      vitals: { orderBy: { recordedAt: "desc" }, take: 10 },
      prescriptions: { orderBy: { createdAt: "desc" }, take: 10 },
      appointments: { orderBy: { scheduledAt: "desc" }, take: 10 },
      referrals: { orderBy: { createdAt: "desc" }, include: { fromFacility: true, toFacility: true }, take: 10 },
      followUps: { orderBy: { scheduledFor: "desc" }, take: 10 },
      diagnosticTests: { orderBy: { requestedAt: "desc" }, take: 10 },
    },
  });
  if (!patient) throw new AppError("Patient not found.", 404);
  res.json({ success: true, data: patient });
});

const getPatientByPhone = asyncHandler(async (req, res) => {
  const { phone, name } = req.query;
  if (!phone && !name) throw new AppError("Provide phone or name to search.", 400);
  const where = {};
  if (phone) where.user = { phone: { contains: phone } };
  if (name) where.user = { ...(where.user || {}), name: { contains: name, mode: "insensitive" } };
  const patients = await prisma.patient.findMany({
    where,
    include: { user: { select: { id: true, name: true, phone: true, email: true } } },
    take: 10,
  });
  res.json({ success: true, data: patients });
});

const createPatient = asyncHandler(async (req, res, next) => {
  const { name, phone, email, password, ...rest } = req.body;
  if (!name || !phone) throw new AppError("Patient name and phone are required.", 400);

  const hashedPassword = await bcrypt.hash(password || "Nirovveda@" + phone.slice(-4) + "8", 12);

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (existing) throw new AppError("A user with this phone/email already exists.", 409);

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      email: email || `${phone}@nirovveda.patient`,
      password: hashedPassword,
      role: "PATIENT",
    },
  });

  const patient = await prisma.patient.create({
    data: {
      userId: user.id,
      abhaId: rest.abhaId,
      dateOfBirth: rest.dateOfBirth ? new Date(rest.dateOfBirth) : null,
      gender: rest.gender,
      bloodGroup: rest.bloodGroup,
      chronicConditions: rest.chronicConditions || [],
      allergies: rest.allergies || [],
      emergencyContact: rest.emergencyContact,
      village: rest.village,
      district: rest.district,
      state: rest.state || "Maharashtra",
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "REGISTRATION",
      title: "Welcome to Nirovveda",
      message: `Patient ${name} registered successfully. An ABHA-friendly longitudinal record has been created.`,
    },
  });

  res.status(201).json({ success: true, data: patient });
});

const updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.role === "PATIENT") {
    const own = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (!own || own.id !== id) throw new AppError("Cannot modify other patient records.", 403);
  }
  const { name, ...patientFields } = req.body;
  const patient = await prisma.patient.update({
    where: { id },
    data: {
      ...patientFields,
      dateOfBirth: patientFields.dateOfBirth ? new Date(patientFields.dateOfBirth) : undefined,
      chronicConditions: patientFields.chronicConditions ?? undefined,
      allergies: patientFields.allergies ?? undefined,
    },
  });
  if (name) {
    await prisma.user.update({ where: { id: patient.userId }, data: { name } });
  }
  res.json({ success: true, data: patient });
});

const getPatientRecords = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const records = await prisma.medicalRecord.findMany({
    where: { patientId: id },
    orderBy: { createdAt: "desc" },
    include: { patient: { include: { user: { select: { name: true } } } } },
  });
  res.json({ success: true, data: records });
});

const createPatientRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, title, notes } = req.body;
  if (!type || !title) throw new AppError("Record type and title are required.", 400);
  const record = await prisma.medicalRecord.create({
    data: {
      patientId: id,
      type,
      title,
      notes,
      createdById: req.user.id,
    },
  });
  res.status(201).json({ success: true, data: record });
});

const getPatientVitals = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vitals = await prisma.vital.findMany({
    where: { patientId: id },
    orderBy: { recordedAt: "desc" },
    take: 20,
  });
  res.json({ success: true, data: vitals });
});

const createVitals = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    temperature, heartRate, bpSystolic, bpDiastolic,
    oxygenSaturation, respiratoryRate, weightKg, heightCm, symptoms, notes,
  } = req.body;
  const vital = await prisma.vital.create({
    data: {
      patientId: id,
      recordedById: req.user.id,
      temperature: temperature ?? null,
      heartRate: heartRate ?? null,
      bpSystolic: bpSystolic ?? null,
      bpDiastolic: bpDiastolic ?? null,
      oxygenSaturation: oxygenSaturation ?? null,
      respiratoryRate: respiratoryRate ?? null,
      weightKg: weightKg ?? null,
      heightCm: heightCm ?? null,
      symptoms: symptoms || [],
      notes,
    },
  });
  res.status(201).json({ success: true, data: vital });
});

const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const prescriptions = await prisma.prescription.findMany({
    where: { patientId: id },
    orderBy: { createdAt: "desc" },
    include: { doctor: { include: { user: { select: { name: true } } } } },
  });
  res.json({ success: true, data: prescriptions });
});

const getPatientFollowUps = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const followUps = await prisma.followUp.findMany({
    where: { patientId: id },
    orderBy: { scheduledFor: "desc" },
    include: { doctor: { include: { user: { select: { name: true } } } } },
  });
  res.json({ success: true, data: followUps });
});

module.exports = {
  listPatients,
  getPatient,
  getPatientByPhone,
  createPatient,
  updatePatient,
  getPatientRecords,
  createPatientRecord,
  getPatientVitals,
  createVitals,
  getPatientPrescriptions,
  getPatientFollowUps,
};