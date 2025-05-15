/**
 * @file Punto de entrada principal de la aplicación.
 * Configura el servidor Hono, carga variables de entorno, registra middlewares y monta rutas.
 * @module index
 */

import { Hono } from 'hono';
import * as dotenv from 'dotenv';
import authRoutes from './routes/auth';
import { logger } from 'hono/logger'
import movieRoutes from './routes/movies';
import showtimeRoutes from './routes/showtimes';
import reservationRoutes from './routes/reservations';
import reportRoutes from './routes/reports';
import {prettyJSON} from 'hono/pretty-json';

dotenv.config();
const app = new Hono();
// logger middleware
app.use(logger());
app.use(prettyJSON());

app.route('/auth', authRoutes);
app.route('/movies', movieRoutes);
app.route('/showtimes', showtimeRoutes);
app.route('/reservations', reservationRoutes);
app.route('/reports', reportRoutes);



export default app;
