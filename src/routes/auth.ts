/**
 * @file Rutas de autenticación de usuarios (registro y login).
 * Permite crear usuarios y obtener tokens JWT para autenticación.
 * @module routes/auth
 */
import { Hono } from 'hono';
import { z } from 'zod';
//import * as jwt from 'jsonwebtoken';
import { sign } from 'hono/jwt';
import { db } from '../db/client';
import { users } from '../db/schema';
  // Import 'eq' from your query builder (e.g., 'drizzle-orm')
  import { eq } from 'drizzle-orm';


const router = new Hono();

/**
 * Esquema de validación para registro de usuario.
 * email: Correo electrónico.
 * password: Contraseña (mínimo 6 caracteres).
 */
const SignupSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
/**
 * Esquema de validación para login de usuario.
 * email: Correo electrónico.
 * password: Contraseña.
 */
const LoginSchema  = z.object({ email: z.string().email(), password: z.string() });

/**
 * Ruta POST /signup
 * Registra un nuevo usuario y devuelve un token JWT.
 */
router.post('/signup', async (c) => {
  const { email, password } = SignupSchema.parse(await c.req.json());
	const hash = await Bun.password.hash(password,{
    algorithm: "bcrypt",
    cost: 10
  });
  const [user] = await db.insert(users)
    .values({ email, passwordHash: hash })
    .returning({ id: users.id, role: users.role });
  const token = await sign({ userId: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 }, process.env.JWT_SECRET!);
  return c.json({ token });
});

/**
 * Ruta POST /login
 * Autentica un usuario y devuelve un token JWT si las credenciales son válidas.
 */
router.post('/login', async (c) => {
  const { email, password } = LoginSchema.parse(await c.req.json());

  const user = await db.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((rs) => rs[0]);
  if (!user || !(await Bun.password.verify(password, user.passwordHash))) {
    return c.text('Invalid credentials', 401);
  }
  const token =  await sign({ userId: user.id, role: user.role}, process.env.JWT_SECRET!);
  return c.json({token});
});

export default router;