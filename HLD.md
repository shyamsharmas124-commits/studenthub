# High-Level Design (HLD)
## StudentHub

**Document version:** 1.0
**Last updated:** 2026-08-14

---

## 1. Architecture Overview

StudentHub is a classic three-tier web application:

```
┌─────────────────────┐        HTTPS/JSON        ┌──────────────────────┐        Prisma Client        ┌───────────────┐
│   React SPA (client) │  ───────────────────────▶ │  Express API (server) │ ───────────────────────────▶ │  MongoDB Atlas │
│  Vite + Tailwind CSS │ ◀─────────────────────────│  Node.js + JWT auth   │ ◀─────────────────────────── │   (documents)  │
└─────────────────────┘                            └──────────────────────┘                              └───────────────┘
                                                              │
                                                              │ optional outbound calls
                                                              ▼
                                                 ┌───────────────────────────┐
                                                 │ YouTube Data API / AI (LLM)│
                                                 │  service for curriculum &  │
                                                 │  quiz auto-generation      │
                                                 └───────────────────────────┘
```

- **Client:** Single-page React application, client-side routing, talks to the API exclusively over HTTP/JSON via an Axios instance (`client/src/api/axios.js`).
- **Server:** Stateless Express REST API. Auth state carried entirely in a JWT on each request (no server-side session store).
- **Database:** MongoDB, accessed exclusively through Prisma ORM (`server/prisma/schema.prisma`).
- **External integrations:** Optional, best-effort. The server degrades gracefully (heuristic fallbacks) if the YouTube API key or AI/LLM API key is not configured.

---

## 2. Component Breakdown

### 2.1 Client (`client/`)
| Layer | Contents |
|---|---|
| `src/pages/` | Route-level screens: Home, Login, Signup, RoleSelect, Dashboard, Courses, CourseDetail, AddCourse, EditCourse, Profile, QuizCenter, TeacherDashboard, TeacherQuizzes, TeacherAnalytics, NotFound. |
| `src/components/` | Reusable UI: Navbar, Sidebar, Button, Input, Card, CourseCard, CategoryCard, StatsCard, FormContainer, LoadingSpinner, ErrorBoundary, ProtectedRoutes. |
| `src/contexts/AuthContext.jsx` | Global auth state — holds current user/token, exposes login/logout/role-update, persists token to `localStorage`. |
| `src/api/axios.js` | Central Axios instance; attaches `Authorization` header, base URL configuration. |
| `src/App.jsx` / `main.jsx` | Router setup, route guarding via `ProtectedRoutes`. |

### 2.2 Server (`server/src/`)
| Layer | Responsibility |
|---|---|
| `index.js` | App bootstrap: CORS, JSON body parsing, health check, route mounting, centralized error handler, self-healing port binding. |
| `routes/*.js` | One router per resource; declares path + which middleware (auth/optionalAuth) guards each endpoint. |
| `controllers/*.js` | Business logic per resource (auth, user, course, enrollment, progress, review, quiz, reward, notification, analytics). |
| `middleware/authMiddleware.js` | Required-auth guard — verifies JWT, rejects with 401 if absent/invalid, attaches `req.user`. |
| `middleware/optionalAuth.js` | Best-effort auth — attaches `req.user` if a valid token is present, otherwise continues unauthenticated (used for endpoints that personalize output but are also public, e.g. course detail). |
| `middleware/errorHandler.js` | Terminal Express error handler; standardizes error responses. |
| `services/courseAnalyzer.js` | Orchestrates course-link analysis: YouTube parsing → AI generation → heuristic fallback (see §4). |
| `services/aiService.js` | Wraps calls to the external AI/LLM provider for curriculum generation, quiz generation, and lesson-title refinement. |
| `utils/youtube.js` | YouTube URL parsing and Data API calls (playlist/video metadata). |
| `utils/prisma.js` | Shared Prisma client singleton. |
| `utils/streak.js` | Learning-streak calculation from `LearningActivity` records. |
| `config/env.js` | Centralizes required/optional env vars, computes integration status for `/api/health` and startup logging. |
| `scripts/*.js` | One-off maintenance scripts (data fixes, duplicate-email cleanup, coupon seeding) — run manually, not part of the request path. |

### 2.3 Database
MongoDB accessed via Prisma. See LLD §2 for the full schema. Logical groupings:
- **Identity:** `User`
- **Catalog:** `Course`, `CourseLesson`, `CourseView`
- **Engagement:** `Enrollment`, `Progress`, `Review`, `LearningActivity`
- **Assessment:** `Quiz`, `QuizAttempt`
- **Growth/Retention:** `Reward`, `SponsoredCoupon`, `Notification`

---

## 3. Request Flow (typical authenticated write)

1. Client attaches `Authorization: Bearer <jwt>` (set at login, stored client-side) to the request.
2. Express route matches; `authMiddleware` verifies the JWT signature/expiry using `JWT_SECRET`. Invalid/missing → 401 immediately, controller never runs.
3. Controller performs the operation via Prisma, including any authorization check (e.g., "does `req.user.id` own this course?").
4. Controller returns JSON; on failure, throws/forwards an error with a `statusCode`, caught by the mounted `errorHandler`.
5. In production, error messages are sanitized to a generic string; in development, the real message is returned to speed up debugging.

For public/optionally-personalized endpoints (e.g. `GET /api/course/:id`), `optionalAuth` runs instead: it does not block unauthenticated requests, but if a valid token is present, `req.user` is populated so the controller can, e.g., include the caller's own progress/enrollment/bookmark state alongside the public course data.

---

## 4. Course Ingestion Pipeline (`courseAnalyzer.analyzeCourseLink`)

When a teacher submits a course link, the system attempts (in order) to build a lesson list and quiz automatically:

1. **Parse the link** (`utils/youtube.parseYouTubeUrl`) to detect whether it's a YouTube playlist, a single video, or neither.
2. **YouTube Data API** (if the link is a playlist/video and a YouTube key is configured): fetch playlist items or single-video metadata → lessons; `source = "youtube_api"`.
3. **AI/LLM generation** (if step 2 produced nothing and an AI key is configured): `generateLessonsWithAI` proposes a lesson breakdown; `source = "openai_curriculum"`.
4. **Heuristic fallback** (if neither above produced lessons): `fallbackLessons` derives a minimal single/placeholder lesson structure from the link/title; `source = "playlist_heuristic"` or `"link_heuristic"`.
5. **Title refinement** (optional, if AI key present): `refineLessonTitles` polishes lesson titles; source annotated with `+ai_titles`.
6. **Quiz generation:** if an AI key is present, `generateCurriculumAndQuiz` produces a quiz; otherwise `fallbackQuiz` derives a basic quiz from the lesson titles.

This makes all downstream features (progress tracking per lesson, quizzes) available even with zero external API keys configured — degraded but functional, per NFR-1 in the PRD.

---

## 5. Cross-Cutting Concerns

| Concern | Approach |
|---|---|
| **AuthN** | Stateless JWT (7-day expiry), verified per-request; no server session store. |
| **AuthZ** | Ownership checks inside controllers (e.g., only a course's `teacherId` may update/delete it). |
| **CORS** | Enabled globally via the `cors` package; origin configured via `CLIENT_URL` env var. |
| **Config/secrets** | `.env` files per app (`client/.env`, `server/.env`); `config/env.js` centralizes required vs optional vars and reports integration health without leaking secret values. |
| **Health/observability** | `GET /api/health` reports `ok`/`degraded` plus per-integration status; no external monitoring/alerting configured yet (roadmap item). |
| **Resilience** | Server auto-retries on `port+1` up to 10 times on `EADDRINUSE` for unmanaged ports. |
| **Data uniqueness** | Enforced at the schema level via Prisma `@@unique` constraints (enrollment, review, progress, course view, learning activity) rather than in application code, to prevent race conditions. |

---

## 6. Deployment View

| Component | Target |
|---|---|
| Client (static build) | Vercel |
| Server (Node process) | Railway or Render |
| Database | MongoDB Atlas |

No CI/CD pipeline is defined yet (tracked as a Phase 5 roadmap item in `CHECKLIST.md`).

---

## 7. Key Design Decisions & Rationale

- **MongoDB via Prisma, not a relational DB:** course/lesson/quiz payloads are semi-structured (e.g., quiz `questions`/`answers` stored as JSON strings), which fits a document store; Prisma still gives schema/type safety on top.
- **Stateless JWT over server sessions:** simplifies horizontal scaling of the API tier (no shared session store needed) at the cost of no server-side token revocation (accepted trade-off; refresh-token support is a listed TODO).
- **Optional external integrations with graceful degradation:** the product must be usable and demoable without paid API keys, so the ingestion pipeline always has a non-AI, non-YouTube fallback path.
- **Ownership enforced in controllers, not middleware:** ownership rules differ per resource (course teacher vs. review author vs. quiz creator), so checks live close to the business logic rather than in a generic middleware.
