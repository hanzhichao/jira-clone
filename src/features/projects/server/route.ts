import { zValidator } from '@hono/zod-validator';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, gte, lte, ne, lt } from 'drizzle-orm';

import { getMember } from '@/features/members/utils';
import { createProjectSchema, updateProjectSchema } from '@/features/projects/schema';
import { sessionMiddleware } from '@/lib/session-middleware';
import { db } from '@/db';
import { projects, tasks } from '@/db/schema';
import { TaskStatus } from '@/features/tasks/types';

const app = new Hono()
  .post('/', sessionMiddleware, zValidator('form', createProjectSchema), async (ctx) => {
    const user = ctx.get('user');
    const { name, image, workspaceId } = ctx.req.valid('form');

    const member = await getMember({
      workspaceId,
      userId: user.id,
    });

    if (!member) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    let uploadedImageId: string | undefined = undefined;

    if (image instanceof File) {
      const buffer = await image.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      uploadedImageId = `data:${image.type};base64,${base64}`;
    } else {
      uploadedImageId = image;
    }

    const projectId = crypto.randomUUID();
    const project = {
      id: projectId,
      name,
      imageId: uploadedImageId,
      workspaceId,
    };

    await db.insert(projects).values(project);

    return ctx.json({ data: { ...project, $id: project.id } });
  })
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        workspaceId: z.string(),
      }),
    ),
    async (ctx) => {
      const user = ctx.get('user');
      const { workspaceId } = ctx.req.valid('query');

      const member = await getMember({
        workspaceId,
        userId: user.id,
      });

      if (!member) {
        return ctx.json({ error: 'Unauthorized.' }, 401);
      }

      const userProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.workspaceId, workspaceId))
        .orderBy(desc(projects.createdAt));

      const documents = userProjects.map((project) => ({
        ...project,
        $id: project.id,
        imageUrl: project.imageId,
      }));

      return ctx.json({
        data: {
          documents,
          total: documents.length,
        },
      });
    },
  )
  .get('/:projectId', sessionMiddleware, async (ctx) => {
    const user = ctx.get('user');
    const { projectId } = ctx.req.param();

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) {
        return ctx.json({ error: 'Project not found.' }, 404);
    }

    const member = await getMember({
      workspaceId: project.workspaceId,
      userId: user.id,
    });

    if (!member) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    return ctx.json({
      data: {
        ...project,
        $id: project.id,
        imageUrl: project.imageId,
      },
    });
  })
  .patch('/:projectId', sessionMiddleware, zValidator('form', updateProjectSchema), async (ctx) => {
    const user = ctx.get('user');
    const { projectId } = ctx.req.param();
    const { name, image } = ctx.req.valid('form');

    const [existingProject] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!existingProject) {
        return ctx.json({ error: 'Project not found.' }, 404);
    }

    const member = await getMember({
      workspaceId: existingProject.workspaceId,
      userId: user.id,
    });

    if (!member) {
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

    await db.update(projects).set(updateData).where(eq(projects.id, projectId));

    const [updatedProject] = await db.select().from(projects).where(eq(projects.id, projectId));

    return ctx.json({ data: { ...updatedProject, $id: updatedProject.id } });
  })
  .delete('/:projectId', sessionMiddleware, async (ctx) => {
    const user = ctx.get('user');
    const { projectId } = ctx.req.param();

    const [existingProject] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!existingProject) {
        return ctx.json({ error: 'Project not found.' }, 404);
    }

    const member = await getMember({
      workspaceId: existingProject.workspaceId,
      userId: user.id,
    });

    if (!member) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    await db.delete(tasks).where(eq(tasks.projectId, projectId));
    await db.delete(projects).where(eq(projects.id, projectId));

    return ctx.json({ data: { $id: existingProject.id, workspaceId: existingProject.workspaceId } });
  })
  .get('/:projectId/analytics', sessionMiddleware, async (ctx) => {
    const user = ctx.get('user');
    const { projectId } = ctx.req.param();

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) {
        return ctx.json({ error: 'Project not found.' }, 404);
    }

    const member = await getMember({
      workspaceId: project.workspaceId,
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
              eq(tasks.projectId, projectId),
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
              eq(tasks.projectId, projectId),
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
              eq(tasks.projectId, projectId),
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
              eq(tasks.projectId, projectId),
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
              eq(tasks.projectId, projectId),
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
              eq(tasks.projectId, projectId),
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
              eq(tasks.projectId, projectId),
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
              eq(tasks.projectId, projectId),
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
