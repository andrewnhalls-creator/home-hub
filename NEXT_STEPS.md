# Next Steps

## Current state
All previous tasks complete. AI assistant feature is planned and ready to build next session.

---

## AI Assistant milestone — Gemini 1.5 Flash

### Pre-requisite before starting
Get a **free Gemini API key** from https://aistudio.google.com (sign in with Google → Get API key → Create API key). No credit card needed.
- Add to `.env.local` as `GEMINI_API_KEY=your-key-here`
- Add to Vercel project environment variables (Settings → Environment Variables) with the same name

### Session start prompt
> I'm continuing the Home Hub project (Next.js + Supabase + Tailwind, dark glassmorphism). Read HANDOFF.md and NEXT_STEPS.md for full context. We're building the AI assistant feature using Gemini 1.5 Flash. The plan is at ~/.claude/plans/yes-i-like-all-joyful-deer.md — follow the build order there. Start with Section 1 (the API route). After each section: update HANDOFF + NEXT_STEPS, commit, push, and stop for confirmation before continuing.

---

### Build order (stop + update docs + commit + push after EACH section)

#### Section 1 — API route
**File to create:** `app/api/ai/route.ts`

`POST /api/ai` handler:
- Auth via `requireHousehold()`
- Fetch live household context from Supabase (shopping, meals, reminders, chores, expenses, subscriptions, fixed payments, recipes)
- Call Gemini 1.5 Flash via `fetch` (no extra npm package), `responseMimeType: "application/json"`, `temperature: 0.3`
- Parse response JSON: `{ message: string, actions: Action[] }`
- Execute actions via Supabase client directly
- `revalidatePath` for affected routes
- Return `{ message, actionsExecuted }` to client

**Also:** add `GEMINI_API_KEY=` (empty) to `.env.example`

#### Section 2 — Chat UI
**File to create:** `components/ai/AIChatButton.tsx`
**File to modify:** `components/layout/AppShell.tsx`

- Fixed-position FAB: `bottom-20 right-4` mobile, `bottom-8 right-6` desktop
- Icon: `Sparkle` (fill) from `@phosphor-icons/react`, terracotta circle 52×52px
- Opens `Modal` with chat history + input
- User messages: right-aligned, terracotta bg
- AI messages: left-aligned, card surface
- Loading: "Pensando…" pulse, input disabled
- After action execution: `router.refresh()`
- Initial greeting shown when history is empty
- Errors via `useToast()`

#### Section 3 — Full action set (verify all work end-to-end)

Actions supported:
- `add_shopping_item` — name, quantity?, unit?, store?, priority?
- `create_reminder` — title, description?, due_at?
- `create_chore` — title, frequency?, next_due_date?
- `create_expense` — title, amount, expense_date?, notes?
- `create_subscription` — name, amount, billing_cycle, renewal_date?
- `create_fixed_payment` — name, amount, due_day
- `suggest_recipe` — AI message only, no DB write
- `suggest_meal_plan` — AI message only, no DB write
- Read-only queries — `actions: []`, AI answers from context

**Bilingual:** system prompt tells Gemini to accept English or Spanish, always respond + create records in Spanish (Spain).

---

### Verification (after Section 3)
1. `npm run typecheck && npm run build` pass
2. Click sparkle FAB → chat modal opens
3. English input: "Add milk and bread" → items appear in Spanish on /compra
4. Spanish input: "Añade un recordatorio para el seguro el día 20" → reminder created
5. Read-only: "¿Qué hay en la lista?" → AI responds, no DB changes
6. Finance: "Crea una suscripción de Netflix 15 euros al mes" → appears in finanzas
7. API key never visible in browser Network tab
