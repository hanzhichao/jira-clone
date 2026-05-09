import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

import { MemberRole } from '@/features/members/types';
import { getMember } from '@/features/members/utils';
import { sessionMiddleware } from '@/lib/session-middleware';
import { db, members, users } from '@/db';

const app = new Hono()
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

      const allMembers = await db
        .select({
          member: members,
          user: users,
        })
        .from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .where(eq(members.workspaceId, workspaceId));

      const populatedMembers = allMembers.map(({ member, user }) => ({
        ...member,
        $id: member.id,
        name: user.name,
        email: user.email,
      }));

      return ctx.json({
        data: {
          documents: populatedMembers,
          total: populatedMembers.length,
        },
      });
    },
  )
  .delete('/:memberId', sessionMiddleware, async (ctx) => {
    const { memberId } = ctx.req.param();
    const user = ctx.get('user');

    const [memberToDelete] = await db.select().from(members).where(eq(members.id, memberId));
    if (!memberToDelete) {
        return ctx.json({ error: 'Member not found.' }, 404);
    }

    const allMembersInWorkspace = await db
      .select()
      .from(members)
      .where(eq(members.workspaceId, memberToDelete.workspaceId));

    if (allMembersInWorkspace.length === 1) {
      return ctx.json({ error: 'Cannot delete the only member.' }, 400);
    }

    const member = await getMember({
      workspaceId: memberToDelete.workspaceId,
      userId: user.id,
    });

    if (!member) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    if (member.id !== memberToDelete.id && member.role !== MemberRole.ADMIN) {
      return ctx.json({ error: 'Unauthorized.' }, 401);
    }

    await db.delete(members).where(eq(members.id, memberId));

    return ctx.json({ data: { $id: memberToDelete.id, workspaceId: memberToDelete.workspaceId } });
  })
  .patch(
    '/:memberId',
    sessionMiddleware,
    zValidator(
      'json',
      z.object({
        role: z.nativeEnum(MemberRole),
      }),
    ),
    async (ctx) => {
      const { memberId } = ctx.req.param();
      const { role } = ctx.req.valid('json');
      const user = ctx.get('user');

      const [memberToUpdate] = await db.select().from(members).where(eq(members.id, memberId));
      if (!memberToUpdate) {
          return ctx.json({ error: 'Member not found.' }, 404);
      }

      const allMembersInWorkspace = await db
        .select()
        .from(members)
        .where(eq(members.workspaceId, memberToUpdate.workspaceId));

      if (allMembersInWorkspace.length === 1) {
        return ctx.json({ error: 'Cannot downgrade the only member.' }, 400);
      }

      const member = await getMember({
        workspaceId: memberToUpdate.workspaceId,
        userId: user.id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return ctx.json({ error: 'Unauthorized.' }, 401);
      }

      await db.update(members).set({ role }).where(eq(members.id, memberId));

      return ctx.json({ data: { $id: memberToUpdate.id, workspaceId: memberToUpdate.workspaceId } });
    },
  );

export default app;
