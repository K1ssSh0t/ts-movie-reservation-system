import { Hono } from 'hono';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';
import { users } from '../db/schema';
  // Import 'eq' from your query builder (e.g., 'drizzle-orm')
  import { eq } from 'drizzle-orm';


const router = new Hono();

const SignupSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const LoginSchema  = z.object({ email: z.string().email(), password: z.string() });

router.post('/signup', async (c) => {
  const { email, password } = SignupSchema.parse(await c.req.json());
  const hash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(users)
    .values({ email, passwordHash: hash })
    .returning({ id: users.id, role: users.role });
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!);
  return c.json({ token });
});

router.post('/login', async (c) => {
  const { email, password } = LoginSchema.parse(await c.req.json());

  const user = await db.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((rs) => rs[0]);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return c.text('Invalid credentials', 401);
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!);
  return c.json({ token });
});

export default router;