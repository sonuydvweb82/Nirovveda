const router = require("express").Router();
const { listHealthWorkers, getHealthWorkerProfile } = require("../controllers/healthWorker.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);
router.get("/", listHealthWorkers);
router.get("/:id", getHealthWorkerProfile);

module.exports = router;