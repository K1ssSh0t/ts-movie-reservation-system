import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/client';
import { reservations, reservationSeats, seats, showtimes } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { eq, inArray,and   } from 'drizzle-orm';

type UserContext = {
  Variables: {
    user: { userId: number }
  }
};

const router = new Hono<UserContext>();

router.use('*', authMiddleware);

const ReserveSchema = z.object({
  showtimeId: z.number().int(),
  seatIds: z.array(z.number().int()).min(1),
});

// POST reservar asientos
router.post('/', async (c) => {
  const { userId } = c.get('user') as any;
  const { showtimeId, seatIds } = ReserveSchema.parse(await c.req.json());

  const now = new Date();
  // Transacción para evitar overbooking
  const result = await db.transaction(async (tx) => {
    // Verificar que la función no haya iniciado
    const st = await tx
      .select({ startsAt: showtimes.startsAt })
      .from(showtimes)
      .where(eq(showtimes.id, showtimeId))
      .then((r) => r[0]);
    if (!st || st.startsAt <= now) {
      throw new Error('Showtime already started or not found');
    }

    // Bloquear y verificar disponibilidad
    const locked = await tx
      .select({ id: seats.id, status: seats.status })
      .from(seats)
      .where(
        and(eq(seats.showtimeId, showtimeId), inArray(seats.id, seatIds))
      );
    if (locked.some((s) => s.status !== 'available')) {
      throw new Error('One or more seats not available');
    }

    // Crear reserva
    const [reservation] = await tx
      .insert(reservations)
      .values({ userId, showtimeId })
      .returning({ id: reservations.id });
    // Asignar asientos
    await tx.insert(reservationSeats).values(
      seatIds.map((sid) => ({ reservationId: reservation.id, seatId: sid }))
    );
    // Marcar asientos como reservados
    await tx
      .update(seats)
      .set({ status: 'reserved' })
      .where(inArray(seats.id, seatIds));
    return reservation;
  });

  return c.json(result);
});

// GET mis reservas
router.get('/', async (c) => {
  const { userId } = c.get('user') as any;
  const data = await db
    .select()
    .from(reservations)
    .where(eq(reservations.userId, userId));
  return c.json(data);
});

// DELETE cancelar reserva
router.delete('/:id', async (c) => {
  const { userId } = c.get('user') as any;
  const id = Number(c.req.param('id'));
  const now = new Date();

  await db.transaction(async (tx) => {
    // Verificar que la reserva pertenezca al usuario y showtime no iniciado
    const row = await tx
      .select({
        showtimeAt: showtimes.startsAt,
      })
      .from(reservations)
      .where(
        and(eq(reservations.id, id), eq(reservations.userId, userId))
      )
      .innerJoin(showtimes, on => eq(showtimes.id, reservations.showtimeId))
      .then((r) => r[0]);
    if (!row || row.showtimeAt <= now) {
      throw new Error('Cannot cancel');
    }

    // Obtener asientos
    const rs = await tx
      .select({ seatId: reservationSeats.seatId })
      .from(reservationSeats)
      .where(eq(reservationSeats.reservationId, id));

    // Liberar asientos
    await tx
      .update(seats)
      .set({ status: 'available' })
      .where(inArray(seats.id, rs.map((r) => r.seatId)));

    // Borrar reserva y sus enlaces
    await tx.delete(reservationSeats).where(eq(reservationSeats.reservationId, id));
    await tx.delete(reservations).where(eq(reservations.id, id));
  });

  return c.text('Reservation canceled');
});

export default router;
