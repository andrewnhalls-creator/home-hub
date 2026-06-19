# Next Steps

## AI assistant router — what's done
`POST /api/assistant` is built, tested, and committed. Parse-only by default; pass `autoExecute: true` to execute safe actions server-side.

## AI assistant — immediate follow-ups
1. **Wire remaining execute actions** — update_shopping_item, remove_shopping_item, complete_task, update_task, update_reminder all need lookup-by-name logic (see TODOs in `lib/ai/execute-assistant-action.ts`)
2. **Frontend UI** — add an assistant input bar to the dashboard or bottom nav so users can type commands in the app (the endpoint is ready, needs a UI)
3. **Vercel env check** — confirm GROQ_API_KEY, CLOUDFLARE_*, OPENROUTER_*, GEMINI_* are all set in Vercel Production (they were reportedly already present)

## Carry-over from finance overhaul
- Browser QA of finance stages on the deployed Vercel URL (https://home-hub-dun.vercel.app)
- Verify RLS on the `debts` table with a second user account
- The Inmobiliario goal name mismatch (DB: "Fondo compras casa", display: "Inmobiliario") — consider a one-time DB rename if desired
