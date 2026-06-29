const prisma = require("../utils/prisma");

// Add review to a course
exports.addReview = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        studentId_courseId: {
          studentId: req.user.userId,
          courseId
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({ msg: "You have already reviewed this course" });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        studentId: req.user.userId,
        courseId
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      }
    });

    // Notify teacher
    try {
      const student = await prisma.user.findUnique({ where: { id: req.user.userId } });
      await prisma.notification.create({
        data: {
          userId: course.teacherId,
          message: `${student.name} gave a ${rating}-star review to: ${course.title}`,
          type: "REVIEW"
        }
      });
    } catch (err) {
      console.log("Notification error:", err);
    }

    res.status(201).json(review);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Get reviews for a course
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Get user's reviews
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { studentId: req.user.userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    res.json(reviews);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    if (review.studentId !== req.user.userId) {
      return res.status(403).json({ msg: "Not authorized to update this review" });
    }

    // Update review
    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      }
    });

    res.json(updated);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Check if review exists and belongs to user
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    if (review.studentId !== req.user.userId) {
      return res.status(403).json({ msg: "Not authorized to delete this review" });
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId }
    });

    res.json({ msg: "Review deleted successfully" });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Get course statistics
exports.getCourseStats = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { courseId }
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2)
      : 0;

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    res.json({
      totalReviews,
      averageRating: parseFloat(averageRating),
      ratingDistribution
    });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};
