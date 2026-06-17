# Next Steps

## Current: Milestone 20 — PWA (manifest, icons, install prompt)

### Scope
1. `app/manifest.ts` — Next.js web app manifest with name, short_name, start_url, display, theme_color, background_color, icons
2. PNG icons — at minimum 192×192 and 512×512 in `public/icons/` (also fixes the known issue with push notification icon)
3. PWA meta tags in root layout — `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`
4. "Instalar la app" screen at `/ajustes` or a dedicated page — explains how to add to home screen on iOS (Safari Share → Añadir a la pantalla de inicio) and Android (Chrome menu → Instalar aplicación), with the iOS push notification constraint noted
5. Update `public/sw.js` icon path from `/favicon.ico` to `/icons/icon-192.png` once PNG icons exist

### Notes
- iOS 16.4+ requires PWA installed to home screen for push notifications — surface this in the install guidance UI
- Icons can be generated with a simple canvas script or any icon tool — they don't need to be production-quality artwork

### Commit
- `npm run lint && npm run typecheck && npm run build`
- Commit: `Add PWA manifest, icons, and install prompt (Milestone 20)`
- Push to origin/main

## After Milestone 20: Milestone 21
- Global search (`/buscar`) — design-ready but not built in v1; or final E2E review
- Final manual test checklist (TEST_PLAN.md)
- Milestone 22: Create real user accounts, test push end-to-end
