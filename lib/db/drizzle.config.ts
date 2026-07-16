import { defineConfig } from "drizzle-kit";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl?.startsWith("postgres")) {
  throw new Error("DATABASE_URL must be a PostgreSQL connection string.");
}

const schemaPath = `${__dirname.replace(/\\/g, "/")}/src/schema/**/*.ts`;

export default defineConfig({
  schema: schemaPath,
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
