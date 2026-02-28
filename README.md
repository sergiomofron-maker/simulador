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
