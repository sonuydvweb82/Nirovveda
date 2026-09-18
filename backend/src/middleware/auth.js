const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("./error");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) throw new AppError("Authentication required.", 401);

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    throw new AppError("Invalid or expired token.", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) throw new AppError("User no longer exists.", 401);

  req.user = user;
  req.token = token;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: "You do not have permission to perform this action.",
    });
  }
  next();
};

const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (user) req.user = user;
  } catch (e) {
    // ignore invalid optional token
  }
  next();
});

module.exports = { signToken, authenticate, authorize, optionalAuth };