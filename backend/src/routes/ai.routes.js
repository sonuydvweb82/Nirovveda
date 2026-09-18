const router = require("express").Router();
const {
  triage,
  patientSummary,
  followUpRisk,
} = require("../controllers/ai.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.post("/triage", triage);
router.post("/patient-summary", patientSummary);
router.post("/follow-up-risk", followUpRisk);

module.exports = router;