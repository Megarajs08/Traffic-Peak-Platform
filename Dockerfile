FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./

# Copy all packages
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build shared libs first, then API
RUN pnpm --filter @workspace/db build 2>/dev/null || true
RUN pnpm --filter @workspace/api-zod build 2>/dev/null || true
RUN pnpm --filter @workspace/api-spec build 2>/dev/null || true
RUN pnpm --filter @workspace/api-server run build

# Create the database directory
RUN mkdir -p /app/data

# Run DB migrations on startup then start server
COPY scripts/setup-db.mjs ./scripts/

EXPOSE 4000

ENV PORT=4000
ENV NODE_ENV=production
ENV DATABASE_URL=/app/data/prod.db

CMD ["sh", "-c", "DATABASE_URL=$DATABASE_URL node scripts/setup-db.mjs && node --enable-source-maps artifacts/api-server/dist/index.mjs"]
