const router = require("express").Router();
const { getDoctorProfile, listDoctors } = require("../controllers/doctor.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);
router.get("/", listDoctors);
router.get("/:id", getDoctorProfile);

module.exports = router;