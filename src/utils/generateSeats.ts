import { db } from '../db/client';
import { seats } from '../db/schema';

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
