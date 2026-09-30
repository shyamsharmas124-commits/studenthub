# Technical Requirements Document (TRD)

## Project Summary
StudentHub is an innovative student-exclusive learning platform that allows students to curate and share free educational resources, track learning progress, and interact as both students and teachers. 

## Architecture Overview
The application follows a standard modern web architecture:
- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (managed via Prisma ORM)
- **Caching**: Redis

## Known Technical Gaps

While the core functionality of the platform is established, there are several known technical gaps and areas that require further development or refactoring:

### 1. Stripe Webhook Conflicts
**Issue**: The global application of `express.json()` in `index.js` currently interferes with Stripe webhook events. Stripe webhooks require the raw body of the request to properly verify the signature, which is parsed and modified by `express.json()`.
**Proposed Solution**: Refactor the middleware order in `index.js`. Apply the raw body parser exclusively to the Stripe webhook route before the global `express.json()` middleware is applied to the rest of the application API routes.

### 2. Email Integration Stubbed
**Issue**: The current email integration for notifications, password resets, and user verification is only stubbed out and does not connect to a real email delivery service (like SendGrid, AWS SES, or Resend).
**Proposed Solution**: Implement a robust email service provider integration. Create an email utility or service module that handles asynchronous email delivery and handles templates properly.

### 3. Redis Caching Implementation
**Issue**: While Redis is documented in the tech stack, the implementation for caching expensive database queries (such as fetching popular courses or leaderboards) might be incomplete or missing in several API endpoints.
**Proposed Solution**: Audit existing API endpoints for read-heavy operations and implement Redis caching with appropriate TTLs (Time to Live) to reduce MongoDB load and improve response times.

### 4. Comprehensive Testing Strategy
**Issue**: There is a lack of automated tests (unit, integration, and E2E) across both the frontend and backend repositories.
**Proposed Solution**: Setup a testing framework using Jest and Supertest for the backend, and Vitest/React Testing Library for the frontend. Establish GitHub Actions to run these tests on every pull request.

### 5. Logging and Monitoring
**Issue**: The system currently relies on basic `console.log()` statements for debugging, which is inadequate for production environments.
**Proposed Solution**: Integrate a structured logging library like Winston or Pino in the backend. Add an APM (Application Performance Monitoring) tool or error tracking service such as Sentry to capture production errors.
