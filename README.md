# Simulador monorepo

## Estructura

- `frontend/`: React + Vite + Tailwind. Solo UI/estado y consumo de API.
- `backend/`: Express + TypeScript. Rutas delegan en servicios.
- `backend/src/engine/*`: motor de cálculo puro, sin imports de Express.
- `shared/`: DTOs y tipos compartidos.

## Scripts raíz

- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`

## Backend: PostgreSQL + Knex

Variables necesarias para backend:

- `JWT_SECRET`
- `DATABASE_URL` (conexión PostgreSQL)

Migraciones:

- `npm run db:migrate -w backend`
- `npm run db:migrate:rollback -w backend`

Tablas creadas por migración:

- `users(id, email, password_hash, created_at)`
- `simulations(id, user_id, configuration_json, results_json, created_at)`
