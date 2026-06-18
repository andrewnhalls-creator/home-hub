# Next Steps

## Current state
Task 1 done. Task 2 mostly done — one audit item remains. Last commit: `28c44d9` (not yet pushed).

---

## Task 2 (remaining) — Fix border-white/[0.12]

Still present in 7 files (replace with `border-border`):

```bash
grep -rn 'border-white/\[0\.12\]' components/ app/ --include="*.tsx"
```

Files: `components/ui/Card.tsx`, `components/ui/Modal.tsx`, `components/ui/PrintButton.tsx`, `components/ui/Input.tsx`, `components/ui/Select.tsx`, `components/ui/Textarea.tsx`, `components/layout/MoreMenuSheet.tsx`

Fix: in each file, replace_all `border-white/[0.12]` → `border-border`. Then re-commit.

Note: backdrop-filter in MoreMenuSheet.tsx is intentional — sheets are allowed blur(24px) per the two-tier glass rule.

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
