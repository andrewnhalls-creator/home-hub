# Next Steps

## Current: Milestone 22 — Final review (manual tests)

### Automated checks (DONE)
- [x] UI text audit — all Spanish, only "Home Hub" brand name in English
- [x] Secrets scan — no secrets in git history or source files
- [x] RLS audit — 28 tables with RLS, all policies use is_household_member()
- [x] lint → clean
- [x] typecheck → clean

### Manual tests (YOU must run these)

**1. Smoke-test every module (live URL: https://home-hub-dun.vercel.app)**
- [ ] Sign in / sign up flow
- [ ] Dashboard — widgets load, recent activity shows
- [ ] Compra (shopping): create list, add items, check off items, archive list
- [ ] Menú (weekly menu): set a meal for each day of the week
- [ ] Recordatorios: create, edit, delete a reminder
- [ ] Tareas: create, complete, delete a chore
- [ ] Calendario: create, edit, delete an event
- [ ] Finanzas → pagos fijos: add payment, mark as paid, view history
- [ ] Finanzas → gastos variables: add a weekly spend
- [ ] Finanzas → ahorro: create a savings goal, update progress
- [ ] Documentos: upload/link a document, archive, restore from trash
- [ ] Deseos: add, edit, delete wishlist items
- [ ] Ajustes → household name, members, invite code
- [ ] Ajustes → cuenta: change password
- [ ] Ajustes → notificaciones: subscribe to push
- [ ] Ajustes → instalar: install guide shows correctly

**2. Push notification end-to-end (real device required)**
- [ ] Create a real user account on the live app
- [ ] On a real device (or Chrome desktop), open /ajustes/notificaciones and subscribe
- [ ] Create a reminder with a due time within the next 2 minutes
- [ ] Wait — verify push notification arrives on the device

**3. RLS cross-household**
- [ ] Create two separate accounts in two different households
- [ ] Log in as user A, note which shopping list IDs exist
- [ ] Log in as user B — confirm user B cannot see user A's lists, events, reminders, etc.
- [ ] Try to directly fetch user A's data via the Supabase REST API with user B's JWT — confirm 0 rows returned

**4. Mobile usability (375px viewport)**
- [ ] Test every screen at 375px width in browser devtools
- [ ] Bottom navigation is visible and tappable
- [ ] All forms are usable at small screen width
- [ ] /ajustes/instalar shows iOS install steps correctly

### Notes
- No new features in Milestone 22 — verification only
- If any issues are found, fix them and commit before signing off
