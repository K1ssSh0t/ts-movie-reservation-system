import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/client';
import { showtimes } from '../db/schema';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { generateSeatsForShowtime } from '../utils/generateSeats';
import { between, eq } from 'drizzle-orm';

const router = new Hono();

router.use('*', authMiddleware);

// Schema de creación/actualización
const ShowtimeSchema = z.object({
  movieId: z.number().int(),
  startsAt: z.string().refine((s) => !isNaN(Date.parse(s)), { message: 'Invalid date' }),
  capacity: z.number().int().min(1),
});

// GET showtimes por fecha
router.get('/', async (c) => {
  const date = c.req.query('date')!;
  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const data = await db
    .select()
    .from(showtimes)
    .where(between(showtimes.startsAt, dayStart, dayEnd));
  return c.json(data);
});

// POST crear showtime (solo admin)
router.post('/', adminOnly, async (c) => {
  const { movieId, startsAt, capacity } = ShowtimeSchema.parse(await c.req.json());
  const [st] = await db
    .insert(showtimes)
    .values({
      movieId,
      startsAt: new Date(startsAt),
      capacity,
    })
    .returning();
  // Generar asientos en background
  await generateSeatsForShowtime(st.id, /* rows */ 5, /* perRow */ capacity / 5);
  return c.json(st);
});

// PUT actualizar showtime (solo admin)
router.put('/:id', adminOnly, async (c) => {
  const id = Number(c.req.param('id'));
  const data = ShowtimeSchema.partial().parse(await c.req.json());
  if (data.startsAt) data.startsAt = new Date(data.startsAt as string).toISOString();
  const [updated] = await db
    .update(showtimes)
    .set(data as any)
    .where(eq(showtimes.id, id))
    .returning();
  return c.json(updated);
});

// DELETE showtime (solo admin)
router.delete('/:id', adminOnly, async (c) => {
  const id = Number(c.req.param('id'));
  await db.delete(showtimes).where(eq(showtimes.id, id));
  return c.text('Showtime deleted');
});

export default router;
