const router = require("express").Router();
const { listRecords, createRecord } = require("../controllers/record.controller");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);
router.get("/", listRecords);
router.post("/", authorize("DOCTOR", "HEALTH_WORKER", "FACILITY_ADMIN", "SUPER_ADMIN"), createRecord);

module.exports = router;