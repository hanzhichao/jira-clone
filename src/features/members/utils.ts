import { and, eq } from 'drizzle-orm';

import { db, members } from '@/db';

interface GetMemberProps {
  workspaceId: string;
  userId: string;
}

export const getMember = async ({ workspaceId, userId }: GetMemberProps) => {
  const [member] = await db
    .select()
    .from(members)
    .where(and(eq(members.workspaceId, workspaceId), eq(members.userId, userId)));

  return member;
};
