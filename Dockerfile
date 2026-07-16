FROM node:20-slim

RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./

# Copy all packages needed for the API server
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# Install dependencies (ignore preinstall hook which requires sh)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build shared libs then API server
RUN pnpm --filter @workspace/api-zod build 2>/dev/null || true
RUN pnpm --filter @workspace/db build 2>/dev/null || true
RUN pnpm --filter @workspace/api-server run build

EXPOSE ${PORT:-4000}

ENV NODE_ENV=production

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
