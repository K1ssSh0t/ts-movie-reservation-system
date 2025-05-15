/**
 * @file Configuración y exportación del cliente de base de datos usando drizzle-orm.
 * @module db/client
 */
import { drizzle } from 'drizzle-orm/neon-serverless';

/**
 * Instancia del cliente de base de datos configurada con la URL de entorno.
 */
export const db = drizzle(process.env.DATABASE_URL!);

// import { neon } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-http';

// const sql = neon(process.env.DATABASE_URL!);
// export const db = drizzle({ client: sql });

// import { drizzle } from 'drizzle-orm/neon-http';

// export const db = drizzle(process.env.DATABASE_URL!);
