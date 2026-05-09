import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull().references(() => users.id),
  imageId: text("image_id"),
  inviteCode: text("invite_code").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  role: text("role").notNull(), // ADMIN, MEMBER
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  description: text("description"),
  imageId: text("image_id"),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(), // BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE
  type: text("type").notNull().default("TASK"), // TASK, BUG, TEST, STORY
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  projectId: text("project_id").references(() => projects.id),
  assigneeId: text("assignee_id").references(() => members.id),
  description: text("description"),
  dueDate: text("due_date"),
  position: integer("position").notNull(),
  parentId: text("parent_id"),
  links: text("links"), // JSON
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), // The session secret/ID stored in cookie
  userId: text("user_id").notNull().references(() => users.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
