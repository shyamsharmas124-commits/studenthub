const prisma = require("../utils/prisma");

exports.getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.user.userId;

    // 1. Fetch all courses taught by the teacher
    const courses = await prisma.course.findMany({
      where: { teacherId },
      include: {
        enrollments: {
          select: {
            id: true,
            enrolledAt: true,
            studentId: true,
            student: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        progress: {
          select: {
            completionPercentage: true
          }
        }
      }
    });

    if (courses.length === 0) {
      return res.json({
        totalCourses: 0,
        totalEnrollments: 0,
        totalViews: 0,
        averageRating: 0,
        averageProgress: 0,
        courseBreakdown: [],
        categoryDistribution: [],
        enrollmentTimeline: []
      });
    }

    // 2. Aggregate calculations
    let totalEnrollments = 0;
    let totalViews = 0;
    let totalRatingsSum = 0;
    let totalReviewsCount = 0;
    let totalCompletionPercentageSum = 0;
    let totalProgressCount = 0;

    const courseBreakdown = courses.map(course => {
      const enrollsCount = course.enrollments.length;
      const reviewsCount = course.reviews.length;
      const courseViews = course.views || 0;

      totalEnrollments += enrollsCount;
      totalViews += courseViews;

      // Average rating for this course
      const courseRatingSum = course.reviews.reduce((sum, r) => sum + r.rating, 0);
      const courseAvgRating = reviewsCount > 0 ? parseFloat((courseRatingSum / reviewsCount).toFixed(1)) : 0;

      totalRatingsSum += courseRatingSum;
      totalReviewsCount += reviewsCount;

      // Average progress for this course
      const courseProgressCount = course.progress.length;
      const courseProgressSum = course.progress.reduce((sum, p) => sum + p.completionPercentage, 0);
      const courseAvgProgress = courseProgressCount > 0 ? Math.round(courseProgressSum / courseProgressCount) : 0;

      totalCompletionPercentageSum += courseProgressSum;
      totalProgressCount += courseProgressCount;

      return {
        id: course.id,
        title: course.title,
        category: course.category,
        difficulty: course.difficulty,
        views: courseViews,
        enrollmentsCount: enrollsCount,
        reviewsCount,
        averageRating: courseAvgRating,
        averageProgress: courseAvgProgress
      };
    });

    const overallAvgRating = totalReviewsCount > 0 ? parseFloat((totalRatingsSum / totalReviewsCount).toFixed(1)) : 0;
    const overallAvgProgress = totalProgressCount > 0 ? Math.round(totalCompletionPercentageSum / totalProgressCount) : 0;

    // 3. Category distribution (Course counts and enrollments count per category)
    const categoryMap = {};
    courses.forEach(course => {
      const cat = course.category || "Other";
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, coursesCount: 0, enrollmentsCount: 0 };
      }
      categoryMap[cat].coursesCount += 1;
      categoryMap[cat].enrollmentsCount += course.enrollments.length;
    });
    const categoryDistribution = Object.values(categoryMap);

    // 4. Enrollment timeline (Last 30 days daily counts for visual trends)
    // Gather all enrollments with their dates
    const allEnrollments = [];
    courses.forEach(course => {
      course.enrollments.forEach(enroll => {
        allEnrollments.push(enroll.enrolledAt);
      });
    });

    // Group by day for the last 30 days
    const timelineMap = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateString = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      timelineMap[dateString] = 0;
    }

    allEnrollments.forEach(date => {
      const dateString = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dateString in timelineMap) {
        timelineMap[dateString] += 1;
      }
    });

    const enrollmentTimeline = Object.entries(timelineMap).map(([date, count]) => ({
      date,
      count
    }));

    res.json({
      totalCourses: courses.length,
      totalEnrollments,
      totalViews,
      averageRating: overallAvgRating,
      averageProgress: overallAvgProgress,
      courseBreakdown,
      categoryDistribution,
      enrollmentTimeline
    });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};
