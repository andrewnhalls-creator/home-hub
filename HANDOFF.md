# Home Hub — Handoff Document
Updated: 2026-06-17 (post-launch polish — font upgrade done)

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
- Last commit: `1280922` (Plus Jakarta Sans font upgrade)
- Pushed to origin main ✓
- Deploy pending for this commit

## Completed post-launch items
1. ✅ **Web font upgrade** — Plus Jakarta Sans via `next/font/google`
   - `app/layout.tsx`: loads font, injects `--font-jakarta` CSS variable onto `<html>`
   - `app/globals.css` `@theme inline`: `--font-sans` → `var(--font-jakarta), ui-sans-serif, ...`

## Remaining post-launch items (in order)
2. Animated page transitions
3. Global search `/buscar`
4. `/papelera` recovery route
5. Push notification quiet hours / per-category toggles
