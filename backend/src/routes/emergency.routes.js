const router = require("express").Router();
const {
  raiseEmergency,
  listEmergencies,
  getEmergency,
  updateEmergencyStatus,
  nearbyFacilities,
} = require("../controllers/emergency.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/", listEmergencies);
router.get("/nearby", nearbyFacilities);
router.post("/", raiseEmergency);
router.get("/:id", getEmergency);
router.patch("/:id/status", updateEmergencyStatus);

module.exports = router;