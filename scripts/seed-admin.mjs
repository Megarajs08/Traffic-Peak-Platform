import bcrypt from "bcrypt";
import pg from "pg";

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME } = process.env;

if (!DATABASE_URL?.startsWith("postgres")) {
  throw new Error("DATABASE_URL must be the Supabase PostgreSQL connection string.");
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_USERNAME) {
  throw new Error("ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_USERNAME are required.");
}

const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("supabase") ? { rejectUnauthorized: false } : undefined,
});

await client.connect();
try {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await client.query(
    `INSERT INTO users (email, username, password_hash, role, created_at, updated_at)
     VALUES ($1, $2, $3, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT (email) DO UPDATE SET
       username = EXCLUDED.username,
       password_hash = EXCLUDED.password_hash,
       role = 'admin',
       updated_at = CURRENT_TIMESTAMP`,
    [ADMIN_EMAIL, ADMIN_USERNAME, passwordHash],
  );
  console.log(`Admin user ready: ${ADMIN_EMAIL}`);
} finally {
  await client.end();
}
