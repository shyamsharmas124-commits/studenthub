const prisma = require("../utils/prisma");

// Enroll in a course
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true, name: true },
    });

    if (user?.role === "TEACHER") {
      return res.status(403).json({ msg: "Teachers cannot enroll in courses" });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: req.user.userId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ msg: "Already enrolled in this course" });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: req.user.userId,
        courseId
      }
    });

    // Notify teacher
    try {
      await prisma.notification.create({
        data: {
          userId: course.teacherId,
          message: `${user.name} enrolled in your course: ${course.title}`,
          type: "ENROLLMENT",
        },
      });
    } catch (err) {
      console.log("Notification error:", err);
    }

    res.status(201).json(enrollment);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Get student's enrollments
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.user.userId },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              }
            }
          }
        }
      }
    });

    res.json(enrollments);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Bookmark a course
exports.bookmarkCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true },
    });

    if (user?.role === "TEACHER") {
      return res.status(403).json({ msg: "Teachers cannot bookmark courses" });
    }

    const enrollment = await prisma.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: req.user.userId,
          courseId
        }
      },
      update: { bookmarked: true },
      create: {
        studentId: req.user.userId,
        courseId,
        bookmarked: true
      }
    });

    res.json(enrollment);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Unbookmark a course
exports.unbookmarkCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const enrollment = await prisma.enrollment.update({
      where: {
        studentId_courseId: {
          studentId: req.user.userId,
          courseId
        }
      },
      data: { bookmarked: false }
    });

    res.json(enrollment);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Get bookmarked courses
exports.getBookmarkedCourses = async (req, res) => {
  try {
    const bookmarked = await prisma.enrollment.findMany({
      where: {
        studentId: req.user.userId,
        bookmarked: true
      },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              }
            }
          }
        }
      }
    });

    res.json(bookmarked);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Unenroll from a course
exports.unenrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await prisma.enrollment.delete({
      where: {
        studentId_courseId: {
          studentId: req.user.userId,
          courseId
        }
      }
    });

    res.json({ msg: "Successfully unenrolled from course" });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};
