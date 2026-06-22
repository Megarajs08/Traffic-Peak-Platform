import { defineConfig } from "drizzle-kit";
import path from "path";

const databaseUrl = process.env.DATABASE_URL ?? "./dev.db";
const isSqlite =
  databaseUrl.startsWith("sqlite:") ||
  databaseUrl.startsWith("file:") ||
  !databaseUrl.includes("://");

const schemaPath = `${__dirname.replace(/\\/g, "/")}/src/schema/**/*.ts`;

export default defineConfig({
  schema: schemaPath,
  dialect: isSqlite ? "sqlite" : "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
