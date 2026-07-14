import dotenv from "dotenv";
import { existsSync } from "fs";
import path from "path";

const envPaths = [
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(process.cwd(), ".env"),
];

const primaryEnvPath = envPaths.find((envPath) => existsSync(envPath));

for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
}

// Make DATABASE_URL stable across different process cwd values.
if (primaryEnvPath && process.env.DATABASE_URL && !path.isAbsolute(process.env.DATABASE_URL)) {
  const dbPath = process.env.DATABASE_URL.replace(/^sqlite:/, "").replace(/^file:/, "");
  process.env.DATABASE_URL = path.resolve(path.dirname(primaryEnvPath), dbPath);
}
