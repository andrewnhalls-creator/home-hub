# Next Steps

## Deploying changes

GitHub-triggered deploys are blocked on the Hobby plan (collaborator restriction).
Always deploy manually via CLI:

```
cd /Users/dianezhalls/Projects/home-hub && npx vercel --prod
```

Make sure `npx vercel whoami` shows `andrewnhalls-2415` before deploying.

---

## Immediate: Deploy FIN-9

Run `npx vercel --prod` to publish the mortgage tracking feature.

---

## Milestone FIN-9: Mortgage tracking — COMPLETE ✓ (deploy pending)

Completed 2026-06-17. See HANDOFF.md for full detail.

---

## Post-launch ideas (not milestones)

- **Push notification end-to-end test**: install PWA to home screen on a real device and verify a reminder fires a push
- Global search `/buscar` page — design-ready, deferred post-MVP
- Web font upgrade (Inter or Plus Jakarta Sans)
- Animated page transitions
- More granular push notification scheduling
- Dedicated `/papelera` route for all modules
