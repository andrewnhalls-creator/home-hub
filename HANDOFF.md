# Home Hub — Handoff Document
Updated: 2026-06-17 (post-launch polish — transitions done)

## Current state: post-launch polish in progress

v1 is live. Working through post-launch improvements in order.

## Production URL
https://home-hub-dun.vercel.app

## Deploy command
```
npx vercel --prod
```
(GitHub-triggered deploys blocked on Hobby plan — always use CLI)

## Last known good state
- Build, lint, typecheck all pass
- Last commit: `a1169ca` (page transitions)
- Pushed to origin main ✓
- Deploy pending for this commit

## Completed post-launch items
1. ✅ **Web font upgrade** — Plus Jakarta Sans via `next/font/google`
   - `app/layout.tsx`: loads font, injects `--font-jakarta` CSS variable
   - `app/globals.css` `@theme inline`: `--font-sans: var(--font-jakarta), ui-sans-serif, ...`

2. ✅ **Animated page transitions** — fade-up on every route change
   - `components/layout/PageTransition.tsx`: client component, `key={usePathname()}` triggers remount + animation
   - `AppShell.tsx`: wraps `{children}` in `<PageTransition>`
   - `app/globals.css`: `@keyframes page-fade-up` + `.animate-page-in` utility (220ms ease-out)
   - Reduced motion already globally handled by `globals.css` `prefers-reduced-motion` rule

## Remaining post-launch items (in order)
3. Global search `/buscar`
4. `/papelera` recovery route
5. Push notification quiet hours / per-category toggles
