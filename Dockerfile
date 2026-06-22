FROM node:20-slim

RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./

# Copy all packages needed for the API server
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
COPY scripts/setup-db.mjs ./scripts/

# Install dependencies (ignore preinstall hook which requires sh)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build shared libs then API server
RUN pnpm --filter @workspace/api-zod build 2>/dev/null || true
RUN pnpm --filter @workspace/db build 2>/dev/null || true
RUN pnpm --filter @workspace/api-server run build

# Create data directory for SQLite
RUN mkdir -p /app/data

EXPOSE ${PORT:-4000}

ENV NODE_ENV=production
ENV DATABASE_URL=/app/data/prod.db

CMD ["sh", "-c", "node scripts/setup-db.mjs && node --enable-source-maps artifacts/api-server/dist/index.mjs"]
