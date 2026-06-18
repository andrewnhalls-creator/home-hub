# Next Steps

## Current state
All modules built and deployed. Push notifications confirmed working on real device. One active bug: "Más" button broken. Four tasks remain before the project is complete.

---

## Task 1 — Fix the "Más" button (BLOCKER)

The "Más" nav item in BottomNav takes users to a page that doesn't work. This blocks access to Menú, Recordatorios, Tareas, Documentos, Deseos, Actividad, and Ajustes.

**What to investigate:**
- What route does the Más button link to? (Check `components/layout/BottomNav.tsx`)
- Does `MoreMenuSheet` render as a bottom sheet or does it navigate? If it navigates, is the target page wired correctly?
- Check `components/layout/MoreMenuSheet.tsx` — does it exist and is it imported in the layout?
- Check the browser console for errors on the broken page

**Fix:** restore correct sheet/navigation behaviour so all 7 secondary nav items are accessible.

---

## Task 2 — Per-module audit sweep

Sweep every module component for remaining tech debt from the impeccable audit. The core UI components were fixed in the 2026-06-18 audit session; module-specific components have not been touched.

**What to check in each module:**

1. **Lucide imports** — any `from "lucide-react"` → migrate to `@phosphor-icons/react` (or `/dist/ssr` for server components)
2. **Sub-12px text** — `text-[10px]` or `text-[11px]` → fix to `text-xs` (12px) minimum
3. **Inline `backdrop-filter`** — on cards, list items, inputs, empty states → remove
4. **`uppercase tracking-wide` section labels** → replace with `text-xs font-medium text-muted`
5. **`border-white/[0.12]`** → replace with `border-border`

**Quick grep commands to find violations:**
```bash
grep -r "lucide-react" components/ app/ --include="*.tsx" -l
grep -r "text-\[1[01]px\]" components/ app/ --include="*.tsx" -l
grep -r "backdropFilter" components/ app/ --include="*.tsx" -l
grep -r "uppercase tracking-wide" components/ app/ --include="*.tsx" -l
grep -r 'border-white/\[0\.12\]' components/ app/ --include="*.tsx" -l
```

**Modules to sweep:** `components/finance/`, `components/meals/`, `components/reminders/`, `components/chores/`, `components/calendar/`, `components/documents/`, `components/wishlist/`, `app/(app)/` pages.

---

## Task 3 — Final review + build

Run through all of this before the repo is locked:

- [ ] `npm run lint && npm run typecheck && npm run build` — must pass 0 errors
- [ ] Stray English text sweep — every visible string in every module must be Spanish (Spain)
- [ ] Smoke-test core CRUD on the live Vercel deployment: compra, menú, recordatorios, tareas, calendario, finanzas, documentos, deseos, ajustes
- [ ] Mobile layout check at ~375px viewport on every module
- [ ] RLS spot-check: confirm a second test account cannot see the first household's data
- [ ] Confirm no secrets committed (`git log --all -- '*.env*'` and `git grep -i "service_role"`)

---

## Task 4 — Make GitHub repo private

The repo is currently public (required for Vercel Hobby auto-deploys).

**Options:**
- **Upgrade to Vercel Pro** (~$20/month) → keep auto-deploys, set repo private immediately
- **Keep Hobby + stay public** → acceptable since no secrets are in the repo; revisit later
- **Switch to Vercel CLI deploys** → run `vercel deploy` manually from the terminal; repo can be private; no GitHub integration needed

Once decided, set repo visibility at: https://github.com/andrewnhalls-creator/home-hub/settings
