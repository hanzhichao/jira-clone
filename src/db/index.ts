import { createDb } from "./adapter";

const { db, schema, execute } = createDb();

const schemaAny = schema as typeof import("./schema-sqlite");
export const { users, sessions, workspaces, members, projects, tasks } = schemaAny;
export { db, execute };