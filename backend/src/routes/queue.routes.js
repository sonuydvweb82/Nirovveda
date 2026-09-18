const router = require("express").Router();
const {
  createToken,
  listQueue,
  callNext,
  completeToken,
  skipToken,
  getCurrentToken,
  todaySummary,
} = require("../controllers/queue.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/", listQueue);
router.get("/current", getCurrentToken);
router.get("/summary", todaySummary);
router.post("/", createToken);
router.post("/:id/call", callNext);
router.post("/:id/complete", completeToken);
router.post("/:id/skip", skipToken);

module.exports = router;