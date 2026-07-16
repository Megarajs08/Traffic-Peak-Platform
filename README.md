# TypingPeak

A full-stack typing speed platform — practice, compete, learn, and get certified.

## Features

- Real-time WPM / CPM / accuracy tracking (Monkeytype-style)
- 5 test modes: words, paragraph, quotes, numbers, symbols
- 5 timer options (15s → 300s)
- Speed tier animations (Rising Typist → Lightning Fingers)
- Global leaderboard with weekly rankings
- Verified certificates (shareable, employer-verifiable)
- Structured lessons from beginner to advanced
- Typing games (Typing Race)
- Weekly gift voucher rewards for top streak holders
- Multilingual typing support (Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, Marathi)
- Tamil phonetic transliteration engine (Google Input Tools style)
- HR assessment module
- Admin panel (user management, blog, vouchers)
- Google OAuth login

## Tech Stack

| Layer     | Technology                                      |
|-----------|--------------------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS 4, Framer Motion   |
| Backend   | Node.js, Express, TypeScript                    |
| Database  | Supabase PostgreSQL via Drizzle ORM              |
| Monorepo  | pnpm workspaces                                 |
| Process   | PM2                                             |

## Project Structure

```
.
├── artifacts/
│   ├── traffic-peak/     # React frontend
│   └── api-server/       # Express API
├── lib/
│   ├── db/               # Drizzle ORM schema + migrations
│   ├── api-spec/         # Shared API types
│   ├── api-zod/          # Zod validators
│   └── api-client-react/ # React Query hooks
├── scripts/              # Setup and seed utilities
└── ecosystem.config.js   # PM2 process config
```

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/your-username/typing-peak.git
cd typing-peak
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Set up the Supabase database

```bash
DATABASE_URL='your_supabase_postgresql_connection_string' pnpm run migrate:db
```

### 4. Seed the admin account

```bash
DATABASE_URL='your_supabase_postgresql_connection_string' \
ADMIN_EMAIL=you@example.com \
ADMIN_PASSWORD=YourPassword \
node scripts/seed-admin.mjs
```

### 5. Build

```bash
# Build frontend
cd artifacts/traffic-peak && pnpm run build && cd ../..

# Build API
cd artifacts/api-server && pnpm run build && cd ../..
```

### 6. Run with PM2

```bash
npx pm2 start ecosystem.config.js
```

Frontend: http://localhost:4173  
API: http://localhost:4000

## Google OAuth Setup (optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3004/api/auth/google/callback` as an authorised redirect URI for local development
4. Add your production callback URL too, for example `https://your-domain.com/api/auth/google/callback`
5. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, and `FRONTEND_URL` in your `.env`

## License

MIT
