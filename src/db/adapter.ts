import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import mysql from "mysql2/promise";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import pg from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";

import * as schemaSqlite from "./schema-sqlite";
import * as schemaMysql from "./schema-mysql";
import * as schemaPostgres from "./schema-postgres";

const DB_TYPE = process.env.DB_TYPE || "sqlite";

interface DbResult {
  db: ReturnType<typeof drizzle>;
  schema: typeof schemaSqlite;
  execute: (query: string) => Promise<void>;
  users: typeof schemaSqlite.users;
  workspaces: typeof schemaSqlite.workspaces;
  members: typeof schemaSqlite.members;
  projects: typeof schemaSqlite.projects;
  tasks: typeof schemaSqlite.tasks;
  sessions: typeof schemaSqlite.sessions;
}

function createSqliteDb(): DbResult {
  const dbPath = process.env.DB_PATH || "./sqlite.db";
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema: schemaSqlite });

  const execute = async (query: string) => {
    sqlite.exec(query);
  };

  return { db, schema: schemaSqlite, execute, ...schemaSqlite };
}

function createMysqlDb(): DbResult {
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "3306");
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "jira_clone";

  const connection = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
  });

  const db = drizzleMysql(connection, { schema: schemaMysql });

  const execute = async (query: string) => {
    await connection.query(query);
  };

  return { db, schema: schemaMysql, execute, ...schemaMysql };
}

function createPostgresDb(): DbResult {
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "5432");
  const user = process.env.DB_USER || "postgres";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "jira_clone";

  const client = new pg.Pool({
    host,
    port,
    user,
    password,
    database,
  });

  const db = drizzlePg(client, { schema: schemaPostgres });

  const execute = async (query: string) => {
    await client.query(query);
  };

  return { db, schema: schemaPostgres, execute, ...schemaPostgres };
}

export function createDb(): DbResult {
  switch (DB_TYPE) {
    case "mysql":
      return createMysqlDb();
    case "postgresql":
      return createPostgresDb();
    case "sqlite":
    default:
      return createSqliteDb();
  }
}