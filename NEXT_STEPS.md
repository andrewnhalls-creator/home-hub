# Next Steps — Fresh Session Checklist

## Start Here
1. Read `HANDOFF.md` (full document)
2. Read `CLAUDE.md`
3. Run `git status` and `git log --oneline -5`

## Current Position
**Milestone 15, Step 6 — Deploy Edge Function + Set Secrets**

Steps 1–5 are complete:
- Step 1: In-app notification centre (bell icon, modal, mark-as-read)
- Step 2: `public/sw.js` service worker
- Step 3: `ServiceWorkerRegistration` + `usePushSubscription` hook + subscription server actions
- Step 4: `/ajustes/notificaciones` page — category toggles, push enable/disable, test button
- Step 5: `supabase/functions/send-push/index.ts` — Edge Function scaffold (NOT deployed yet)

## Immediate Next Tasks (Milestone 15 steps 6–8)

### Step 6 — Deploy Edge Function + Set Secrets
⚠️ **STOP — ask user before each action below**

**a. Deploy the Edge Function:**
- Use `mcp__supabase__deploy_edge_function` with project_id `xzkavpjwvadqldauaabm`
- Function name: `send-push`
- Source: `supabase/functions/send-push/index.ts`

**b. Set Edge Function secrets** (ask user to confirm the private key is the correct one from their records):
```
VAPID_PUBLIC_KEY=BCpWxtTgNzrnoIU8cnr1KjqHrjMgVCpYD_fsf4dUwZRm3U16B2vAqPYb34XGz_mE82Gsx_KCPRHWt4MQoCfQ-uw
VAPID_PRIVATE_KEY=<user must supply — do not print or store in docs>
VAPID_SUBJECT=mailto:andrew.halls@hotmail.es
```

### Step 7 — Supabase Cron
⚠️ **ASK USER before configuring**
- Configure `pg_cron` to call the `send-push` Edge Function on a schedule (e.g. every minute: `* * * * *`)
- SQL: `select cron.schedule('send-push-cron', '* * * * *', $$ select net.http_post(...) $$)`

### Step 8 — Live Push Test
- Subscribe on a device via `/ajustes/notificaciones`
- Click "Probar notificación"
- Verify push arrives on device
- Check `notification_delivery_attempts` in Supabase for status

## After Milestone 15
Continue in order per BUILD_PLAN.md:
- Milestone 16: Settings expansion (`/ajustes/dispositivos`, `/categorias`, `/privacidad`, password reset)
- Milestone 17: Activity log + trash/archive UI
- Milestone 18: Polish
- Milestone 19: Offline shopping
- Milestone 20: PWA + install prompt
- Milestone 21: Deploy to Vercel — **ASK USER BEFORE DOING ANYTHING**
- Milestone 22: Final review

## VAPID Key Status
- Public key: in `.env.local` as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` ✅
- Private key: NOT committed. User holds it. Set as Edge Function secret `VAPID_PRIVATE_KEY` in step 6.

## Do NOT
- Deploy Edge Function without asking
- Set Supabase secrets without asking
- Configure Supabase Cron without asking
- Re-apply any database migrations (001–013 are done)
- Recreate any existing routes or components
- Commit `.env`, `.env.local`, secrets, `*.rtf`, or service-role keys
- Force-push
- Deploy to Vercel without asking
- Make destructive DB changes without asking
