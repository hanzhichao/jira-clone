import { zValidator } from '@hono/zod-validator';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, inArray, desc, gte, lte, ne, lt } from 'drizzle-orm';

import { MemberRole } from '@/features/members/types';
import { getMember } from '@/features/members/utils';
import { createWorkspaceSchema, updateWorkspaceSchema } from '@/features/workspaces/schema';
import { sessionMiddleware } from '@/lib/session-middleware';
import { generateInviteCode } from '@/lib/utils';
import { db } from '@/db';
import { workspaces, members, projects, tasks } from '@/db/schema';
import { TaskStatus } from '@/features/tasks/types';

const app = new Hono()
  .get('/', sessionMiddleware, async (ctx) => {
    const user = ctx.get('user');

    const userMembers = await db
      .select()
      .from(members)
      .where(eq(members.userId, user.id));

    if (userMembers.length === 0) {
      return ctx.json({ data: { documents: [], total: 0 } });
    }

    const workspaceIds = userMembers.map((member) => member.workspaceId);

    const userWorkspaces = await db
      .select()
      .from(workspaces)
      .where(inArray(workspaces.id, workspaceIds))
      .orderBy(desc(workspaces.createdAt));

    const documents = userWorkspaces.map((workspace) => ({
      ...workspace,
      $id: workspace.id,
      $createdAt: workspace.createdAt,
      $updatedAt: workspace.updatedAt,
      imageUrl: workspace.imageId,
    }));

    return ctx.json({
      data: {
        documents,
        total: documents.length,
      },
    });
  })
  .post('/', zValidator('form', createWorkspaceSchema), sessionMiddleware, async (ctx) => {
    const user = ctx.get('user');
    const { name, image } = ctx.req.valid('form');

    let uploadedImageId: string | undefined = undefined;

    if (image instanceof File) {
      const buffer = await image.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      uploadedImageId = `data:${image.type};base64,${base64}`;
    } else {
      uploadedImageId = image;
    }

    const workspaceId = crypto.randomUUID();
    const workspace = {
      id: workspaceId,
      name,
      userId: user.id,
      imageId: uploadedImageId,
      inviteCode: generateInviteCode(6),
    };

    await db.insert(workspaces).values(workspace);

    await db.insert(members).values({
      id: crypto.randomUUID(),
      userId: user.id,
      workspaceId: workspaceId,
      role: MemberRole.ADMIN,
    });

    return ctx.json({ data: { ...workspace, $id: workspace.id } });
  })
  .get('/:workspaceId', sessionMiddleware, async (ctx) => {
    const user = ctx.get('user');
    const { workspaceId } = ctx.req.param();

    const member = await getMember({
      workspaceId,
      userId: user.id,
    });

    if (!member) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));

    if (!workspace) {
      return ctx.json({ error: 'Workspace not found.' }, 404);
    }

    return ctx.json({
      data: {
        ...workspace,
        $id: workspace.id,
        imageUrl: workspace.imageId,
      },
    });
  })
  .get('/:workspaceId/info', sessionMiddleware, async (ctx) => {
    const { workspaceId } = ctx.req.param();

    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));

    if (!workspace) {
      return ctx.json({ error: 'Workspace not found.' }, 404);
    }

    return ctx.json({
      data: {
        $id: workspace.id,
        name: workspace.name,
      },
    });
  })
  .patch('/:workspaceId', sessionMiddleware, zValidator('form', updateWorkspaceSchema), async (ctx) => {
    const user = ctx.get('user');
    const { workspaceId } = ctx.req.param();
    const { name, image } = ctx.req.valid('form');

    const member = await getMember({
      workspaceId,
      userId: user.id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    let uploadedImageId: string | undefined = undefined;

    if (image instanceof File) {
      const buffer = await image.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      uploadedImageId = `data:${image.type};base64,${base64}`;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (uploadedImageId) updateData.imageId = uploadedImageId;

    await db.update(workspaces).set(updateData).where(eq(workspaces.id, workspaceId));

    const [updatedWorkspace] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));

    return ctx.json({ data: { ...updatedWorkspace, $id: updatedWorkspace.id } });
  })
  .delete('/:workspaceId', sessionMiddleware, async (ctx) => {
    const user = ctx.get('user');
    const { workspaceId } = ctx.req.param();

    const member = await getMember({
      workspaceId,
      userId: user.id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    // Cascading deletes manually as SQLite might not have it configured in schema yet
    await db.delete(tasks).where(eq(tasks.workspaceId, workspaceId));
    await db.delete(projects).where(eq(projects.workspaceId, workspaceId));
    await db.delete(members).where(eq(members.workspaceId, workspaceId));
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));

    return ctx.json({ data: { $id: workspaceId } });
  })
  .post('/:workspaceId/resetInviteCode', sessionMiddleware, async (ctx) => {
    const user = ctx.get('user');
    const { workspaceId } = ctx.req.param();

    const member = await getMember({
      workspaceId,
      userId: user.id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    const newInviteCode = generateInviteCode(6);
    await db.update(workspaces).set({ inviteCode: newInviteCode }).where(eq(workspaces.id, workspaceId));

    const [updatedWorkspace] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));

    return ctx.json({ data: { ...updatedWorkspace, $id: updatedWorkspace.id } });
  })
  .post(
    '/:workspaceId/join',
    sessionMiddleware,
    zValidator(
      'json',
      z.object({
        code: z.string(),
      }),
    ),
    async (ctx) => {
      const { workspaceId } = ctx.req.param();
      const { code } = ctx.req.valid('json');
      const user = ctx.get('user');

      const member = await getMember({
        workspaceId,
        userId: user.id,
      });

      if (member) {
        return ctx.json({ error: 'Already a member.' }, 400);
      }

      const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));

      if (!workspace || workspace.inviteCode !== code) {
        return ctx.json({ error: 'Invalid invite code.' }, 400);
      }

      await db.insert(members).values({
        id: crypto.randomUUID(),
        workspaceId,
        userId: user.id,
        role: MemberRole.MEMBER,
      });

      return ctx.json({ data: { ...workspace, $id: workspace.id } });
    },
  )
  .get('/:workspaceId/analytics', sessionMiddleware, async (ctx) => {
    const user = ctx.get('user');
    const { workspaceId } = ctx.req.param();

    const member = await getMember({
      workspaceId,
      userId: user.id,
    });

    if (!member) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now).toISOString();
    const thisMonthEnd = endOfMonth(now).toISOString();
    const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString();
    const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString();

    const fetchTaskAnalytics = async (filter: any = {}) => {
      const thisMonth = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.workspaceId, workspaceId),
            gte(tasks.createdAt, thisMonthStart),
            lte(tasks.createdAt, thisMonthEnd),
            ...Object.entries(filter).map(([key, val]) => eq((tasks as any)[key], val))
          )
        );

      const lastMonth = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.workspaceId, workspaceId),
            gte(tasks.createdAt, lastMonthStart),
            lte(tasks.createdAt, lastMonthEnd),
            ...Object.entries(filter).map(([key, val]) => eq((tasks as any)[key], val))
          )
        );

      return {
        count: thisMonth.length,
        difference: thisMonth.length - lastMonth.length,
      };
    };

    const taskAnalytics = await fetchTaskAnalytics();
    const assignedTaskAnalytics = await fetchTaskAnalytics({ assigneeId: member.id });
    const incompleteTaskAnalytics = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.workspaceId, workspaceId),
            ne(tasks.status, TaskStatus.DONE),
            gte(tasks.createdAt, thisMonthStart),
            lte(tasks.createdAt, thisMonthEnd),
          )
        );
    const lastMonthIncompleteTaskAnalytics = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.workspaceId, workspaceId),
            ne(tasks.status, TaskStatus.DONE),
            gte(tasks.createdAt, lastMonthStart),
            lte(tasks.createdAt, lastMonthEnd),
          )
        );

    const completedTaskAnalytics = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.workspaceId, workspaceId),
            eq(tasks.status, TaskStatus.DONE),
            gte(tasks.createdAt, thisMonthStart),
            lte(tasks.createdAt, thisMonthEnd),
          )
        );
    const lastMonthCompletedTaskAnalytics = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.workspaceId, workspaceId),
            eq(tasks.status, TaskStatus.DONE),
            gte(tasks.createdAt, lastMonthStart),
            lte(tasks.createdAt, lastMonthEnd),
          )
        );

    const overdueTaskAnalytics = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.workspaceId, workspaceId),
            ne(tasks.status, TaskStatus.DONE),
            lt(tasks.dueDate, now.toISOString()),
            gte(tasks.createdAt, thisMonthStart),
            lte(tasks.createdAt, thisMonthEnd),
          )
        );
    const lastMonthOverdueTaskAnalytics = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.workspaceId, workspaceId),
            ne(tasks.status, TaskStatus.DONE),
            lt(tasks.dueDate, now.toISOString()),
            gte(tasks.createdAt, lastMonthStart),
            lte(tasks.createdAt, lastMonthEnd),
          )
        );

    return ctx.json({
      data: {
        taskCount: taskAnalytics.count,
        taskDifference: taskAnalytics.difference,
        assignedTaskCount: assignedTaskAnalytics.count,
        assignedTaskDifference: assignedTaskAnalytics.difference,
        completedTaskCount: completedTaskAnalytics.length,
        completedTaskDifference: completedTaskAnalytics.length - lastMonthCompletedTaskAnalytics.length,
        incompleteTaskCount: incompleteTaskAnalytics.length,
        incompleteTaskDifference: incompleteTaskAnalytics.length - lastMonthIncompleteTaskAnalytics.length,
        overdueTaskCount: overdueTaskAnalytics.length,
        overdueTaskDifference: overdueTaskAnalytics.length - lastMonthOverdueTaskAnalytics.length,
      },
    });
  });

export default app;
