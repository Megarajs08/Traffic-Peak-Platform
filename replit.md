# TrafficPeak

A production-ready typing platform — practice, compete, learn, and earn certificates. Monkeytype-style typing engine with leaderboards, structured lessons, typing games, a blog, and a personal dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/traffic-peak run dev` — run the frontend (uses PORT env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed the DB with demo data
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — cookie signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS v4 + Wouter routing + React Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle)
- Auth: httpOnly session cookie (`tp_session`, 30-day TTL), bcrypt password hashing

## Where things live

- `artifacts/traffic-peak/src/` — React frontend
  - `pages/` — route-level pages (home, typing-test, learn, games, leaderboard, blog, dashboard, certificates, profile, login, register, settings)
  - `components/` — shared components (Navbar, lessons/LessonPlayer, games/*)
  - `contexts/auth-context.tsx` — global auth state via `useGetMe` hook
  - `App.tsx` — root with QueryClient, Router, dark mode wrapper
- `artifacts/api-server/src/` — Express API
  - `routes/` — auth, tests, stats, lessons, leaderboard, certificates, blog, users
  - `lib/session.ts` — session cookie helpers
  - `app.ts` — Express app setup (cors, cookieParser, session middleware)
- `lib/db/src/schema/` — Drizzle ORM schema (users, test_results, lessons, lesson_progress, certificates, blog_posts, sessions)
- `lib/api-spec/` — OpenAPI 3.1 spec (source of truth for all API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `scripts/src/seed.ts` — DB seed script (15 lessons, 4 blog posts, demo users)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed hooks and Zod validators. Never hand-write API client code.
- Session cookies over JWTs: httpOnly `tp_session` cookie avoids XSS token theft; 30-day TTL stored in `sessions` DB table for invalidation.
- Dark-mode-first: Tailwind CSS v4 with `@custom-variant dark` and CSS variable theming. The root `<div className="dark bg-background">` forces dark mode globally; a theme toggle switches between modes at runtime.
- Typesafe DB access: all DB queries go through Drizzle ORM with `drizzle-zod` for input validation on inserts.
- Client-side games: all four typing games (WordRain, AlphabetSprint, WordScramble, TypingRace) are fully client-side with requestAnimationFrame/setInterval — no backend needed.

## Product

- **Typing Test** — Monkeytype-style test with words/paragraph/quotes/numbers/symbols modes, 15–300s durations, real-time WPM/CPM/accuracy/error stats, results screen with certificate generation.
- **Learn** — 15 structured lessons (beginner → advanced), lesson player with character-level feedback, progress saved per-user.
- **Games** — Word Rain, Alphabet Sprint, Word Scramble, Race vs AI — all with scores and fun mechanics.
- **Leaderboard** — All-time / Weekly / Monthly tabs, ranked by best WPM with accuracy and test count.
- **Dashboard** — Personal progress chart (recharts AreaChart), stats overview, recent tests.
- **Certificates** — Earn/download PNG certificates for typing milestones; public verification via `/verify/:code`.
- **Blog** — 4 seeded posts (Typing Tips, Career Skills, Keyboard Guides), category filtering.
- **Auth** — Register/login with bcrypt-hashed passwords; session cookie auth; profile and settings pages.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `pnpm --filter @workspace/scripts run seed` requires `@workspace/db` dep in scripts/package.json — it's there.
- After adding deps to `scripts/package.json`, run `pnpm install` at the root before running seed.
- The dark div wrapper must have `bg-background` applied (in `App.tsx`) or the body background bleeds through as white.
- `/api/auth/me` returns 401 when unauthenticated — this is expected and not an error.
- bcrypt 6.x requires native build scripts (`pnpm approve-builds` was already run).
- `useSaveLessonProgress` mutation signature: `{ id: number; data: LessonProgressInput }` — NOT a `params` wrapper.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
