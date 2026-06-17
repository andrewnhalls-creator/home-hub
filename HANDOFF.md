# Home Hub — Handoff Document
Updated: 2026-06-17 (Milestone UI-1 complete)

## Current milestone: UI-1 — Design system foundation (COMPLETE)

## Status
All functional milestones (1–22) complete. UI-0 (audit) and UI-1 (design system) complete.
Next is UI-2 (navigation + app shell).

## Production URL
https://home-hub-dun.vercel.app

## What was done in Milestone UI-1
- `app/globals.css`: added warm shadow tokens (`--shadow-card`, `--shadow-card-hover`, `--shadow-modal`) and radius tokens (`--radius-sm/md/lg/xl/full`) to `:root` + exposed shadow tokens in `@theme inline` as Tailwind utilities
- `components/ui/Card.tsx`: added `variant` prop (`default`, `featured`, `subtle`, `metric`) with warm shadows
- `components/ui/Button.tsx`: added `size` prop (`sm`, `md`, `lg`) for FAB support; `md` remains the default (44px tap target)
- `components/ui/EmptyState.tsx`: polished icon container (14×14→7 icon), title made `font-semibold`, description `leading-relaxed`, added `className` prop
- `components/ui/WeekStrip.tsx`: NEW — Mon–Sun strip, today highlight (terracotta circle), selected state, event dots, weekend tint, accessible labels in Spanish
- `components/ui/SegmentedControl.tsx`: NEW — pill tab selector, active tab gets card background + shadow, generic typed API
- `components/ui/MetricCard.tsx`: NEW — icon + large metric + label + optional status line + deep-link via Next.js `<Link>`

## Last known good state
- Build, lint, typecheck all pass
- No uncommitted changes (before this session)
- Supabase + Vercel live and healthy

## Previously done (full history)
- Milestones 1–22: full functional app, Spanish UI, RLS, Zod validation, push notifications, PWA, offline shopping, activity log, trash/restore, settings, deployment
