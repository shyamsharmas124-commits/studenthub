require("dotenv").config();
const prisma = require("../src/utils/prisma");

const now = new Date();

async function rawFind(collection, filter = {}) {
  const result = await prisma.$runCommandRaw({
    find: collection,
    filter,
  });
  return result?.cursor?.firstBatch || [];
}

async function rawUpdate(collection, filter, set) {
  await prisma.$runCommandRaw({
    update: collection,
    updates: [{ q: filter, u: { $set: set } }],
  });
}

function oid(id) {
  if (id?.$oid) return { $oid: id.$oid };
  return { $oid: String(id) };
}

(async () => {
  try {
    // 1. Fix users missing username or timestamps
    const badUsers = await rawFind("User", {
      $or: [
        { username: null },
        { username: { $exists: false } },
        { createdAt: null },
        { createdAt: { $exists: false } },
        { updatedAt: null },
        { updatedAt: { $exists: false } },
      ],
    });

    for (const user of badUsers) {
      const id = user._id.$oid || String(user._id);
      const base =
        user.email?.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") ||
        user.name?.replace(/\s+/g, "").toLowerCase() ||
        "user";
      const username = user.username || `${base}_${id.slice(-6)}`;

      const created =
        user.createdAt && !Number.isNaN(new Date(user.createdAt.$date || user.createdAt).getTime())
          ? new Date(user.createdAt.$date || user.createdAt)
          : now;
      const updated =
        user.updatedAt && !Number.isNaN(new Date(user.updatedAt.$date || user.updatedAt).getTime())
          ? new Date(user.updatedAt.$date || user.updatedAt)
          : created;

      await prisma.$runCommandRaw({
        update: "User",
        updates: [
          {
            q: { _id: oid(user._id) },
            u: {
              $set: {
                username,
                createdAt: { $date: created.toISOString() },
                updatedAt: { $date: updated.toISOString() },
              },
            },
          },
        ],
      });
    }
    console.log(`Users checked & fixed: ${badUsers.length}`);

    // 2. Fix courses missing timestamps
    const badCourses = await rawFind("Course", {
      $or: [
        { createdAt: null },
        { createdAt: { $exists: false } },
        { updatedAt: null },
        { updatedAt: { $exists: false } },
      ],
    });
    for (const course of badCourses) {
      const created =
        course.createdAt && !Number.isNaN(new Date(course.createdAt.$date || course.createdAt).getTime())
          ? new Date(course.createdAt.$date || course.createdAt)
          : now;
      const updated =
        course.updatedAt && !Number.isNaN(new Date(course.updatedAt.$date || course.updatedAt).getTime())
          ? new Date(course.updatedAt.$date || course.updatedAt)
          : created;

      await prisma.$runCommandRaw({
        update: "Course",
        updates: [
          {
            q: { _id: oid(course._id) },
            u: {
              $set: {
                createdAt: { $date: created.toISOString() },
                updatedAt: { $date: updated.toISOString() },
                views: course.views ?? 0,
              },
            },
          },
        ],
      });
    }
    console.log(`Courses checked & fixed: ${badCourses.length}`);

    // 3. Fix other collections with missing timestamps
    const collectionsWithCreated = [
      "Enrollment",
      "Review",
      "Quiz",
      "QuizAttempt",
      "Notification",
      "Reward",
      "SponsoredCoupon",
      "CourseLesson",
      "CourseView",
      "LearningActivity",
    ];

    for (const col of collectionsWithCreated) {
      try {
        const docs = await rawFind(col, {
          $or: [{ createdAt: null }, { createdAt: { $exists: false } }],
        });
        for (const doc of docs) {
          await prisma.$runCommandRaw({
            update: col,
            updates: [
              {
                q: { _id: oid(doc._id) },
                u: { $set: { createdAt: { $date: now.toISOString() } } },
              },
            ],
          });
        }
        if (docs.length > 0) console.log(`${col} fixed: ${docs.length}`);
      } catch (err) {
        // collection might not have records yet, continue
      }
    }

    // Verify User and Course queries
    const users = await prisma.user.findMany({ take: 5 });
    console.log("Verify OK — sample users:", users.length);
    const courses = await prisma.course.findMany({ take: 5 });
    console.log("Verify OK — sample courses:", courses.length);
  } catch (e) {
    console.error("Fix failed:", e.message);
    console.error(e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
