const router = require("express").Router();
const {
  createAppointment,
  listAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getSlots,
} = require("../controllers/appointment.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/", listAppointments);
router.get("/slots", getSlots);
router.post("/", createAppointment);
router.get("/:id", getAppointment);
router.patch("/:id/status", updateAppointmentStatus);
router.patch("/:id/cancel", cancelAppointment);

module.exports = router;