import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';

import { AUTH_COOKIE } from '@/features/auth/constants';
import { db } from '@/db';
import { users, sessions } from '@/db/schema';

export const getCurrent = async () => {
  try {
    const sessionToken = cookies().get(AUTH_COOKIE);
    if (!sessionToken?.value) return null;

    const [sessionWithUser] = await db
      .select({
        user: users,
        session: sessions,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, sessionToken.value));

    if (!sessionWithUser || sessionWithUser.session.expiresAt < new Date()) {
      return null;
    }

    const { password, ...userWithoutPassword } = sessionWithUser.user;

    return { ...userWithoutPassword, $id: userWithoutPassword.id };
  } catch {
    return null;
  }
};
