# Hostinger VPS backend deployment

Install Node.js 20+ and pnpm 11, then clone the repository and run:

```bash
pnpm install --frozen-lockfile --filter @workspace/api-server...
pnpm run build:api
DATABASE_URL='YOUR_SUPABASE_POSTGRESQL_URL' pnpm run migrate:db
NODE_ENV=production DATABASE_URL='YOUR_SUPABASE_POSTGRESQL_URL' PORT=4000 node --enable-source-maps artifacts/api-server/dist/index.mjs
```

Required environment variables:

```text
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
FRONTEND_URL=https://your-frontend.example.com
API_BASE_URL=https://api.your-domain.example
```

Run `pnpm run migrate:db` once before the first start and after future schema
migration releases. Use the Supabase connection string from Project Settings >
Database; do not use a SQLite file path.
