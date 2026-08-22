const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getTeacherAnalytics, getTeacherLeaderboard } = require("../controllers/analyticsController");

// All analytics routes require authentication
router.get("/teacher", auth, getTeacherAnalytics);

// Public leaderboard — anyone can see top teachers, no login required
router.get("/leaderboard", getTeacherLeaderboard);

module.exports = router;
