import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, inArray, asc } from 'drizzle-orm';

import { getMember } from '@/features/members/utils';
import { createTaskSchema } from '@/features/tasks/schema';
import { type Task, TaskStatus, TaskType } from '@/features/tasks/types';
import { sessionMiddleware } from '@/lib/session-middleware';
import { db, tasks, projects, members, users } from '@/db';

const app = new Hono()
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        type: z.nativeEnum(TaskType).nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
      }),
    ),
    async (ctx) => {
      const user = ctx.get('user');
      const { workspaceId, projectId, assigneeId, status, type, search, dueDate } = ctx.req.valid('query');

      const member = await getMember({
        workspaceId,
        userId: user.id,
      });

      if (!member) {
        return ctx.json({ error: 'Unauthorized.' }, 401);
      }

      const conditions = [eq(tasks.workspaceId, workspaceId)];

      if (projectId) conditions.push(eq(tasks.projectId, projectId));
      if (status) conditions.push(eq(tasks.status, status));
      if (type) conditions.push(eq(tasks.type, type));
      if (assigneeId) conditions.push(eq(tasks.assigneeId, assigneeId));
      if (dueDate) conditions.push(eq(tasks.dueDate, dueDate));
      // search is simplified for now
      // if (search) conditions.push(like(tasks.name, `%${search}%`));

      const allTasks = await db
        .select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(desc(tasks.createdAt));

      const projectIds = Array.from(new Set(allTasks.map((task) => task.projectId)));
      const assigneeIds = Array.from(new Set(allTasks.map((task) => task.assigneeId)));

      const dbProjects = projectIds.length > 0 
        ? await db.select().from(projects).where(inArray(projects.id, projectIds))
        : [];

      const dbMembers = assigneeIds.length > 0
        ? await db
            .select({
                member: members,
                user: users,
            })
            .from(members)
            .innerJoin(users, eq(members.userId, users.id))
            .where(inArray(members.id, assigneeIds))
        : [];

      const populatedTasks = allTasks.map((task) => {
        const project = dbProjects.find((p) => p.id === task.projectId);
        const memberWithUser = dbMembers.find((m) => m.member.id === task.assigneeId);

        return {
          ...task,
          $id: task.id,
          project: project ? { ...project, $id: project.id, imageUrl: project.imageId } : null,
          assignee: memberWithUser ? { ...memberWithUser.member, $id: memberWithUser.member.id, name: memberWithUser.user.name, email: memberWithUser.user.email } : null,
        };
      });

      return ctx.json({
        data: {
          documents: populatedTasks,
          total: populatedTasks.length,
        },
      });
    },
  )
  .get('/:taskId', sessionMiddleware, async (ctx) => {
    const { taskId } = ctx.req.param();
    const currentUser = ctx.get('user');

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) {
        return ctx.json({ error: 'Task not found.' }, 404);
    }

    const currentMember = await getMember({
      workspaceId: task.workspaceId,
      userId: currentUser.id,
    });

    if (!currentMember) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    const [project] = await db.select().from(projects).where(eq(projects.id, task.projectId));
    const [memberWithUser] = await db
        .select({
            member: members,
            user: users,
        })
        .from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .where(eq(members.id, task.assigneeId));

    return ctx.json({
      data: {
        ...task,
        $id: task.id,
        project: project ? { ...project, $id: project.id, imageUrl: project.imageId } : null,
        assignee: memberWithUser ? { ...memberWithUser.member, $id: memberWithUser.member.id, name: memberWithUser.user.name, email: memberWithUser.user.email } : null,
      },
    });
  })
  .post('/', sessionMiddleware, zValidator('json', createTaskSchema), async (ctx) => {
    const user = ctx.get('user');
    const { name, status, type, priority, workspaceId, projectId, dueDate, assigneeId, description, parentId } = ctx.req.valid('json');

    const member = await getMember({
      workspaceId,
      userId: user.id,
    });

    if (!member) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    const highestPositionTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.status, status), eq(tasks.workspaceId, workspaceId)))
      .orderBy(asc(tasks.position))
      .limit(1);

    const newPosition = highestPositionTask.length > 0 ? highestPositionTask[0].position + 1000 : 1000;

    const taskId = crypto.randomUUID();
    const task = {
      id: taskId,
      name,
      status,
      type: type ?? 'TASK',
      priority: priority ?? null,
      workspaceId,
      projectId: projectId ?? null,
      dueDate: dueDate ? dueDate.toISOString() : null,
      assigneeId: assigneeId ?? null,
      description: description ?? null,
      parentId: parentId ?? null,
      position: newPosition,
    } as any;

    await db.insert(tasks).values(task);

    return ctx.json({ data: { ...task, $id: taskId } });
  })
  .patch('/:taskId', sessionMiddleware, zValidator('json', createTaskSchema.partial()), async (ctx) => {
    const user = ctx.get('user');
    const { name, status, type, priority, description, projectId, dueDate, assigneeId, parentId } = ctx.req.valid('json');
    const { taskId } = ctx.req.param();

    const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!existingTask) {
        return ctx.json({ error: 'Task not found.' }, 404);
    }

    const member = await getMember({
      workspaceId: existingTask.workspaceId,
      userId: user.id,
    });

    if (!member) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (status !== undefined) updateData.status = status;
    if (type !== undefined) updateData.type = type;
    if (priority !== undefined) updateData.priority = priority;
    if (description !== undefined) updateData.description = description;
    if (projectId !== undefined) updateData.projectId = projectId;
    if (dueDate !== undefined) updateData.dueDate = dueDate.toISOString();
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (parentId !== undefined) updateData.parentId = parentId;

    await db.update(tasks).set(updateData).where(eq(tasks.id, taskId));

    const [updatedTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    return ctx.json({ data: { ...updatedTask, $id: updatedTask.id } });
  })
  .post(
    '/bulk-update',
    sessionMiddleware,
    zValidator(
      'json',
      z.object({
        tasks: z.array(
          z.object({
            $id: z.string(),
            status: z.nativeEnum(TaskStatus),
            position: z.number().int().positive().min(1000).max(1_00_000),
          }),
        ),
      }),
    ),
    async (ctx) => {
      const user = ctx.get('user');
      const { tasks: tasksToUpdateInBulk } = ctx.req.valid('json');

      const dbTasks = await db
        .select()
        .from(tasks)
        .where(inArray(tasks.id, tasksToUpdateInBulk.map((t) => t.$id)));

      const workspaceIds = new Set(dbTasks.map((task) => task.workspaceId));

      if (workspaceIds.size !== 1) {
        return ctx.json({ error: 'All tasks must belong to the same workspace.' }, 401);
      }

      const workspaceId = workspaceIds.values().next().value!;

      const member = await getMember({
        workspaceId,
        userId: user.id,
      });

      if (!member) {
        return ctx.json({ error: 'Unauthorized.' }, 401);
      }

      const updatedTasks = await Promise.all(
        tasksToUpdateInBulk.map(async (task) => {
          const { $id, status, position } = task;
          await db.update(tasks).set({ status, position }).where(eq(tasks.id, $id));
          const [updated] = await db.select().from(tasks).where(eq(tasks.id, $id));
          return { ...updated, $id: updated.id };
        }),
      );

      return ctx.json({ data: { updatedTasks, workspaceId } });
    },
  )
  .delete('/:taskId', sessionMiddleware, async (ctx) => {
    const user = ctx.get('user');
    const { taskId } = ctx.req.param();

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) {
        return ctx.json({ error: 'Task not found.' }, 404);
    }

    const member = await getMember({
      workspaceId: task.workspaceId,
      userId: user.id,
    });

    if (!member) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));

    return ctx.json({ data: { ...task, $id: task.id } });
  });

export default app;
