import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

import { AUTH_COOKIE } from '@/features/auth/constants';
import { signInFormSchema, signUpFormSchema } from '@/features/auth/schema';
import { sessionMiddleware } from '@/lib/session-middleware';
import { db } from '@/db';
import { users, sessions } from '@/db/schema';

const app = new Hono()
  .get('/current', sessionMiddleware, (ctx) => {
    const user = ctx.get('user');

    return ctx.json({ data: user });
  })
  .post('/login', zValidator('json', signInFormSchema), async (ctx) => {
    const { email, password } = ctx.req.valid('json');

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return ctx.json({ error: 'Invalid credentials.' }, 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return ctx.json({ error: 'Invalid credentials.' }, 401);
    }

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt,
    });

    setCookie(ctx, AUTH_COOKIE, sessionId, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
    });

    return ctx.json({ success: true });
  })
  .post('/register', zValidator('json', signUpFormSchema), async (ctx) => {
    const { name, email, password } = ctx.req.valid('json');

    const [existingUser] = await db.select().from(users).where(eq(users.email, email));

    if (existingUser) {
      return ctx.json({ error: 'User already exists.' }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
    });

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

    await db.insert(sessions).values({
      id: sessionId,
      userId,
      expiresAt,
    });

    setCookie(ctx, AUTH_COOKIE, sessionId, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
    });

    return ctx.json({ success: true });
  })
  .post('/logout', sessionMiddleware, async (ctx) => {
    const sessionId = getCookie(ctx, AUTH_COOKIE);

    if (sessionId) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }

    deleteCookie(ctx, AUTH_COOKIE);

    return ctx.json({ success: true });
  });

export default app;
