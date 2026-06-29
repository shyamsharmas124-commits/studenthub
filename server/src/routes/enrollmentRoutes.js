const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  enrollCourse,
  getMyEnrollments,
  bookmarkCourse,
  unbookmarkCourse,
  getBookmarkedCourses,
  unenrollCourse
} = require("../controllers/enrollmentController");

// All enrollment routes require authentication
router.post("/", auth, enrollCourse);
router.get("/", auth, getMyEnrollments);
router.post("/bookmark", auth, bookmarkCourse);
router.post("/unbookmark", auth, unbookmarkCourse);
router.get("/bookmarks", auth, getBookmarkedCourses);
router.delete("/:courseId", auth, unenrollCourse);

module.exports = router;
