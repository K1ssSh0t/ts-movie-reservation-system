/**
 * @file Utilidad para generar asientos para una función específica.
 * Inserta asientos en la base de datos para un showtime dado.
 * @module utils/generateSeats
 */

import { db } from '../db/client';
import { seats } from '../db/schema';

/**
 * Genera asientos para una función (showtime) específica.
 * @param showtimeId - ID de la función.
 * @param rows - Número de filas de asientos (por defecto 5).
 * @param perRow - Número de asientos por fila (por defecto 10).
 * @returns Promesa que resuelve cuando los asientos han sido insertados.
 */
export async function generateSeatsForShowtime(showtimeId: number, rows = 5, perRow = 10) {
  const bulk = [];
  for (let r = 0; r < rows; r++) {
    const row = String.fromCharCode(65 + r); // 'A', 'B', ...
    for (let n = 1; n <= perRow; n++) {
      bulk.push({ showtimeId, row, number: n, status: 'available' });
    }
  }
  await db.insert(seats).values(bulk);
}
