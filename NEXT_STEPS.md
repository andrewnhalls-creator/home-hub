# Next Steps

## Current state
Doc alignment sweep in progress (Fix 1/6 done). Stop after each fix, update HANDOFF + NEXT_STEPS, commit, push. Then task 4 (repo privacy).

---

## Fix 2 — Deprecate DESIGN_SYSTEM.md

Add a deprecation header at the top of `DESIGN_SYSTEM.md`:

```
# ~~DESIGN_SYSTEM.md~~ — DEPRECATED

> **This file describes the original warm/pastel Azulejo design and is no longer accurate.**
> The current deployed design is Índigo Profundo (dark glassmorphism).
> See `DESIGN.md` for the canonical design reference.
```

Do not delete the file — it's git history. Just make it clear it's stale.

---

## Fix 3 — KNOWN_ISSUES.md: move "Más button broken" to Resolved

The "Más button broken" issue was fixed in Task 1 (commit `3791097`). Move it from Active to Resolved with that note.

---

## Fix 4 — UI_REDESIGN_PLAN.md: mark as complete

Change the status line at the top from:
`## Status: Milestone UI-0 — Audit complete, plan defined`
to:
`## Status: COMPLETE — All milestones UI-0 through UI-8 shipped as of 2026-06-18`

---

## Fix 5 — README.md: update style guide reference

Change `DESIGN_SYSTEM.md` reference to `DESIGN.md` in the opening paragraph.

---

## Fix 6 — DESIGN.md: update form input border reference

In the "Form inputs" section, change `border-white/[0.12]` → `border-border` to match the actual component code.

---

## Task 4 — GitHub repo privacy (after doc sweep done)

Options:
- **Upgrade to Vercel Pro** (~$20/month) → keep auto-deploys, set repo private immediately
- **Keep Hobby + stay public** → no secrets in repo; revisit later
- **Switch to Vercel CLI deploys** → run `vercel deploy` manually; repo can be private

Repo settings: https://github.com/andrewnhalls-creator/home-hub/settings

---

## Fresh session continuation prompt

If starting a new session, paste this:

> I'm continuing a doc alignment sweep on Home Hub (Next.js + Supabase + Tailwind). Read HANDOFF.md and NEXT_STEPS.md to get the current state. The next task is Fix 2: deprecate DESIGN_SYSTEM.md by adding a deprecation header. Then continue through Fixes 3–6 in order, stopping after each one to update HANDOFF.md and NEXT_STEPS.md and commit+push before moving to the next. After all 6 fixes, present Task 4 (GitHub repo privacy options) and wait for a decision.
