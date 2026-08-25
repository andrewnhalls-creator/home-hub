# Casa Calma redesign — staged plan

Source of truth: `Chatgpt_Redesign/Frontend Designs/` (36 Stitch screens: `code.html` + `screen.png` each)
and `casa_calma/DESIGN.md` (the new design system). Backend spec: `Chatgpt_Redesign/HOME_HUB_BACKEND_PROMPT.md`.

Direction change (approved by user 25/08/2026): the app moves from dark-indigo glassmorphism
("Índigo Profundo") to the light **Casa Calma** system — cream `#f4fafd` background, forest-green
primary `#154212`, terracotta secondary `#974723`, Plus Jakarta Sans, soft ambient shadows,
16px card radius. CLAUDE.md / DESIGN.md are updated as part of Stage F1.

Standing decisions:
- Keep **Phosphor icons** (project rule) even though Stitch mockups use Material Symbols.
- Legacy token names (`cream`, `terracotta`, `sage`…) are retargeted, not renamed — the whole
  app is token-driven, so Stage F1 flips the global look; later stages align layouts per screen.
- New feature screens without backend (asistente, papelera, actividad, buscar, hipoteca,
  presupuestos, otras deudas) are built in their frontend stage with honest empty /
  "no conectado" states — no fake data — and wired for real in the backend phases.

## Frontend stages

- **F1. Design-system foundation** — retarget tokens in `globals.css` (colors, shadows, radii,
  `.glass` → soft white card), Plus Jakarta Sans in `layout.tsx`, themeColor/manifest,
  rewrite `DESIGN.md`, update CLAUDE.md design section, sweep residual dark-only classes,
  build green. ✅ current stage
- **F2. App shell** — BottomNav, Sidebar, TopBar, MoreMenuSheet, AppShell vs screens
  `inicio`, `m_s_opciones`, `panel_de_control_escritorio`.
- **F3. Auth y hogar** — `iniciar_sesi_n`, `crear_o_unirse_a_una_casa`, `cambiar_de_casa`.
- **F4. Inicio** — mobile dashboard + desktop panel.
- **F5. Compra** — `lista_de_la_compra`, `finalizar_compra`, `asistente_lista_de_la_compra`.
- **F6. Menú y recetas** — `men_semanal`, `recetas_del_hogar`, `receta_lentejas_con_chorizo`.
- **F7. Recordatorios y tareas** — incl. `asistente_clarificaci_n_de_tarea`.
- **F8. Calendario** — `calendario_del_hogar` (+ escritorio), `nuevo_evento`.
- **F9. Finanzas** — `resumen_de_finanzas` (+ escritorio), `registrar_gasto`
  (+ `asistente_registro_de_gasto`), `presupuestos_mensuales`, `movimientos_y_pagos_fijos`,
  `gesti_n_de_hipoteca`, `ahorro_y_objetivos`, `otras_deudas`, `suscripciones_y_servicios`.
- **F10. Documentos y deseos** — `documentos_del_hogar`, `lista_de_deseos`.
- **F11. Buscar, papelera, actividad** — `buscar_en_el_hogar`, `papelera_de_reciclaje`,
  `actividad_reciente`.
- **F12. Ajustes** — `ajustes_y_configuraci_n`, `notificaciones_y_ajustes`.

Each stage: match the Stitch layout at ≈390px (and desktop where a desktop screen exists),
Spanish copy from the mockups, lint + typecheck + build, commit, update HANDOFF/NEXT_STEPS, stop.

## Backend phases

After F12, follow `HOME_HUB_BACKEND_PROMPT.md` phase by phase (schema + RLS + server logic +
UI wiring + realtime + tests per vertical slice). Key additions it brings: Google Calendar
dedicated-calendar sync, AI assistant (server-side adapter, confirmation-based), trash,
activity history, search, export, budgets, mortgage, debts.
