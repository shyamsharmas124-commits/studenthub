const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  getAllProgress,
  getCourseProgress,
  updateProgress,
  incrementProgress,
  getLearningStreak,
  completeLesson,
} = require("../controllers/progressController");

router.get("/streak", auth, getLearningStreak);
router.get("/", auth, getAllProgress);
router.get("/:courseId", auth, getCourseProgress);
router.post("/", auth, updateProgress);
router.post("/complete-lesson", auth, completeLesson);
router.post("/increment", auth, incrementProgress);

module.exports = router;
