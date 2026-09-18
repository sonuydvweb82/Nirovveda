const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error("API Error:", err);

  // Prisma known errors
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      error: "A record with this value already exists.",
      meta: { target: err.meta?.target },
    });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ success: false, error: "Record not found." });
  }
  if (err.name === "PrismaClientValidationError") {
    return res.status(400).json({ success: false, error: "Invalid data provided." });
  }

  return res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error.",
  });
};

class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { notFound, errorHandler, AppError, asyncHandler };