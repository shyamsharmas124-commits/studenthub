const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} = require("../controllers/notificationController");

router.get("/", auth, getMyNotifications);
router.patch("/:id", auth, markAsRead);
router.patch("/read-all", auth, markAllAsRead);

module.exports = router;
