const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  submitQuiz,
  getTeacherQuizzes,
  deleteQuiz,
  getQuizLeaderboard,
  getGlobalLeaderboard,
  getQuizByCourse,
} = require("../controllers/quizController");

router.get("/", auth, getAllQuizzes);
router.get("/teacher", auth, getTeacherQuizzes);
router.get("/leaderboard", auth, getGlobalLeaderboard);
router.get("/course/:courseId", auth, getQuizByCourse);
router.get("/:id/leaderboard", auth, getQuizLeaderboard);
router.get("/:id", auth, getQuizById);
router.post("/", auth, createQuiz);
router.post("/:id/submit", auth, submitQuiz);
router.delete("/:id", auth, deleteQuiz);

module.exports = router;
