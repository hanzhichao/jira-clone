import bcrypt from "bcryptjs";
import { createDb } from "./adapter";

async function seed() {
  const { db, users, workspaces, members, projects, tasks, sessions } = createDb();
  console.log("Seeding database with sample data...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const userId1 = "user-demo-001";
  const userId2 = "user-demo-002";
  const workspaceId = "ws-demo-001";
  const projectId1 = "proj-demo-001";
  const projectId2 = "proj-demo-002";

  await db.insert(users).values([
    {
      id: userId1,
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
    },
    {
      id: userId2,
      name: "John Smith",
      email: "john@example.com",
      password: hashedPassword,
    },
  ]);
  console.log("✓ Created users (demo@example.com / password123)");

  await db.insert(workspaces).values({
    id: workspaceId,
    name: "Demo Workspace",
    userId: userId1,
    imageId: null,
    inviteCode: "DEMO123",
  });
  console.log("✓ Created workspace: Demo Workspace");

  await db.insert(members).values([
    {
      id: "member-001",
      userId: userId1,
      workspaceId,
      role: "ADMIN",
    },
    {
      id: "member-002",
      userId: userId2,
      workspaceId,
      role: "MEMBER",
    },
  ]);
  console.log("✓ Created members");

  await db.insert(projects).values([
    {
      id: projectId1,
      name: "Website Redesign",
      imageId: null,
      workspaceId,
    },
    {
      id: projectId2,
      name: "Mobile App",
      imageId: null,
      workspaceId,
    },
  ]);
  console.log("✓ Created projects: Website Redesign, Mobile App");

  await db.insert(tasks).values([
    {
      id: "task-001",
      name: "Design homepage mockup",
      status: "DONE",
      workspaceId,
      projectId: projectId1,
      assigneeId: "member-001",
      description: "Create high-fidelity mockup for the new homepage design",
      dueDate: "2025-05-01T00:00:00.000Z",
      position: 1000,
    },
    {
      id: "task-002",
      name: "Implement responsive navigation",
      status: "IN_PROGRESS",
      workspaceId,
      projectId: projectId1,
      assigneeId: "member-001",
      description: "Build mobile-responsive navigation menu",
      dueDate: "2025-05-15T00:00:00.000Z",
      position: 2000,
    },
    {
      id: "task-003",
      name: "Setup CI/CD pipeline",
      status: "TODO",
      workspaceId,
      projectId: projectId1,
      assigneeId: "member-002",
      description: "Configure GitHub Actions for automated deployment",
      dueDate: "2025-05-20T00:00:00.000Z",
      position: 3000,
    },
    {
      id: "task-004",
      name: "Write API documentation",
      status: "BACKLOG",
      workspaceId,
      projectId: projectId1,
      assigneeId: null,
      description: "Document all REST API endpoints with examples",
      dueDate: null,
      position: 4000,
    },
    {
      id: "task-005",
      name: "Setup project structure",
      status: "DONE",
      workspaceId,
      projectId: projectId2,
      assigneeId: "member-001",
      description: "Initialize React Native project with proper folder structure",
      dueDate: "2025-04-25T00:00:00.000Z",
      position: 1000,
    },
    {
      id: "task-006",
      name: "Implement authentication flow",
      status: "IN_REVIEW",
      workspaceId,
      projectId: projectId2,
      assigneeId: "member-002",
      description: "Add login, signup, and password reset functionality",
      dueDate: "2025-05-10T00:00:00.000Z",
      position: 2000,
    },
    {
      id: "task-007",
      name: "Design app icon",
      status: "TODO",
      workspaceId,
      projectId: projectId2,
      assigneeId: null,
      description: "Create app icon for iOS and Android",
      dueDate: null,
      position: 3000,
    },
  ]);
  console.log("✓ Created 7 tasks with various statuses");

  console.log("\n✓ Database seeded successfully!");
  console.log("\nLogin credentials:");
  console.log("  Email: demo@example.com");
  console.log("  Password: password123");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});