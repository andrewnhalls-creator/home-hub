# Next Steps

## Deploying changes

GitHub-triggered deploys are blocked on the Hobby plan (collaborator restriction).
Always deploy manually via CLI:

```
cd /Users/dianezhalls/Projects/home-hub && npx vercel --prod
```

Make sure `npx vercel whoami` shows `andrewnhalls-2415` before deploying.

---

## Done this session
- **Sticky top bar**: fixed `overflow-x: clip` so the header never scrolls away
- **Mortgage summary in Resumen tab**: card shows balance, cuota, próximo pago, progress bar; taps into Hipoteca tab
- **Delete-payment confirmation**: modal before removing a payment from mortgage history

---

## Next session: tasks (do in order)

### 1. Deploy to production
Run `npx vercel --prod` and verify the live site at https://home-hub-dun.vercel.app

### 2. Push notification end-to-end device test (manual)
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
