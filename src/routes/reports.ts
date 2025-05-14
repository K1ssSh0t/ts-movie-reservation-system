import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/client';
import { reservations, showtimes, movies, seats } from '../db/schema';
import { authMiddleware, adminOnly } from '../middleware/auth';
import {eq , between, count, sql} from 'drizzle-orm';

const router = new Hono();

router.use('*', authMiddleware, adminOnly);

const ReportSchema = z.object({
  start: z.string().refine((s) => !isNaN(Date.parse(s))),
  end: z.string().refine((s) => !isNaN(Date.parse(s))),
});

// GET resumen de reservas
router.get('/reservations', async (c) => {
  const { start, end } = ReportSchema.parse(c.req.query());
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Total por película
  const perMovie = await db
      .select({
          title: movies.title,
          totalReservations: count(reservations.id).as('count'),
      })
      .from(reservations)
      .innerJoin(showtimes, eq(showtimes.id, reservations.showtimeId))
      .innerJoin(movies, eq(movies.id, showtimes.movieId))
      .where(between(reservations.createdAt, startDate, endDate))
      .groupBy(movies.title);

  // Capacidad y ocupación
  const occupancy = await db.execute(sql
    `SELECT 
       s.id as showtime_id,
       m.title,
       COUNT(r.id) as booked,
       s.capacity,
       ROUND( COUNT(r.id)::decimal / s.capacity * 100, 2 ) as occupancy_pct
     FROM showtimes s
     JOIN movies m ON m.id = s.movie_id
     LEFT JOIN reservations r ON r.showtime_id = s.id
     WHERE s.starts_at BETWEEN ${startDate} AND ${endDate}
     GROUP BY s.id, m.title, s.capacity;`)
    .then((r) => r);

  return c.json({ perMovie, occupancy });
});

export default router;
