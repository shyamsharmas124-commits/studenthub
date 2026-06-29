const prisma = require("../utils/prisma");
const { calculateStreak, recordLearningActivity } = require("../utils/streak");
const { createNotification } = require("./notificationController");

// Get learning streak for the current user
exports.getLearningStreak = async (req, res) => {
  try {
    const activities = await prisma.learningActivity.findMany({
      where: { userId: req.user.userId },
      select: { date: true },
      orderBy: { date: "desc" }
    });

    const streak = calculateStreak(activities.map((a) => a.date));

    res.json({ currentStreak: streak, activeDays: activities.length });
  } catch (err) {
    console.log("Streak error (returning 0):", err.message);
    res.json({ currentStreak: 0, activeDays: 0 });
  }
};

// Get student progress for all courses
exports.getAllProgress = async (req, res) => {
  try {
    const progress = await prisma.progress.findMany({
      where: { studentId: req.user.userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
          }
        }
      }
    });

    res.json(progress);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Get progress for a specific course
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const progress = await prisma.progress.findUnique({
      where: {
        studentId_courseId: {
          studentId: req.user.userId,
          courseId
        }
      }
    });

    if (!progress) {
      return res.json({ completionPercentage: 0, lessonsCompleted: 0, completedLessonIds: [] });
    }

    res.json({
      ...progress,
      completedLessonIds: JSON.parse(progress.completedLessonIds || "[]"),
    });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Update or create progress
exports.updateProgress = async (req, res) => {
  try {
    const { courseId, lessonsCompleted, completionPercentage } = req.body;

    const progress = await prisma.progress.upsert({
      where: {
        studentId_courseId: {
          studentId: req.user.userId,
          courseId
        }
      },
      update: {
        lessonsCompleted,
        completionPercentage,
        lastAccessedAt: new Date()
      },
      create: {
        studentId: req.user.userId,
        courseId,
        lessonsCompleted: lessonsCompleted || 0,
        completionPercentage: completionPercentage || 0
      }
    });

    res.json(progress);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Mark a specific lesson as completed
exports.completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true },
    });

    if (user?.role === "TEACHER") {
      return res.status(403).json({ msg: "Teachers cannot track student progress on courses" });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: req.user.userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return res.status(403).json({ msg: "You must be enrolled to track progress" });
    }

    const totalLessons = await prisma.courseLesson.count({ where: { courseId } });
    if (!totalLessons) {
      return res.status(400).json({ msg: "This course has no lessons yet" });
    }

    const lesson = await prisma.courseLesson.findFirst({
      where: { id: lessonId, courseId },
    });

    if (!lesson) {
      return res.status(404).json({ msg: "Lesson not found" });
    }

    const currentProgress = await prisma.progress.findUnique({
      where: {
        studentId_courseId: {
          studentId: req.user.userId,
          courseId,
        },
      },
    });

    const completedIds = JSON.parse(currentProgress?.completedLessonIds || "[]");

    if (!completedIds.includes(lessonId)) {
      completedIds.push(lessonId);
    }

    const lessonsCompleted = completedIds.length;
    const completionPercentage = Math.round((lessonsCompleted / totalLessons) * 100);
    const wasComplete = currentProgress?.completionPercentage === 100;

    const progress = await prisma.progress.upsert({
      where: {
        studentId_courseId: {
          studentId: req.user.userId,
          courseId,
        },
      },
      update: {
        lessonsCompleted,
        completionPercentage,
        completedLessonIds: JSON.stringify(completedIds),
        lastAccessedAt: new Date(),
      },
      create: {
        studentId: req.user.userId,
        courseId,
        lessonsCompleted,
        completionPercentage,
        completedLessonIds: JSON.stringify(completedIds),
      },
    });

    await recordLearningActivity(prisma, req.user.userId);

    if (!wasComplete && completionPercentage === 100) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true },
      });

      if (course) {
        await createNotification(
          req.user.userId,
          `Congratulations! You completed "${course.title}"`,
          "ACHIEVEMENT"
        );
      }
    }

    res.json({
      ...progress,
      completedLessonIds: completedIds,
    });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Mark a lesson as completed (increment) — legacy fallback
exports.incrementProgress = async (req, res) => {
  try {
    const { courseId } = req.body;

    const totalLessons = await prisma.courseLesson.count({ where: { courseId } });

    if (totalLessons > 0) {
      const firstIncomplete = await prisma.courseLesson.findFirst({
        where: { courseId },
        orderBy: { order: "asc" },
      });

      if (firstIncomplete) {
        req.body.lessonId = firstIncomplete.id;
        return exports.completeLesson(req, res);
      }
    }

    const currentProgress = await prisma.progress.findUnique({
      where: {
        studentId_courseId: {
          studentId: req.user.userId,
          courseId
        }
      }
    });

    const newLessonsCompleted = (currentProgress?.lessonsCompleted || 0) + 1;
    // For simplicity, let's assume 10 lessons per course or just cap at 100%
    const newPercentage = Math.min(newLessonsCompleted * 10, 100);

    const wasComplete = currentProgress?.completionPercentage === 100;

    const progress = await prisma.progress.upsert({
      where: {
        studentId_courseId: {
          studentId: req.user.userId,
          courseId
        }
      },
      update: {
        lessonsCompleted: newLessonsCompleted,
        completionPercentage: newPercentage,
        lastAccessedAt: new Date()
      },
      create: {
        studentId: req.user.userId,
        courseId,
        lessonsCompleted: newLessonsCompleted,
        completionPercentage: newPercentage
      }
    });

    await recordLearningActivity(prisma, req.user.userId);

    if (!wasComplete && newPercentage === 100) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true }
      });

      if (course) {
        await createNotification(
          req.user.userId,
          `Congratulations! You completed "${course.title}"`,
          "ACHIEVEMENT"
        );
      }
    }

    res.json(progress);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};
