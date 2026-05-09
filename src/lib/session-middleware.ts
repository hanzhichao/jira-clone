import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { eq } from 'drizzle-orm';
import 'server-only';

import { AUTH_COOKIE } from '@/features/auth/constants';
import { db, users, sessions } from '@/db';

type AdditionalContext = {
  Variables: {
    user: typeof users.$inferSelect;
  };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(async (ctx, next) => {
  const sessionId = getCookie(ctx, AUTH_COOKIE);

  if (!sessionId) {
    return ctx.json({ error: 'Unauthorized.' }, 401);
  }

  const [sessionWithUser] = await db
    .select({
      user: users,
      session: sessions,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId));

  if (!sessionWithUser || sessionWithUser.session.expiresAt < new Date()) {
    return ctx.json({ error: 'Unauthorized.' }, 401);
  }

  ctx.set('user', sessionWithUser.user);

  await next();
});
