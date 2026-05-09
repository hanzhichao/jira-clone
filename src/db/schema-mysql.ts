import { sql } from "drizzle-orm";
import { text, int, mysqlTable, datetime } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const workspaces = mysqlTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  imageId: text("image_id"),
  inviteCode: text("invite_code").notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const members = mysqlTable("members", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  workspaceId: text("workspace_id").notNull(),
  role: text("role").notNull(), // ADMIN, MEMBER
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projects = mysqlTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  description: text("description"),
  imageId: text("image_id"),
  workspaceId: text("workspace_id").notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const tasks = mysqlTable("tasks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  type: text("type").notNull().default("TASK"),
  workspaceId: text("workspace_id").notNull(),
  projectId: text("project_id"),
  assigneeId: text("assignee_id"),
  description: text("description"),
  dueDate: datetime("due_date"),
  position: int("position").notNull(),
  parentId: text("parent_id"),
  links: text("links"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = mysqlTable("sessions", {
  id: text("id").primaryKey(), // The session secret/ID stored in cookie
  userId: text("user_id").notNull(),
  expiresAt: datetime("expires_at").notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});