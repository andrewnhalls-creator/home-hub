# Next Steps

## Deploy pending (two steps)

### 1. Deploy app to Vercel
```
cd /Users/dianezhalls/Projects/home-hub && npx vercel --prod
```

### 2. Redeploy Edge Function
The `send-push` Edge Function was updated (quiet hours logic).
Deploy it via the Supabase CLI:
```
npx supabase functions deploy send-push
```
Or via the Supabase dashboard → Edge Functions → send-push → Redeploy.

---

## All planned post-launch items are complete

No further milestones are planned. The app is feature-complete.

Future improvements to consider (no priority order):
- Global search enhancements (fuzzy match, search history)
- Web font refinement (heading vs body weight tuning)
- Dark mode
- Richer calendar (drag-to-reschedule, multi-day events)
- Expense analytics charts (monthly spend trends, category breakdown)
- Multi-household support
