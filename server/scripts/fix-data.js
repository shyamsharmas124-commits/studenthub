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
    // Fix users missing username
    const badUsers = await rawFind("User", {
      $or: [{ username: null }, { username: { $exists: false } }],
    });
    for (const user of badUsers) {
      const id = user._id.$oid || String(user._id);
      const base =
        user.email?.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") ||
        user.name?.replace(/\s+/g, "").toLowerCase() ||
        "user";
      await rawUpdate("User", { _id: oid(user._id) }, { username: `${base}_${id.slice(-6)}` });
    }
    console.log(`Users fixed (username): ${badUsers.length}`);

    // Fix courses missing timestamps
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
        course.createdAt && !Number.isNaN(new Date(course.createdAt).getTime())
          ? new Date(course.createdAt)
          : now;
      const updated =
        course.updatedAt && !Number.isNaN(new Date(course.updatedAt).getTime())
          ? new Date(course.updatedAt)
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
    console.log(`Courses fixed (timestamps): ${badCourses.length}`);

    // Verify
    const courses = await prisma.course.findMany({
      include: {
        teacher: { select: { id: true, name: true, username: true } },
        _count: { select: { enrollments: true, reviews: true } },
      },
      take: 5,
    });
    console.log("Verify OK — sample courses:", courses.length);
  } catch (e) {
    console.error("Fix failed:", e.message);
    console.error(e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
