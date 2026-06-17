# Home Hub — Handoff Document
Updated: 2026-06-17 (post-FIN-9 polish complete)

## Current state: all tasks from NEXT_STEPS done (deploy pending)

## Last session changes (commit 24c3443)

### 1. Sticky top bar fixed
- `AppShell.tsx`: changed `overflow-x-hidden` → `[overflow-x:clip]` on the outer wrapper.
  `overflow: hidden` on an ancestor breaks `position: sticky`; `clip` does not create a scroll container, so the sticky header now works correctly on all views.

### 2. Mortgage summary card in Resumen tab
- `ResumenTab.tsx`: accepts `mortgages`, `mortgagePayments`, `onGoToMortgage` props.
  Renders a `MortgageCard` for each active (non-deleted) mortgage showing: saldo pendiente, cuota mensual, próximo pago date, amortised % progress bar, and a "Ver hipoteca →" chip that switches to the Hipoteca tab.
- `FinanceTabs.tsx`: passes mortgages/payments and `onGoToMortgage` callback to ResumenTab.

### 3. Delete-payment confirmation in MortgageTab
- `MortgageTab.tsx`: trash icon in payment history now sets `deletingPaymentId` state instead of firing immediately.
  A confirmation modal asks before calling `deleteMortgagePayment`.

## Production URL
https://home-hub-dun.vercel.app

## Deploy command
```
npx vercel --prod
```
(GitHub-triggered deploys blocked on Hobby plan — always use CLI)

## Last known good state
- Build, lint, typecheck all pass
- Committed: 24c3443
- Pushed to origin main
- Migration 016_mortgages applied to Supabase

## Remaining work
- **Deploy**: run `npx vercel --prod` to publish to production
- **Push notification test**: end-to-end device test still pending (infrastructure working)
- **Post-MVP**: global search, web fonts, animated transitions
