# Home Hub — Handoff Document
Updated: 2026-06-17 (Milestone 20 complete)

## Current milestone: 21 — Deployment (Vercel)

## Status
- Milestone 20 (PWA + install prompt): COMPLETE — committed and pushed

## What was done in Milestone 20
- **`app/manifest.ts`**: Next.js web app manifest — name, start_url `/dashboard`, display `standalone`, theme_color `#c96b4b`, background_color `#f5ebe0`, 192×192 and 512×512 PNG icons
- **`public/icons/`**: Generated `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` using sharp (terracotta background, cream house silhouette)
- **`app/layout.tsx`**: Added `appleWebApp` metadata (capable, title, statusBarStyle) and icon links for iOS and favicon
- **`public/sw.js`**: Updated push notification icon path from `/favicon.ico` to `/icons/icon-192.png`
- **`app/(app)/ajustes/instalar/page.tsx`**: New route `/ajustes/instalar`
- **`components/settings/InstallGuideView.tsx`**: Install guidance component — platform tabs (iPhone/Android/Mac/Windows), step-by-step instructions, push notification requirements checklist (iOS 16.4+ constraint surfaced), "Probar notificación" link to `/ajustes/notificaciones`
- **`components/settings/SettingsView.tsx`**: Added "Instalar la app" link to settings nav

## Already done
- Milestone 19: Offline support for shopping (sw.js caching, offline queue, OfflineBanner)
- Milestone 18: Loading states, success toasts, noValidate
- Milestone 17: Activity log + TrashSection restore UI
- Milestone 16: Settings pages, forgot/reset password, auth callback
- All modules: aria-labels, delete confirm modals, EmptyState, Zod validation, Spanish errors

## Last known good state
- Build, lint, typecheck all pass
- Committed and pushed as "Add PWA manifest, icons, and install prompt (Milestone 20)"
