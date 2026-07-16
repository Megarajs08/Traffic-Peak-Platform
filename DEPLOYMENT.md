# Backend deployment

The API uses Supabase PostgreSQL through Drizzle ORM. Set `DATABASE_URL` to the
Supabase PostgreSQL connection string and apply migrations before starting it:

```bash
pnpm install --frozen-lockfile --filter @workspace/api-server...
pnpm run build:api
DATABASE_URL='YOUR_SUPABASE_POSTGRESQL_URL' pnpm run migrate:db
NODE_ENV=production DATABASE_URL='YOUR_SUPABASE_POSTGRESQL_URL' PORT=4000 node --enable-source-maps artifacts/api-server/dist/index.mjs
```

See `HOSTINGER_DEPLOYMENT.md` for the VPS-specific environment variables.
