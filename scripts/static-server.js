import http from "http";
import https from "https";
import fsSync from "fs";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");
const envPath = path.join(workspaceRoot, ".env");

if (typeof process.loadEnvFile === "function" && fsSync.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const frontendUrl = process.env.FRONTEND_URL;
const frontendUrlPort = frontendUrl ? Number(new URL(frontendUrl).port || 80) : undefined;

const root = path.resolve(
  process.env.STATIC_ROOT || path.join(__dirname, "..", "artifacts", "traffic-peak", "dist", "public"),
);
const port = Number(process.env.FRONTEND_PORT || process.env.PORT || frontendUrlPort || 3000);
const apiPort = Number(process.env.API_PORT || 4000);

const mime = {
  ".html": "text/html",
  ".js":   "application/javascript",
  ".css":  "text/css",
  ".json": "application/json",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".eot":  "application/vnd.ms-fontobject",
};

const getContentType = (filename) =>
  mime[path.extname(filename).toLowerCase()] || "application/octet-stream";

function proxyToApi(req, res) {
  const options = {
    hostname: "127.0.0.1",
    port: apiPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${apiPort}` },
  };

  const proxy = http.request(options, (apiRes) => {
    res.writeHead(apiRes.statusCode, apiRes.headers);
    apiRes.pipe(res, { end: true });
  });

  proxy.on("error", () => {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "API unavailable" }));
  });

  req.pipe(proxy, { end: true });
}

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = new URL(req.url, `http://${req.headers.host}`).pathname;

    // Proxy all /api/* requests to the API server
    if (urlPath.startsWith("/api/")) {
      return proxyToApi(req, res);
    }

    let filePath = path.join(root, decodeURIComponent(urlPath));

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch {
      stats = null;
    }

    if (!stats || stats.isDirectory()) {
      filePath = path.join(root, "index.html");
    }

    const data = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": getContentType(filePath),
      "Cache-Control": "public, max-age=0",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}`);
  console.log(`Serving from ${root}`);
  console.log(`Proxying /api/* → http://127.0.0.1:${apiPort}`);
});
