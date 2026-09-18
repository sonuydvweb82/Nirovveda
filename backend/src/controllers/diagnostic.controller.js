const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

const requestTest = asyncHandler(async (req, res) => {
  const { patientId, doctorId, facilityId, testType, labNotes } = req.body;
  if (!patientId || !testType) throw new AppError("patientId and testType are required.", 400);

  const test = await prisma.diagnosticTest.create({
    data: {
      patientId,
      doctorId: doctorId || null,
      facilityId: facilityId || null,
      testType,
      labNotes,
      status: "REQUESTED",
    },
    include: { patient: { include: { user: { select: { name: true } } } } },
  });

  const patient = await prisma.patient.findUnique({ where: { id: patientId }, include: { user: true } });
  if (patient) {
    await prisma.notification.create({
      data: {
        userId: patient.userId,
        type: "DIAGNOSTIC",
        title: "Diagnostic test requested",
        message: `A ${testType} test has been requested. A lab will schedule the sample collection.`,
      },
    });
  }
  res.status(201).json({ success: true, data: test, message: "Diagnostic test requested." });
});

const listTests = asyncHandler(async (req, res) => {
  const { status, patientId, facilityId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (patientId) where.patientId = patientId;
  if (facilityId) where.facilityId = facilityId;

  if (req.user.role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (patient) where.patientId = patient.id;
  }

  const tests = await prisma.diagnosticTest.findMany({
    where,
    include: {
      patient: { include: { user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
      facility: true,
    },
    orderBy: { requestedAt: "desc" },
  });
  res.json({ success: true, data: tests });
});

const getTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const test = await prisma.diagnosticTest.findUnique({ where: { id }, include: { patient: true, doctor: true, facility: true } });
  if (!test) throw new AppError("Diagnostic test not found.", 404);
  res.json({ success: true, data: test });
});

const updateTestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reportSummary } = req.body;
  const valid = ["REQUESTED", "SCHEDULED", "SAMPLE_COLLECTED", "REPORT_READY", "COMPLETED", "CANCELLED"];
  if (!valid.includes(status)) throw new AppError("Invalid test status.", 400);

  const test = await prisma.diagnosticTest.update({
    where: { id },
    data: { status, ...(reportSummary ? { reportSummary } : {}) },
    include: { patient: { include: { user: true } } },
  });

  if (test.patient) {
    await prisma.notification.create({
      data: {
        userId: test.patient.userId,
        type: "DIAGNOSTIC",
        title: "Diagnostic update",
        message: `Your ${test.testType} test status: ${status}.`,
      },
    });
  }
  res.json({ success: true, data: test, message: "Diagnostic status updated." });
});

const listDiagnosticServices = asyncHandler(async (req, res) => {
  const { facilityId } = req.query;
  const where = facilityId ? { facilityId } : {};
  const services = await prisma.diagnosticService.findMany({
    where,
    include: { facility: true },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: services });
});

module.exports = { requestTest, listTests, getTest, updateTestStatus, listDiagnosticServices };