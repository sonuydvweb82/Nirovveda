const router = require("express").Router();
const {
  createReferral,
  listReferrals,
  getReferral,
  updateReferralStatus,
  acceptReferral,
} = require("../controllers/referral.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/", listReferrals);
router.post("/", createReferral);
router.get("/:id", getReferral);
router.patch("/:id/status", updateReferralStatus);
router.post("/:id/accept", acceptReferral);

module.exports = router;