/**
 * Seed script: creates or promotes the primary admin account.
 * Usage:
 *   DATABASE_URL=./lib/db/db/dev.db \
 *   ADMIN_EMAIL=you@example.com \
 *   ADMIN_PASSWORD=YourPassword \
 *   node scripts/seed-admin.mjs
 */

import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Resolve packages from their workspace locations
const requireDb = createRequire(path.join(root, "lib/db/package.json"));
const requireApi = createRequire(path.join(root, "artifacts/api-server/package.json"));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL env var is required");
  console.error("  e.g. DATABASE_URL=./lib/db/db/dev.db node scripts/seed-admin.mjs");
  process.exit(1);
}

const Database = requireDb("better-sqlite3");
const bcrypt = requireApi("bcrypt");

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe@123";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";

const sqlitePath = databaseUrl.replace(/^sqlite:/, "").replace(/^file:/, "");
const db = new Database(path.resolve(root, sqlitePath));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const now = new Date().toISOString();
const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);

const existing = db.prepare("SELECT id, email, role FROM users WHERE email = ?").get(ADMIN_EMAIL);

if (existing) {
  if (existing.role === "admin") {
    console.log(`✓ ${ADMIN_EMAIL} already has admin role (id=${existing.id}). Updating password.`);
    db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(passwordHash, now, existing.id);
  } else {
    db.prepare("UPDATE users SET role = 'admin', password_hash = ?, updated_at = ? WHERE id = ?").run(passwordHash, now, existing.id);
    console.log(`✓ Promoted existing account ${ADMIN_EMAIL} to admin and updated password.`);
  }
} else {
  db.prepare(
    "INSERT INTO users (email, username, name, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, 'admin', ?, ?)"
  ).run(ADMIN_EMAIL, ADMIN_USERNAME, "Admin", passwordHash, now, now);
  console.log(`✓ Created admin account: ${ADMIN_EMAIL}`);
}

console.log("\nDone. Log in at /login with:");
console.log(`  Email:    ${ADMIN_EMAIL}`);
console.log(`  Password: ${ADMIN_PASSWORD}`);

db.close();
