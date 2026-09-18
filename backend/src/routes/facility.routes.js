const router = require("express").Router();
const {
  listFacilities,
  getFacility,
  createFacility,
  updateFacility,
  getFacilityDoctors,
  getFacilityDiagnostics,
} = require("../controllers/facility.controller");
const { authenticate, authorize, optionalAuth } = require("../middleware/auth");

// Public facility list for map (optional auth)
router.get("/", optionalAuth, listFacilities);
router.get("/:id", optionalAuth, getFacility);
router.get("/:id/doctors", authenticate, getFacilityDoctors);
router.get("/:id/diagnostics", authenticate, getFacilityDiagnostics);
router.post("/", authenticate, authorize("SUPER_ADMIN"), createFacility);
router.put("/:id", authenticate, authorize("SUPER_ADMIN", "FACILITY_ADMIN"), updateFacility);

module.exports = router;