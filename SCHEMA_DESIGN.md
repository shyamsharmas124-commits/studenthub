# Schema Modeling (MongoDB) — StudentHub

This document explains all schema modeling decisions in the StudentHub Prisma + MongoDB setup, covering **embedding vs referencing**, **indexing**, and **composite types**.

---

## Embedding vs Referencing

MongoDB supports two primary ways to model relationships:

| Strategy | When to Use | StudentHub Examples |
|----------|-------------|---------------------|
| **Embedding** | Data is read together, small size, 1:1 or 1:few | `Question[]` inside `Quiz`, `QuestionOption[]` inside `Question` |
| **Referencing** | Data is large, queried independently, 1:many or many:many | `Course ? Enrollment`, `User ? Progress`, `User ? Notification` |

### Embedding (Composite Types)

Questions are embedded directly inside the Quiz document because they are **always fetched together** and never queried independently.

```prisma
type QuestionOption {
  text      String
  isCorrect Boolean
}

type Question {
  text    String
  options QuestionOption[]
}

model Quiz {
  questions Question[]   // Embedded — questions always fetched with quiz
}
```

### Referencing (Foreign Key Relations)

Enrollments grow unboundedly. Embedding inside User/Course would cause document bloat and exceed MongoDB's 16MB limit.

```prisma
model Enrollment {
  studentId String  @db.ObjectId   // Reference to User
  courseId  String  @db.ObjectId   // Reference to Course
  student   User    @relation(...)
  course    Course  @relation(...)
}
```

---

## Index Strategy

```prisma
// User — filter teachers vs students
@@index([role])

// Course — most common filter combos
@@index([category])
@@index([difficulty])
@@index([teacherId])

// Prevent duplicate enrollments + fast lookup
@@unique([studentId, courseId])

// Daily streak tracking
@@unique([userId, date])
```

---

## SQL JOINs ? MongoDB Equivalents

| SQL Pattern | MongoDB / Prisma Equivalent | Used In StudentHub |
|-------------|----------------------------|-------------------|
| `INNER JOIN` | `include: { relation: true }` | Course with Teacher |
| `LEFT JOIN` | `include: { relation: { select: ... } }` | Enrollment with optional course |
| `GROUP BY + COUNT` | `$group` in aggregation pipeline | Analytics: enrollments per category |
| `WHERE x IN (...)` | `{ id: { in: [...] } }` | Exclude enrolled courses from recommendations |
| `ORDER BY + LIMIT` | `orderBy + take` | Trending courses (top 6 by views) |
| `UNIQUE CONSTRAINT` | `@@unique([field1, field2])` | Prevent duplicate enrollments |
| `INDEX` | `@@index([field])` | Course category/difficulty filtering |

---

## Aggregation Pipelines

For complex analytics, we use `aggregateRaw()` — the MongoDB equivalent of SQL GROUP BY + JOIN:

```js
await prisma.review.aggregateRaw({
  pipeline: [
    { $group: { _id: "$courseId", avgRating: { $avg: "$rating" } } },
    { $lookup: { from: "Course", localField: "_id", foreignField: "_id", as: "courseInfo" } },
    { $unwind: "$courseInfo" },
    { $sort: { avgRating: -1 } }
  ]
});
```
