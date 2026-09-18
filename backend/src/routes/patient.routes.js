const router = require("express").Router();
const {
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
} = require("../controllers/patient.controller");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

router.get("/", authorize("SUPER_ADMIN", "FACILITY_ADMIN", "DOCTOR", "HEALTH_WORKER"), listPatients);
router.get("/search", authorize("SUPER_ADMIN", "FACILITY_ADMIN", "DOCTOR", "HEALTH_WORKER"), getPatientByPhone);
router.get("/:id/records", authorize("PATIENT", "DOCTOR", "HEALTH_WORKER", "FACILITY_ADMIN", "SUPER_ADMIN"), getPatientRecords);
router.post("/:id/records", authorize("DOCTOR", "HEALTH_WORKER", "FACILITY_ADMIN", "SUPER_ADMIN"), createPatientRecord);
router.get("/:id/vitals", authorize("PATIENT", "DOCTOR", "HEALTH_WORKER", "FACILITY_ADMIN", "SUPER_ADMIN"), getPatientVitals);
router.post("/:id/vitals", authorize("HEALTH_WORKER", "DOCTOR", "FACILITY_ADMIN", "SUPER_ADMIN"), createVitals);
router.get("/:id/prescriptions", authorize("PATIENT", "DOCTOR", "HEALTH_WORKER", "FACILITY_ADMIN", "SUPER_ADMIN"), getPatientPrescriptions);
router.get("/:id/follow-ups", authorize("PATIENT", "DOCTOR", "HEALTH_WORKER", "FACILITY_ADMIN", "SUPER_ADMIN"), getPatientFollowUps);
router.get("/:id", authorize("PATIENT", "DOCTOR", "HEALTH_WORKER", "FACILITY_ADMIN", "SUPER_ADMIN"), getPatient);
router.put("/:id", authorize("PATIENT", "SUPER_ADMIN"), updatePatient);
router.post("/", authorize("HEALTH_WORKER", "DOCTOR", "FACILITY_ADMIN", "SUPER_ADMIN"), createPatient);

module.exports = router;