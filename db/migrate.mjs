import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "lingo.db");
console.log(`Migrating database at: ${dbPath}`);

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("busy_timeout = 5000");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS games (
    code TEXT PRIMARY KEY,
    gm_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'lobby',
    current_round INTEGER NOT NULL DEFAULT 0,
    words TEXT NOT NULL,
    round_time INTEGER NOT NULL DEFAULT 30,
    round_start_time INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    game_code TEXT NOT NULL REFERENCES games(code),
    name TEXT NOT NULL,
    total_score INTEGER NOT NULL DEFAULT 0,
    joined_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_code TEXT NOT NULL REFERENCES games(code),
    round_num INTEGER NOT NULL,
    results TEXT NOT NULL DEFAULT '{}'
  );
`);

console.log("Migration complete.");
sqlite.close();
