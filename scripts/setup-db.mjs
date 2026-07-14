import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rawUrl = process.env.DATABASE_URL ?? "./lib/db/db/dev.db";
const dbPath = path.resolve(
  __dirname,
  "..",
  rawUrl.replace(/^sqlite:/, "").replace(/^file:/, "")
);

mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  google_id TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  wpm REAL NOT NULL,
  cpm REAL NOT NULL,
  accuracy REAL NOT NULL,
  duration INTEGER NOT NULL,
  mode TEXT NOT NULL DEFAULT 'words',
  error_count INTEGER NOT NULL DEFAULT 0,
  char_count INTEGER NOT NULL DEFAULT 0,
  language TEXT DEFAULT 'english',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  certificate_id TEXT NOT NULL UNIQUE,
  user_id INTEGER REFERENCES users(id),
  test_result_id INTEGER REFERENCES test_results(id),
  recipient_name TEXT NOT NULL,
  wpm REAL NOT NULL,
  accuracy REAL NOT NULL,
  duration INTEGER NOT NULL,
  mode TEXT NOT NULL,
  issued_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL,
  cover_image_url TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  author_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  level TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  lesson_id INTEGER NOT NULL REFERENCES lessons(id),
  wpm REAL NOT NULL DEFAULT 0,
  accuracy REAL NOT NULL DEFAULT 0,
  best_wpm REAL NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hr_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_position TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 300,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  language TEXT NOT NULL DEFAULT 'english',
  content_type TEXT NOT NULL DEFAULT 'words',
  custom_text TEXT,
  passing_wpm INTEGER NOT NULL DEFAULT 40,
  min_accuracy REAL NOT NULL DEFAULT 90,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assessment_candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL REFERENCES hr_assessments(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  ip_address TEXT,
  user_agent TEXT,
  fingerprint TEXT,
  tab_switches INTEGER NOT NULL DEFAULT 0,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  started_at TEXT,
  submitted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assessment_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL REFERENCES assessment_candidates(id),
  assessment_id INTEGER NOT NULL REFERENCES hr_assessments(id),
  wpm REAL NOT NULL,
  cpm REAL NOT NULL,
  accuracy REAL NOT NULL,
  error_count INTEGER NOT NULL,
  char_count INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  passed INTEGER NOT NULL,
  rank INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables created:", tables.map(t => t.name).join(", "));
db.close();
