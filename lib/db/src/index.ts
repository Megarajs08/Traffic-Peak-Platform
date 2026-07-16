import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl?.startsWith("postgres")) {
  throw new Error("DATABASE_URL must be a Supabase PostgreSQL connection string.");
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("supabase") ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
