const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { signToken } = require("../middleware/auth");
const { AppError, asyncHandler } = require("../middleware/error");

const VALID_ROLES = ["PATIENT", "HEALTH_WORKER", "DOCTOR"];

const register = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, role, languagePref } = req.body;

  if (!name || !email || !phone || !password) {
    throw new AppError("Name, email, phone and password are required.", 400);
  }
  if (role && !VALID_ROLES.includes(role)) {
    throw new AppError("Invalid role. Allowed: PATIENT, HEALTH_WORKER, DOCTOR.", 400);
  }
  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long.", 400);
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (existing) {
    throw new AppError("An account with this email or phone already exists.", 409);
  }

  const hashed = await bcrypt.hash(password, 12);
  const userRole = role || "PATIENT";

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashed,
      role: userRole,
      languagePref: languagePref || "en",
    },
  });

  // Create role-specific profile
  if (userRole === "PATIENT") {
    await prisma.patient.create({
      data: {
        userId: user.id,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
        village: req.body.village,
        district: req.body.district,
        state: req.body.state || "Maharashtra",
        bloodGroup: req.body.bloodGroup,
      },
    });
  } else if (userRole === "DOCTOR") {
    await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: req.body.specialization || "General Physician",
        registrationNo: req.body.registrationNo,
      },
    });
  } else if (userRole === "HEALTH_WORKER") {
    await prisma.healthWorker.create({
      data: {
        userId: user.id,
        designation: req.body.designation || "ASHA",
        areaCovered: req.body.areaCovered,
      },
    });
  }

  const token = signToken(user);
  const profile = await getProfile(user);
  res.status(201).json({
    success: true,
    message: "Registration successful.",
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, languagePref: user.languagePref, profile },
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid credentials.", 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError("Invalid credentials.", 401);

  const token = signToken(user);
  const profile = await getProfile(user);
  res.json({
    success: true,
    message: "Login successful.",
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, languagePref: user.languagePref, profile },
  });
});

const me = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const profile = await getProfile(user);

  res.json({ success: true, user: { ...omitPassword(user), profile } });
});

const omitPassword = (user) => {
  const { password, ...rest } = user;
  return rest;
};

const getProfile = async (user) => {
  if (user.role === "PATIENT") {
    return prisma.patient.findUnique({ where: { userId: user.id } });
  } else if (user.role === "DOCTOR") {
    return prisma.doctor.findUnique({ where: { userId: user.id }, include: { facility: true } });
  } else if (user.role === "HEALTH_WORKER") {
    return prisma.healthWorker.findUnique({ where: { userId: user.id }, include: { facility: true } });
  } else if (user.role === "FACILITY_ADMIN") {
    return prisma.facilityAdmin.findUnique({ where: { userId: user.id }, include: { facility: true } });
  }
  return null;
};

module.exports = { register, login, me };