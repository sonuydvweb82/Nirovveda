const router = require("express").Router();
const {
  systemAnalytics,
  facilityAnalytics,
} = require("../controllers/analytics.controller");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);
router.get("/", authorize("SUPER_ADMIN", "FACILITY_ADMIN"), systemAnalytics);
router.get("/facility", authorize("FACILITY_ADMIN", "SUPER_ADMIN"), facilityAnalytics);

module.exports = router;