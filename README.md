# Home Hub

Organizador privado del hogar para dos personas: lista de la compra, menú semanal, recordatorios, tareas, finanzas, documentos y deseos compartidos.

Ver `CLAUDE.md` para las reglas del proyecto, `PRODUCT_REQUIREMENTS.md` para el alcance funcional, `DATA_MODEL.md` para el esquema de base de datos, `BUILD_PLAN.md` para los hitos de construcción, `DESIGN_SYSTEM.md` para la guía de estilo, `SECURITY_AND_PRIVACY.md` para las garantías de seguridad, `TEST_PLAN.md` para las pruebas manuales y `DEPLOYMENT_PLAN.md` para el despliegue.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # rellenar con las claves del proyecto Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run start` — servidor de producción
- `npm run lint` — ESLint
- `npm run typecheck` — comprobación de tipos de TypeScript

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres, Auth, RLS), desplegado en Vercel.
