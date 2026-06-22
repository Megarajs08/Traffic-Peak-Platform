module.exports = {
  apps: [
    {
      name: "traffic-peak-api",
      script: "artifacts/api-server/dist/index.mjs",
      interpreter: "node",
      node_args: "--enable-source-maps",
      cwd: __dirname,
      env: {
        PORT: process.env.API_PORT || 4000,
        DATABASE_URL: process.env.DATABASE_URL || "./lib/db/db/dev.db",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
        GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "http://localhost:4173/api/auth/google/callback",
        FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:4173",
        NODE_ENV: process.env.NODE_ENV || "development",
      },
    },
    {
      name: "traffic-peak-frontend",
      script: "scripts/static-server.js",
      interpreter: "node",
      cwd: __dirname,
      env: {
        PORT: process.env.FRONTEND_PORT || 4173,
        STATIC_ROOT: "artifacts/traffic-peak/dist/public",
      },
    },
  ],
};
