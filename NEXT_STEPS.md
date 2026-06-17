# Next Steps

## Current: Milestone 22 — Final review

### Scope
1. Re-check every screen for stray English text in the UI
2. Re-check no secrets committed (`git log` scan, no VAPID private key, no push subscription secrets)
3. Smoke-test every module's core CRUD on the live app (home-hub-dun.vercel.app)
4. Real push notification end-to-end test on a real device — create real user accounts, subscribe at `/ajustes/notificaciones`, verify push arrives
5. Re-verify RLS: cross-household access denied; a user cannot see another household's data
6. Re-check mobile usability (375px viewport) and the install-guidance flow at `/ajustes/instalar`

### Notes
- This is the final milestone — no new features, just verification
- Push end-to-end test was deferred from M15 (infrastructure confirmed healthy, real device test pending)
- No commits expected unless issues are found and fixed
