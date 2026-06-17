# Next Steps

## Deploying changes

GitHub-triggered deploys are blocked on the Hobby plan (collaborator restriction).
Always deploy manually via CLI:

```
cd /Users/dianezhalls/Projects/home-hub && npx vercel --prod
```

Make sure `npx vercel whoami` shows `andrewnhalls-2415` before deploying.

---

## Done this session (deploy needed)
- **Finance tabs mobile layout**: replaced horizontal strip with 2-column icon+label grid on mobile; tablet+ keeps scrollable strip
- **Bottom nav**: Inicio (Home) added as first item on the left; nav now has 4 items: Inicio, Calendario, Compra, Finanzas

---

## Next session: tasks (do in order)

### 1. Static top bar (always visible, Menu never disappears)
The top bar currently hides or scrolls away on some views. Make it fixed/sticky so
"Home Hub" brand and the "Menu" button are always visible regardless of scroll position.
Check `components/layout/AppShell.tsx` (or equivalent top-bar component) and ensure
the header has `sticky top-0 z-…` or `fixed` positioning with appropriate body padding.

### 2. Mortgage summary card in Resumen tab
Add a mortgage card to `components/finance/ResumenTab.tsx` showing:
- Saldo pendiente (current_balance)
- Cuota mensual (monthly_payment)
- Próximo pago date (next mortgage_payment with status pendiente, or payment_day of current month)
- Progress bar (amortizado %)
- Link/tap → switches to Hipoteca tab
The ResumenTab needs to accept `mortgages` and `mortgagePayments` props; pass them from
`FinanceTabs.tsx` which already has them.

### 3. Delete-payment confirmation (MortgageTab)
`MortgageTab.tsx:248` — the delete-payment button in the payment history fires immediately with no confirmation. Add a small confirmation modal (same pattern as delete-mortgage) before calling `deleteMortgagePayment`.

### 4. Push notification end-to-end device test (manual)
Install the PWA to the home screen on a real iOS/Android device, create a reminder set
to fire in ~2 minutes, and confirm the push notification arrives. This is a manual check —
no code changes expected unless something is broken.

---

## Post-launch ideas (not milestones)

- Global search `/buscar` page — design-ready, deferred post-MVP
- Web font upgrade (Inter or Plus Jakarta Sans)
- Animated page transitions
- More granular push notification scheduling
- Dedicated `/papelera` route for all modules
