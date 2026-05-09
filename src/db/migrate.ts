import { createDb } from "./adapter";

const DB_TYPE = process.env.DB_TYPE || "sqlite";
const RESET = process.argv.includes("--reset");

const DROP_SQLITE = [
  "DROP TABLE IF EXISTS sessions",
  "DROP TABLE IF EXISTS tasks",
  "DROP TABLE IF EXISTS projects",
  "DROP TABLE IF EXISTS members",
  "DROP TABLE IF EXISTS workspaces",
  "DROP TABLE IF EXISTS users",
];

const DROP_MYSQL = [
  "DROP TABLE IF EXISTS sessions",
  "DROP TABLE IF EXISTS tasks",
  "DROP TABLE IF EXISTS projects",
  "DROP TABLE IF EXISTS members",
  "DROP TABLE IF EXISTS workspaces",
  "DROP TABLE IF EXISTS users",
];

const DROP_POSTGRES = [
  "DROP TABLE IF EXISTS sessions CASCADE",
  "DROP TABLE IF EXISTS tasks CASCADE",
  "DROP TABLE IF EXISTS projects CASCADE",
  "DROP TABLE IF EXISTS members CASCADE",
  "DROP TABLE IF EXISTS workspaces CASCADE",
  "DROP TABLE IF EXISTS users CASCADE",
];

const CREATE_SQLITE = {
  users: `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`,
  workspaces: `CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, name TEXT NOT NULL, user_id TEXT NOT NULL, image_id TEXT, invite_code TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`,
  members: `CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, workspace_id TEXT NOT NULL, role TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`,
  projects: `CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, key TEXT NOT NULL, description TEXT, image_id TEXT, workspace_id TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`,
  tasks: `CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'TASK', workspace_id TEXT NOT NULL, project_id TEXT, assignee_id TEXT, description TEXT, due_date TEXT, position INTEGER NOT NULL, parent_id TEXT, links TEXT, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`,
  sessions: `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`,
};

const CREATE_MYSQL = {
  users: `CREATE TABLE IF NOT EXISTS users (id VARCHAR(50) PRIMARY KEY, name VARCHAR(256) NOT NULL, email VARCHAR(256) NOT NULL UNIQUE, password VARCHAR(256) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  workspaces: `CREATE TABLE IF NOT EXISTS workspaces (id VARCHAR(50) PRIMARY KEY, name VARCHAR(256) NOT NULL, user_id VARCHAR(50) NOT NULL, image_id VARCHAR(50), invite_code VARCHAR(10) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  members: `CREATE TABLE IF NOT EXISTS members (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) NOT NULL, workspace_id VARCHAR(50) NOT NULL, role VARCHAR(20) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  projects: `CREATE TABLE IF NOT EXISTS projects (id VARCHAR(50) PRIMARY KEY, name VARCHAR(256) NOT NULL, key VARCHAR(256) NOT NULL, description TEXT, image_id VARCHAR(50), workspace_id VARCHAR(50) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  tasks: `CREATE TABLE IF NOT EXISTS tasks (id VARCHAR(50) PRIMARY KEY, name VARCHAR(256) NOT NULL, status VARCHAR(20) NOT NULL, type VARCHAR(20) NOT NULL DEFAULT 'TASK', workspace_id VARCHAR(50) NOT NULL, project_id VARCHAR(50), assignee_id VARCHAR(50), description TEXT, due_date DATETIME, position INT NOT NULL, parent_id VARCHAR(50), links TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  sessions: `CREATE TABLE IF NOT EXISTS sessions (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
};

const CREATE_POSTGRES = {
  users: `CREATE TABLE IF NOT EXISTS users (id VARCHAR(50) PRIMARY KEY, name VARCHAR(256) NOT NULL, email VARCHAR(256) NOT NULL UNIQUE, password VARCHAR(256) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  workspaces: `CREATE TABLE IF NOT EXISTS workspaces (id VARCHAR(50) PRIMARY KEY, name VARCHAR(256) NOT NULL, user_id VARCHAR(50) NOT NULL, image_id VARCHAR(50), invite_code VARCHAR(10) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  members: `CREATE TABLE IF NOT EXISTS members (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) NOT NULL, workspace_id VARCHAR(50) NOT NULL, role VARCHAR(20) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  projects: `CREATE TABLE IF NOT EXISTS projects (id VARCHAR(50) PRIMARY KEY, name VARCHAR(256) NOT NULL, key VARCHAR(256) NOT NULL, description TEXT, image_id VARCHAR(50), workspace_id VARCHAR(50) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  tasks: `CREATE TABLE IF NOT EXISTS tasks (id VARCHAR(50) PRIMARY KEY, name VARCHAR(256) NOT NULL, status VARCHAR(20) NOT NULL, type VARCHAR(20) NOT NULL DEFAULT 'TASK', workspace_id VARCHAR(50) NOT NULL, project_id VARCHAR(50), assignee_id VARCHAR(50), description TEXT, due_date TIMESTAMP, position INTEGER NOT NULL, parent_id VARCHAR(50), links TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  sessions: `CREATE TABLE IF NOT EXISTS sessions (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) NOT NULL, expires_at TIMESTAMP NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
};

const DROP_MAP = { sqlite: DROP_SQLITE, mysql: DROP_MYSQL, postgresql: DROP_POSTGRES };
const CREATE_MAP = { sqlite: CREATE_SQLITE, mysql: CREATE_MYSQL, postgresql: CREATE_POSTGRES };

async function migrate() {
  console.log(`Running migrations for ${DB_TYPE}${RESET ? " (RESET)" : ""}...`);
  const { execute } = createDb();
  const dropSql = DROP_MAP[DB_TYPE] || DROP_SQLITE;
  const createSql = CREATE_MAP[DB_TYPE] || CREATE_SQLITE;

  try {
    if (RESET) {
      for (const query of dropSql) {
        await execute(query);
      }
      console.log("✓ Tables dropped");
    }

    for (const [table, query] of Object.entries(createSql)) {
      await execute(query);
      console.log(`✓ ${table} table created`);
    }
    console.log("\n✓ All migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
  process.exit(0);
}

migrate();