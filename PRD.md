# Product Requirements Document (PRD)
## StudentHub — A Learning Platform by Students, for Students

**Status:** Active Development (Phase 3)
**Document version:** 1.0
**Last updated:** 2026-08-14

---

## 1. Overview

StudentHub is a student-exclusive learning platform, conceptually similar to Udemy, with one key difference: it does not host original content. Instead, students curate and share free educational resources (YouTube videos/playlists, documentation, blogs, open courseware) and act as both learners and teachers.

### 1.1 Problem Statement
Free, high-quality educational content is scattered across the web (YouTube, docs, blogs). Students waste time discovering it and have no structured way to track progress, get recommendations, or be recognized for curating good resources.

### 1.2 Product Vision
A community-driven catalog of free learning resources where any student can become a teacher by curating a "course" (a link to external content plus structure), where learners can track progress, take quizzes, and where active contributors are rewarded.

### 1.3 Target Users
- **Students** — browse, enroll, bookmark, review, track progress, take quizzes.
- **Teachers** — any user can become a teacher; they create/manage courses and view analytics on their content. (Role is a per-user attribute, not a separate account type — see `Role` enum in the data model.)

---

## 2. Goals & Non-Goals

### 2.1 Goals
- Let users sign up, choose a role (STUDENT / TEACHER), and switch roles later.
- Let teachers curate "courses" — a title, description, category, difficulty, and a link to external content (primarily YouTube).
- Automatically break a submitted link into a lesson list ("curriculum"), using YouTube's API and/or an AI service, with a heuristic fallback when neither is available.
- Let students enroll, bookmark, track completion progress and streaks, and review/rate courses.
- Provide discovery: search, category/difficulty filters, trending courses, per-course "similar courses", and personalized recommendations.
- Let teachers and students generate/take quizzes tied to a course, with per-quiz and global leaderboards.
- Reward active contributors with badges, points, and sponsored coupons.
- Notify users of relevant events (enrollment, reviews, course publication, achievements).

### 2.2 Non-Goals (current phase)
- Hosting original video/content (StudentHub only links out to third-party resources).
- Payments/monetization of courses.
- Native mobile apps (web-first, responsive design only).
- Real-time chat/messaging between users.

---

## 3. User Roles & Permissions

| Role | Capabilities |
|---|---|
| **Unauthenticated visitor** | Browse public course catalog, view course details, view reviews, see trending courses (read-only; `optionalAuth` allows enriched responses if a valid token is present). |
| **Student** (`role = STUDENT`) | Everything a visitor can do, plus: enroll in courses, bookmark courses, submit reviews, track/update progress, take quizzes, view recommendations, receive notifications and rewards. |
| **Teacher** (`role = TEACHER`) | Everything a Student can do, plus: create/update/delete their own courses, view teacher analytics, create quizzes, view teacher-scoped course/quiz lists. Ownership is enforced — a teacher may only modify their own courses/quizzes. |

Role selection happens after signup/login (`/role`) and can be changed later from profile settings.

---

## 4. Functional Requirements

### 4.1 Authentication & Account
- FR-1: Users sign up with name, username, email, password. Password is hashed (bcrypt) before storage.
- FR-2: Users log in with email + password; a JWT (7-day expiry) is issued and stored client-side, sent on subsequent requests via `Authorization: Bearer <token>`.
- FR-3: Users can update profile (bio, avatar, phone, teaching topics), email, and password.
- FR-4: Users select or change their role (STUDENT/TEACHER) at any time.

### 4.2 Course Management (Teacher)
- FR-5: A teacher can create a course with title, description, external link, category, and difficulty (BEGINNER/INTERMEDIATE/ADVANCED).
- FR-6: On creation, the system attempts to auto-generate a lesson curriculum and a quiz from the submitted link (see HLD §4 for the resolution order: YouTube API → AI service → heuristic fallback).
- FR-7: A teacher can update or delete only their own courses.
- FR-8: A teacher can view a list of only their own courses, and analytics for them (views, enrollments, ratings, engagement).

### 4.3 Discovery & Browsing
- FR-9: Any user can list/search all courses, filter by category and difficulty.
- FR-10: The system surfaces trending courses, search suggestions, and per-course "similar courses".
- FR-11: Authenticated students receive personalized recommendations.
- FR-12: Viewing a course detail page logs a view (`CourseView`, unique per user/course) and increments the course's view counter.

### 4.4 Enrollment & Bookmarking
- FR-13: A student can enroll in a course, unenroll, bookmark, or unbookmark it.
- FR-14: A student can list their enrollments and their bookmarked courses.

### 4.5 Progress Tracking
- FR-15: A student's progress on a course is tracked as a completion percentage, a count of lessons completed, and the specific lesson IDs completed.
- FR-16: A student can mark an individual lesson complete, or update/increment progress directly.
- FR-17: The system tracks a per-user daily learning-activity log to compute a learning streak.

### 4.6 Reviews & Ratings
- FR-18: A student can leave one review (1–5 star rating + optional comment) per course, and edit/delete their own review.
- FR-19: Anyone can view a course's reviews and aggregate stats (average rating, count).

### 4.7 Quizzes
- FR-20: Quizzes are tied to a course (optional) and a creator; questions/answers are stored as JSON payloads. Quizzes may be `autoGenerated` (from the course-analysis pipeline) or manually created.
- FR-21: A user can list quizzes, view one by id, view quizzes for a given course, and submit an attempt (score, total questions, percentage recorded).
- FR-22: Per-quiz and global leaderboards rank users by quiz performance.
- FR-23: A teacher can view their own created quizzes and delete them.

### 4.8 Rewards
- FR-24: Users earn rewards (BADGE, COUPON, or POINTS) for platform activity; a user can view their reward history.
- FR-25: Sponsored coupons can be claimed by a user (tracked as claimed/unclaimed with claimant and timestamp).

### 4.9 Notifications
- FR-26: Users receive notifications of type ENROLLMENT, REVIEW, COURSE_PUBLISHED, or ACHIEVEMENT.
- FR-27: A user can list their notifications and mark one or all as read.

---

## 5. Non-Functional Requirements

- **NFR-1 Availability of integrations is optional, not blocking:** the app must start and serve degraded functionality (fallback heuristics) even without a configured YouTube or AI API key. `/api/health` reports integration status (`ok` vs `degraded`).
- **NFR-2 Security:** passwords hashed with bcrypt; JWT-based auth; protected routes reject missing/invalid tokens (401); ownership checks on mutating course/quiz/review endpoints.
- **NFR-3 Responsiveness:** mobile-first, responsive UI (Tailwind CSS).
- **NFR-4 Resilience:** the backend automatically retries on the next port if its default port is occupied (see `startServer` retry logic), up to 10 attempts.
- **NFR-5 Error handling:** centralized Express error-handling middleware returns generic messages in production and detailed messages in development.
- **NFR-6 Data integrity:** unique constraints prevent duplicate enrollments, reviews, progress rows, and course views per (user, course) pair.

---

## 6. Success Metrics (from project roadmap)

- All Phase 1 features working.
- ≥90% API endpoint coverage.
- <2s page load time.
- Mobile responsive design.
- Accessibility score >90.
- Zero critical security issues.
- ≥95% uptime post-deployment.

---

## 7. Tech Stack Summary (context for scope)

- **Frontend:** React 19, Vite, React Router DOM, Axios, Tailwind CSS, React Hot Toast, Lucide React.
- **Backend:** Node.js, Express.js, Prisma ORM, JWT, Bcrypt.
- **Database:** MongoDB (via Prisma's MongoDB connector).
- **External integrations (optional):** YouTube Data API (playlist/video metadata), an AI/LLM service (curriculum & quiz generation), used via `services/courseAnalyzer.js` and `services/aiService.js`.
- **Deployment targets:** Frontend on Vercel; backend on Railway/Render; database on MongoDB Atlas.

---

## 8. Out of Scope / Deferred (per roadmap)

- Dark/light theme toggle (planned Phase 3+).
- Automated test suite (backend/frontend — placeholders only today).
- CI/CD pipeline, production monitoring/alerting, API rate limiting.
- Refresh-token mechanism (currently single long-lived JWT).

---

## 9. Open Questions / Known Gaps

- No automated tests currently exist (`npm test` is a placeholder on both client and server).
- No rate limiting or request-validation middleware yet.
- Avatar upload mechanism referenced in checklist but storage backend not defined in this codebase snapshot.
- Email notifications and refresh tokens are listed as TODOs, not implemented.
