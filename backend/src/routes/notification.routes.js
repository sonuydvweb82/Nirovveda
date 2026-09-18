const router = require("express").Router();
const {
  listNotifications,
  markRead,
  markAllRead,
  createNotification,
} = require("../controllers/notification.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/", listNotifications);
router.post("/", createNotification);
router.post("/:id/read", markRead);
router.post("/read-all", markAllRead);

module.exports = router;