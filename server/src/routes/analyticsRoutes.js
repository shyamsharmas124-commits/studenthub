const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getTeacherAnalytics } = require("../controllers/analyticsController");

// All analytics routes require authentication
router.get("/teacher", auth, getTeacherAnalytics);

module.exports = router;
