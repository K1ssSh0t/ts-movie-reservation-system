import { Hono } from 'hono';
import * as dotenv from 'dotenv';
import authRoutes from './routes/auth';
// import movieRoutes from './routes/movies';
// import showtimeRoutes from './routes/showtimes';
// import reservationRoutes from './routes/reservations';
// import reportRoutes from './routes/reports';

dotenv.config();
const app = new Hono();

app.route('/auth', authRoutes);
// app.route('/movies', movieRoutes);
// app.route('/showtimes', showtimeRoutes);
// app.route('/reservations', reservationRoutes);
// app.route('/reports', reportRoutes);

export default app;
