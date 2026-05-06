import { cookies } from 'next/headers';
import { desc, eq, inArray } from 'drizzle-orm';

import { AUTH_COOKIE } from '@/features/auth/constants';
import { db } from '@/db';
import { members, sessions, users, workspaces } from '@/db/schema';

export const getWorkspaces = async () => {
  try {
    const sessionToken = cookies().get(AUTH_COOKIE);
    if (!sessionToken?.value) return { documents: [], total: 0 };

    const [sessionWithUser] = await db
      .select({
        user: users,
        session: sessions,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, sessionToken.value));

    if (!sessionWithUser || sessionWithUser.session.expiresAt < new Date()) {
      return { documents: [], total: 0 };
    }

    const user = sessionWithUser.user;

    const userMembers = await db.select().from(members).where(eq(members.userId, user.id));

    if (userMembers.length === 0) return { documents: [], total: 0 };

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

    return {
      documents,
      total: documents.length,
    };
  } catch {
    return { documents: [], total: 0 };
  }
};
