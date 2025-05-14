import { MiddlewareHandler } from 'hono';
//import * as jwt from 'jsonwebtoken';
import {verify} from "hono/jwt";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.text('Unauthorized', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verify(token, process.env.JWT_SECRET!) as unknown as {
      userId: number;
      role: string;
    };
    c.set('user', payload);
    await next();
  } catch {
    return c.text('Invalid or expired token', 401);
  }
};

export const adminOnly: MiddlewareHandler = async (c, next) => {
  const user = c.get('user');
  if (user?.role !== 'admin') {
    return c.text('Admin access only', 403);
  }
  await next();
};
