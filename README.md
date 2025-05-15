# Cine API Backend

Este proyecto es una API REST para la gestión de un cine, desarrollada con [Hono](https://hono.dev/) y [Bun](https://bun.sh/). Permite la administración de películas, funciones, asientos, reservas y usuarios, con autenticación basada en JWT y control de acceso para administradores.

## Requisitos previos

- [Bun](https://bun.sh/) instalado
- Base de datos PostgreSQL accesible (configura la variable de entorno `DATABASE_URL`)
- Variable de entorno `JWT_SECRET` definida para la firma de tokens

## Instalación

1. Clona el repositorio y accede al directorio del proyecto.
2. Instala las dependencias:
   ```sh
   bun install
   ```
3. Configura las variables de entorno en un archivo `.env`:
   ```env
   DATABASE_URL=postgres://usuario:contraseña@host:puerto/db
   JWT_SECRET=tu_clave_secreta
   ```

## Ejecución en desarrollo

Inicia el servidor de desarrollo con recarga automática:
```sh
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para acceder a la aplicación.

## Endpoints principales

### Autenticación
- **POST /auth/signup**: Registro de usuario. Devuelve un token JWT.
- **POST /auth/login**: Login de usuario. Devuelve un token JWT.

### Películas
- **GET /movies**: Lista todas las películas (requiere autenticación).
- **POST /movies**: Crea una película (solo admin).
- **PUT /movies/:id**: Actualiza una película (solo admin).
- **DELETE /movies/:id**: Elimina una película (solo admin).

### Funciones (Showtimes)
- **GET /showtimes?date=YYYY-MM-DD**: Lista funciones por fecha (requiere autenticación).
- **POST /showtimes**: Crea una función (solo admin).
- **PUT /showtimes/:id**: Actualiza una función (solo admin).
- **DELETE /showtimes/:id**: Elimina una función (solo admin).

### Reservas
- **POST /reservations**: Reserva asientos para una función (requiere autenticación).
- **GET /reservations**: Lista reservas del usuario autenticado.

### Reportes (solo admin)
- **GET /reports/reservations?start=YYYY-MM-DD&end=YYYY-MM-DD**: Resumen de reservas y ocupación.

## Ejemplo de uso de endpoints

**Registro de usuario:**
```http
POST /auth/signup
Content-Type: application/json
{
  "email": "usuario@ejemplo.com",
  "password": "123456"
}
```

**Login:**
```http
POST /auth/login
Content-Type: application/json
{
  "email": "usuario@ejemplo.com",
  "password": "123456"
}
```

**Reserva de asientos:**
```http
POST /reservations
Authorization: Bearer <token>
Content-Type: application/json
{
  "showtimeId": 1,
  "seatIds": [10, 11, 12]
}
```

## Notas adicionales

- Asegúrate de que ningún otro proceso use el puerto 3000.
- El comando `bun run dev` recargará la aplicación automáticamente ante cambios en el código fuente.
- Consulta la documentación en el código fuente (TSDoc) para detalles de cada módulo y función.
