const router = require("express").Router();
const {
  requestTest,
  listTests,
  getTest,
  updateTestStatus,
  listDiagnosticServices,
} = require("../controllers/diagnostic.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/", listTests);
router.get("/services", listDiagnosticServices);
router.post("/", requestTest);
router.get("/:id", getTest);
router.patch("/:id/status", updateTestStatus);

module.exports = router;