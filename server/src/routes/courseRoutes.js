const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");
const {
  addCourse,
  getCourses,
  getCourseById,
  getTeacherCourses,
  updateCourse,
  deleteCourse,
  getRecommendations,
  getTrendingCourses,
  getSimilarCourses,
  getSearchSuggestions
} = require("../controllers/courseController");

// Static paths MUST come before /:id
router.get("/trending", getTrendingCourses);
router.get("/suggestions", getSearchSuggestions);
router.get("/recommendations", auth, getRecommendations);
router.get("/teacher/courses", auth, getTeacherCourses);

router.get("/:id/similar", getSimilarCourses);
router.get("/", getCourses);
router.get("/:id", optionalAuth, getCourseById);

router.post("/", auth, addCourse);
router.patch("/:id", auth, updateCourse);
router.delete("/:id", auth, deleteCourse);

module.exports = router;
