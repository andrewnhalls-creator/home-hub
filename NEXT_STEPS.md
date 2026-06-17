# Next Steps

## Current: Milestone 19 — Offline support for shopping

### Scope (shopping list only, not general offline)
1. Register a service worker (or extend existing `public/sw.js`) to cache the shopping list page and recently loaded items
2. Queue `toggleShoppingItemComplete` calls made while offline; sync when reconnect is detected
3. Show "Sin conexión" indicator when the app is offline

### Implementation approach
- Extend `public/sw.js` with a cache-first strategy for the shopping list route
- Use `indexedDB` (or `localStorage` for simplicity) to persist the pending queue
- Detect online/offline via `navigator.onLine` + `window.addEventListener("online", ...)`
- On reconnect, drain the queue and call server actions or a sync route

### Commit
- `npm run lint && npm run typecheck && npm run build`
- Commit: `Add offline support for shopping list`
- Push to origin/main

## After Milestone 19: Milestone 20
- `manifest.ts`, app icons, theme colour, PWA meta tags
- "Instalar la app" screen with per-platform instructions
