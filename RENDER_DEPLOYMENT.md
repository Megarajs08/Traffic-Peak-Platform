# Render API deployment

The Render service is the Express API at `artifacts/api-server`. The React
application is intentionally not built or served by this service.

## Render Web Service settings

| Setting | Value |
| --- | --- |
| Root Directory | Leave blank (repository root, or `.`) |
| Runtime | Node |
| Build Command | `pnpm install --frozen-lockfile --filter @workspace/api-server... && pnpm run build:api` |
| Start Command | `pnpm run start:api` |
| Health Check Path | `/api/healthz` |

`render.yaml` contains the same configuration and can be used with Render's
Blueprint flow.

## Persistent SQLite storage

Attach a Persistent Disk at `/var/data` and set:

```text
DATABASE_URL=/var/data/typingpeak.db
```

Without a persistent disk, SQLite data is erased whenever Render replaces the
service instance or deploys a new version.

## Environment variables

Required:

```text
NODE_ENV=production
DATABASE_URL=/var/data/typingpeak.db
FRONTEND_URL=https://your-frontend.example.com
API_BASE_URL=https://your-render-service.onrender.com
```

`PORT` is supplied by Render and must not be hard-coded. `FRONTEND_URL` can be
a comma-separated list when more than one frontend origin needs browser access.

Set the following only when Google sign-in is enabled:

```text
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://your-render-service.onrender.com/api/auth/google/callback
```

For the optional admin seed script, set `ADMIN_EMAIL`, `ADMIN_USERNAME`, and a
strong `ADMIN_PASSWORD` before running the seed script as a one-off job. They
are not required for the web service to start.

## Verification

After deployment, open:

```text
https://your-render-service.onrender.com/api/healthz
```

It must return `{"status":"ok"}`.

## Frontend note

This service exposes the API at `/api/*`. The existing frontend uses relative
`/api` requests, so a separately hosted frontend needs a reverse proxy or its
own API-base configuration to route `/api` to this Render URL. No frontend code
was changed as part of the backend deployment preparation.
