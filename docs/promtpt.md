Here's the final prompt with the token rule added:

---

## Prompt: Build the Roles Page (Dashboard/Admin Panel)

**Role**
You are an expert frontend engineer working inside an existing Next.js dashboard. You will build a **Roles management page** by analyzing live prototypes, picking up existing codebase components, and implementing using a strict manual copy-paste component workflow — no CLI, no installs.

---

**Step 1 — Analyze the Prototypes**

Fetch and thoroughly analyze both URLs:
- `https://designs.magicpath.ai/v1/cool-shadow-2731`
- `https://project-new-design-4463.magicpatterns.app`

**MagicPatterns prototype** — visual authority:
- Click through every tab state in the Roles section and document each one
- Extract: color palette, surface layers, border treatments, shadow system (especially micro/subtle shadows on cards, buttons, inputs)
- Typography scale per element type (size, weight, line-height)
- Spacing rhythm and layout density
- Active/inactive/hover/focus states on tabs and interactive elements
- Badge, count, or indicator patterns on tabs
- Empty states if visible

**MagicPath prototype** — logic authority:
- Extract all interaction patterns and UI behavior from the Roles section
- Document: table columns, per-row actions, search/filter patterns, permission/capability model, create/edit/delete flows
- Note whether edit is a modal, slide-over, or separate page — use whatever the prototype uses

---

**Step 2 — Pick Up Existing Codebase Components**

Search the codebase and reuse without rebuilding:
- **Table component** — use as-is
- **Pagination component** — use as-is
- Any existing **modal/dialog, dropdown, badge, tooltip**
- **`tokens.css`** — read this file first before writing a single className; it is the source of truth for every visual decision
- Existing **sidebar and top nav shell** — slot the Roles page into it, do not recreate

---

**Step 3 — Token Rules (Critical)**

**Read `tokens.css` before writing any styles.** Most tokens you need already exist. Your job is to map to them, not create new ones.

- Before reaching for a hardcoded value or inventing a new token, search `tokens.css` first
- Use the closest existing token — if `--shadow-sm` exists, use it; don't create `--shadow-card`
- Only create a new token if nothing in `tokens.css` reasonably covers the use case, and if you do, note it explicitly with a comment explaining why no existing token worked
- The goal is to finish the page having added zero or as few new tokens as possible

**Token mapping when adapting any copied component:**

| shadcn / coss original | Your token |
|---|---|
| `bg-background` | `bg-(--bg-primary)` |
| `bg-muted`, `bg-slate-50`, `bg-muted/50` | `bg-(--bg-input)` |
| `text-muted-foreground`, `text-slate-500` | `text-(--text-muted)` |
| `text-foreground` | `text-(--text-main)` |
| `border-border`, `border-input` | `border-(--stroke-subtle)` |
| `ring-ring`, `focus-visible:ring-*` | `shadow-[0_0_0_4px_var(--focus-ring)]` |
| `bg-destructive` | `bg-(--destructive)` |
| `bg-primary` | `bg-(--primary-btn)` |
| `text-primary` | `text-(--primary-btn)` |
| `text-primary-foreground` | `text-(--text-button)` |
| `font-sans`, `--font-sans` | `var(--font-primary)` |
| `transition-colors` | keep or replace with `transition-[var(--transition-smooth)]` |

Replace any hardcoded `bg-slate-*`, `bg-zinc-*`, `bg-neutral-*`, `text-slate-*`, `border-*` with the appropriate token. Use Tailwind v4 shorthand:
```ts
// ✓ preferred
className="bg-(--bg-primary) text-(--text-muted) border-(--stroke-subtle)"
```

---

**Step 4 — Component Sourcing Rules**

**Never run `npx shadcn` or `npx shadcn@latest add`.** The CLI overwrites `globals.css` and `layout.tsx`. Always grab source manually.

| Need | Use |
|---|---|
| Component exists in coss UI | coss UI — it's the primary |
| Not in coss, exists in shadcn | shadcn manual copy |
| Complex interactive (Dialog, Select, Combobox) | coss UI — Base UI handles a11y better |
| Simple layout/display (Table, Badge, Skeleton) | either, pick what looks cleaner |

**Getting coss UI source:** `coss.com/ui/docs` → find component → copy raw `.tsx`. No install.

**Getting shadcn source:** `ui.shadcn.com/docs/components/[name]` → **Manual** tab → copy code block.

---

**Step 5 — Adaptation Checklist (Every Copied Component)**

1. Add plain `cn()` at the top:
```ts
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}
```
2. Swap all color tokens per the map in Step 3
3. Delete `import { cn } from "@/lib/utils"`, any `@/components/ui` imports, and any `tokens.css` import — `layout.tsx` loads tokens globally
4. Remove `"use client"` only if the component has zero hooks or event handlers

**Before committing any component:**
- [ ] Plain `cn()` at top, `@/lib/utils` import deleted
- [ ] Every hardcoded color class replaced with a token
- [ ] Every `ring-*` replaced with focus-ring shadow
- [ ] No `tokens.css` import in the file
- [ ] `"use client"` removed if unused

---

**Step 6 — File Placement**

```
components/
  layout/     ← structural (Table, Sidebar, Header, PageShell)
  ui/         ← reusable atoms (Button, Badge, Input, Dialog, Tabs)
app/
  (dashboard)/
    roles/
      page.tsx
```

---

**Step 7 — Build the Roles Page**

Using prototype analysis from Step 1 and components from Steps 2–5:

- **Page header** — title, description, primary "Create Role" button with subtle box-shadow from existing shadow tokens
- **Tabs** — all states from MagicPatterns; active treatment from coss UI visual language, not default shadcn
- **Roles table** — reuse existing table and pagination; columns and data model from prototype; per-row Edit and Delete actions
- **Delete flow** — confirmation dialog required before any delete; never delete on immediate click
- **Create / Edit Role** — modal, slide-over, or page — whichever pattern the prototype uses; all fields from prototype
- **Search & filters** — whatever patterns the prototypes show
- **Empty state** — consistent with coss UI visual language
- **Buttons** — subtle `box-shadow` using existing shadow tokens; icons only where semantically meaningful

---

**Output**
- All new files for the Roles page and any net-new components
- Modified files only if an existing component needs minor extension — note what changed and why
- If you created any new token, explain explicitly why no existing token covered it
- Flag any decision that couldn't be resolved from the prototypes or codebase — don't guess silently
for basic component creation use @coss