const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  addReview,
  getCourseReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getCourseStats
} = require("../controllers/reviewController");

// Public routes
router.get("/course/:courseId", getCourseReviews);
router.get("/stats/:courseId", getCourseStats);

// Protected routes
router.post("/", auth, addReview);
router.get("/my", auth, getMyReviews);
router.patch("/:reviewId", auth, updateReview);
router.delete("/:reviewId", auth, deleteReview);

module.exports = router;
