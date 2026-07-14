module.exports = {
  apps: [
    {
      name: "traffic-peak-api",
      cwd: "./artifacts/api-server",
      script: "node",
      args: "--enable-source-maps ./dist/index.mjs",
      env: {
        NODE_ENV: "development",
        PORT: "4000",
        API_PORT: "4000"
      }
    },
    {
      name: "traffic-peak-frontend",
      cwd: ".",
      script: "node",
      args: "./scripts/static-server.js",
      env: {
        NODE_ENV: "development",
        FRONTEND_PORT: "3000",
        API_PORT: "4000"
      }
    }
  ]
};
