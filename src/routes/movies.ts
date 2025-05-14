import { Hono } from 'hono';
import { db } from '../db/client';
import { movies } from '../db/schema';
import { z } from 'zod';
import { authMiddleware, adminOnly } from '../middleware/auth';
import {eq} from 'drizzle-orm';

const router = new Hono();

router.use('*', authMiddleware);

const MovieSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  posterUrl: z.string().url().optional(),
  genre: z.string(),
});

// GET todas las películas
router.get('/', async (c) => {
  const data = await db.select().from(movies);
  return c.json(data);
});

// POST nueva película (solo admin)
router.post('/', adminOnly, async (c) => {
  const data = MovieSchema.parse(await c.req.json());
  const [movie] = await db.insert(movies).values(data).returning();
  return c.json(movie);
});

// PUT actualizar película (solo admin)
router.put('/:id', adminOnly, async (c) => {
  const id = Number.parseInt(c.req.param('id'));
  const data = MovieSchema.partial().parse(await c.req.json());
  const [updated] = await db.update(movies).set(data).where(eq(movies.id, id)).returning();
  return c.json(updated);
});

// DELETE película (solo admin)
router.delete('/:id', adminOnly, async (c) => {
  const id = Number.parseInt(c.req.param('id'));
  await db.delete(movies).where(eq(movies.id, id));
  return c.text('Deleted');
});

export default router;
