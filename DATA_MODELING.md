# Data Modeling Notes (MongoDB via Prisma)

## Embedding vs. referencing

StudentHub's schema (`server/prisma/schema.prisma`) uses **referencing almost
everywhere**, not embedding. That's a deliberate choice given the access
patterns this app actually needs:

| Relationship | Choice | Why |
|---|---|---|
| `Course.teacher` → `User` | Reference (`teacherId`) | A teacher's profile changes independently of any one course, and the same teacher document is read from many unrelated places (profile page, course cards, leaderboard). Embedding a copy of the teacher into every course would mean updating N documents every time a teacher edits their bio. |
| `Course` → `Review[]` | Reference (`Review.courseId`) | Reviews are queried, filtered, and paginated independently of their course (e.g. "all reviews by this student"), and grow unboundedly — MongoDB documents have a 16MB cap, so an array of reviews embedded in `Course` doesn't scale. |
| `Course` → `CourseLesson[]` | Reference | Lessons are edited individually (reordered, retitled) and are naturally bounded per course, so this *could* have been embedded — it's referenced here mainly for consistency with the rest of the schema and to keep `Course` documents small and fast to fetch on the listing page. |
| `Progress.completedLessonIds` | Embedded (as a JSON string field) | This is small, always read/written as a whole alongside its one `Progress` document, and never queried independently — a good case for embedding rather than a separate collection. |

**Rule of thumb applied here:** embed data that is small, bounded, and always
read together with its parent; reference data that is large, unbounded,
queried independently, or shared across many parents.

## Indexes

Every `@@index` added to `schema.prisma` maps to a real query this app makes:

- `Course(category)`, `Course(difficulty)`, `Course(teacherId)` — back `GET /api/course?category=&difficulty=` and "my courses" lookups.
- `Enrollment(courseId)` — the compound unique index on `(studentId, courseId)` only optimizes lookups that start with `studentId`; this covers "how many students are enrolled in this course."
- `Review(courseId)` — course detail page pulls all reviews for one course.
- `Notification(userId, read)` — the notification bell polls "my unread notifications" on effectively every page load; this is the hottest read in the app.
- `CourseView(courseId)`, `Quiz(courseId)`, `QuizAttempt(userId)`, `LearningActivity(userId)` — support the analytics and streak-tracking queries in `analyticsController.js` and `progressController.js`.

Run `npx prisma db push` after pulling schema changes to apply new indexes —
Mongo builds them in the background, so this is safe to run against a live
database, though a large existing collection may take a few seconds.

## Aggregation pipelines

`analyticsController.js`'s `getTeacherAnalytics` deliberately fetches rows via
Prisma's ORM layer and reduces them in JavaScript — fine for "one teacher's
own dashboard," which is a small, bounded dataset.

The new `getTeacherLeaderboard` (`GET /api/analytics/leaderboard`) instead
runs a real MongoDB aggregation pipeline via `prisma.course.aggregateRaw`
(`$lookup` → `$group` → `$sort` → `$limit`), because "top 10 teachers across
the whole platform" is exactly the kind of cross-collection, whole-dataset
query that's cheap for Mongo to do server-side and expensive to do by
pulling every course/review/enrollment into Node first.
