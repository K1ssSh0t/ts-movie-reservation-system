import { pgTable, serial, varchar, text, integer, timestamp, pgEnum, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const movies = pgTable('movies', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  posterUrl: text('poster_url'),
  genre: varchar('genre', { length: 100 }),
});

export const showtimes = pgTable('showtimes', {
  id: serial('id').primaryKey(),
  movieId: integer('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
  startsAt: timestamp('starts_at').notNull(),
  capacity: integer('capacity').notNull(),
});

export const seats = pgTable('seats', {
  id: serial('id').primaryKey(),
  showtimeId: integer('showtime_id').notNull().references(() => showtimes.id, { onDelete: 'cascade' }),
  row: varchar('row', { length: 2 }).notNull(),
  number: integer('number').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('available'),
});

export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  showtimeId: integer('showtime_id').notNull().references(() => showtimes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const reservationSeats = pgTable('reservation_seats', {
  reservationId: integer('reservation_id').notNull().references(() => reservations.id, { onDelete: 'cascade' }),
  seatId: integer('seat_id').notNull().references(() => seats.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey(table.reservationId, table.seatId),
}));