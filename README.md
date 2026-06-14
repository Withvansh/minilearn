# MiniLearn Project Documentation

⚡ A full-stack micro-learning platform powered by React, TypeScript, Express, SQLite, and Gemini AI for dynamic syllabus and quiz generation.
 LIVE - https://vercel.com/withvanshs-projects/minilearn

---

## Setup

- Instructions for frontend setup.
- Instructions for backend setup.
- Instructions to start development servers.

---

## Environment Variables

- Backend environment variables configuration list.
- Frontend environment variables configuration list.

---

## Database Setup

- SQLite schema overview.
- Database migration commands.
- Database seed commands.

---

## API Endpoints

- Authentication simulation endpoints.
- Course syllabus endpoints.
- Section and lesson endpoints.
- AI Quiz generation and attempt endpoints.

---

## AI Integration

- Gemini 2.5 Flash model configurations.
- Prompt validation filters and JSON response schemas.
- Malformed validation error fallbacks.

---

## Testing

- Running backend unit and integration Jest tests.
- Testing in-memory database configuration details.

---

## Scaling Considerations

- Database transitions (SQLite to PostgreSQL).
- Backend processing and rate limiter configurations.
- Client caching and static asset distribution.

---

## Costs and Limits

- Gemini API pricing and token cost estimates.
- Rate-limiting rules (10 requests/hour per client IP).

---

## Real Authentication Design

- Session-based cookie verification vs JSON Web Tokens (JWT).
- Secure password hashing (Bcrypt) and storage.
- Route authorization guards.

---

## Future Improvements

- User experience and notification additions.
- Automated lesson completions, XP rewards, and streaks.
- Rich text/media renderers for lesson content.
