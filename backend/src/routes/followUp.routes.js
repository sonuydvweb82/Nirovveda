const router = require("express").Router();
const {
  createFollowUp,
  listFollowUps,
  updateFollowUpStatus,
  getOverdueFollowUps,
} = require("../controllers/followUp.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/", listFollowUps);
router.get("/overdue", getOverdueFollowUps);
router.post("/", createFollowUp);
router.patch("/:id/status", updateFollowUpStatus);

module.exports = router;