---
description: Implement a Figma design using shadcn/Radix primitives + project tokens
argument-hint: <figma-node-id> [output-file]
---

# Figma → shadcn Adaptation

Arguments: `$ARGUMENTS`

Parse arguments:
- First arg = Figma node ID (required)
- Second arg = target file path to write/update (optional — infer from component name if omitted)

## Philosophy

shadcn provides **behavior** (Radix primitives: focus traps, keyboard nav, ARIA semantics).
The project's named CSS classes and `tokens.css` variables provide **visual styling**.
Never strip named classes. Never hardcode colors. Never use Tailwind `dark:` prefix.

The goal is not to make the UI look "shadcn". The goal is to use the best underlying shadcn/Radix primitive when it helps, then adapt it back to the original Figma design and this repo's visual language.
Use existing tokens first. If the design genuinely needs a reusable design-system value that does not exist yet, add the minimum new token to `styles/tokens.css` instead of hardcoding a one-off value.

## Agent Flow (required)

This command is the Phase 2A implementation spine for [`figma-delivery-agent`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/agents/figma-delivery-agent.md).

Use the agents deliberately in this order:
1. Before implementation, invoke [`component-reuse-agent`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/agents/component-reuse-agent.md) to lock `reuse`, `extend`, or `keep-local`.
2. Execute this command only after the reuse decision is clear.
3. When no shared repo component fits cleanly, load the `shadcn` skill and search for the closest primitive or composition pattern before creating custom structure.
4. When the design requires interaction polish, motion tuning, sidebar feel, overlay behavior, or micro-interactions, load `design-engineering-skill` during implementation.
5. Use `agent-browser` as part of implementation, not just at the end.
6. After code changes, hand off to [`ui-change-guard-agent`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/agents/ui-change-guard-agent.md) for the final post-change gate.
7. If local behavior is unstable or validation exposes a runtime bug, escalate to [`frontend-debug-agent`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/agents/frontend-debug-agent.md) before making more fixes.

---

## Workflow

### Step 1 — Fetch Figma design context

Run in parallel:
1. `figma_get_component_for_development_deep` on the node ID — full layer tree, props, variants
2. `figma_capture_screenshot` on the node ID — visual reference (fallback: `figma_take_screenshot`)
3. `figma_get_styles` — style references used by the node

If `figma_get_component_for_development_deep` is truncated or too large:
- Re-run as `figma_get_component_for_development` (non-deep) to get the high-level map
- Then re-fetch only the specific sub-nodes you need

**Asset rule:** If the Figma MCP returns a `localhost:` URL for any SVG or image asset — use it **directly** as the `src`. Do not re-download, proxy, create a placeholder, or substitute a different image.

From the design context, extract:
- Component name and variant structure
- All text content and typography specs (font, size, weight, line-height)
- Color values → map each to nearest `var(--*)` token from `tokens.css`
- Spacing values → map to `var(--space-*)` tokens or Tailwind spacing scale
- Border radius → apply concentric radius rule where nested (outer = inner + padding)
- Shadows → map to `var(--shadow-*)` tokens
- Interaction states in variants: default, hover, active, disabled, error, success

### Step 2 — Check existing shared components FIRST

**Before mapping to any shadcn/Radix primitive**, use the output of `component-reuse-agent`. If no reuse artifact exists yet, run it now. Then check `../components/`:
- `../components/ui/` - InputGroup, Button, IconButton, Badge, Card, Dialog, Tabs, sidebar-tab, Pagination
- `../components/layout/` - Header, BackNavigation, Logo, sidebar, dashboard-shell, table
- `../components/providers/` - Providers, ThemeToggle, RoleContentTabs

If a shared component already covers the pattern, **use it** - do not create a new one or wrap it in Radix unnecessarily.

### Step 3 - shadcn search and component mapping (only if no shared component exists)

Before choosing a primitive, explicitly use the `shadcn` skill or its MCP-backed search flow:
- search for the closest component or composition pattern
- prefer a primitive whose behavior matches the Figma interaction model
- use shadcn for the underlying structure and accessibility behavior
- then adapt spacing, typography, states, and visual styling back to the Figma target and this repo's tokens

Do not stop at "the shadcn component exists". The component must still be reshaped to match the design.

| Figma pattern | shadcn/Radix primitive |
|---|---|
| Modal / overlay | `@radix-ui/react-dialog` |
| Dropdown menu | `@radix-ui/react-dropdown-menu` |
| Select input | `@radix-ui/react-select` |
| Tabs | `@radix-ui/react-tabs` |
| Tooltip | `@radix-ui/react-tooltip` |
| Checkbox | `@radix-ui/react-checkbox` |
| Radio group | `@radix-ui/react-radio-group` |
| Switch / toggle | `@radix-ui/react-switch` |
| Accordion | `@radix-ui/react-accordion` |
| Context menu | `@radix-ui/react-context-menu` |
| Popover | `@radix-ui/react-popover` |
| Alert / banner | `@radix-ui/react-alert-dialog` |
| Slider | `@radix-ui/react-slider` |
| Custom button | Native `<button>` — no Radix needed |
| Custom input | Native `<input>` — no Radix needed |
| Data table | Native `<table>` with `../components/layout/table` |

**shadcn composition rules - enforce when using these primitives:**
- `Dialog`/`Sheet`/`Drawer` - always include `<DialogTitle>`/`<SheetTitle>`/`<DrawerTitle>`; use `className="sr-only"` if visually hidden (accessibility requirement)
- `Button` loading state — compose `<Button disabled><Spinner />{label}</Button>`; no `isPending`/`isLoading` prop
- `Avatar` — always include `<AvatarFallback>` for failed-image fallback
- Conditional classNames — `cn()` from `@components/utils/cn`; never manual template ternaries
- Flex spacing — `flex flex-col gap-*` not `space-y-*`; `flex gap-*` not `space-x-*`
- Equal dimensions - `size-*` shorthand (e.g. `size-10`) not `w-10 h-10`
- No manual `z-index` on overlays - Dialog, Sheet, Popover manage their own stacking

**Adaptation rule:**
- Use shadcn for behavior and structure.
- Use repo tokens, named classes, and Figma-driven spacing/typography for appearance.
- If the result still feels like generic shadcn instead of the original design, keep adapting until the behavior stays and the visuals align.

### Step 4 — Check package availability

Before referencing any Radix package, verify it exists in `package.json` at the prototype root. If missing:
```bash
npm install @radix-ui/react-<primitive>
```
Do not proceed until the user confirms installation.

### Step 5 — Implement

**File placement:**
- Reusable UI primitive → `../components/ui/<name>.tsx`
- Layout component → `../components/layout/<name>.tsx`
- Page-specific component → `src/app/<route>/`

**Imports:**
- Every new component file that uses tokens must include: `import '@styles/tokens.css'`
- Icons: `import { IconName } from '@phosphor-icons/react'` — no other icon libraries

**Code rules:**

*Styling:*
- All colors via `var(--*)` tokens — never hex, rgb, hsl
- All transitions via `var(--transition-fast)` or `var(--transition-smooth)` — never hardcode durations
- If no existing token fits a recurring design value cleanly, add a new reusable token to `styles/tokens.css` instead of hardcoding it inline
- Named CSS classes (`.btn-primary`, `.icon-button-secondary`, `.sidebar-tab`, `.input-group`, etc.) are sacred — never replace with bare Tailwind utilities
- Dark mode via `[data-theme="dark"]` on `<html>` — never Tailwind `dark:` prefix
- `focus-visible` with `var(--focus-ring)` — never `outline: none` without replacement
- `overscroll-behavior: contain` on all modal and drawer containers — prevents body scroll-through on mobile

*Structure:*
- `React.forwardRef` on any form element or interactive component
- `className` prop accepted for extension
- Compound components: `Object.assign(Root, { Sub1, Sub2 })`, export flat and compound forms

*Next.js / RSC (App Router):*
- Add `'use client'` to any file that uses `useState`, `useEffect`, event handlers (`onClick`, `onChange`), or browser APIs (`window`, `document`); omit on pure-render server components
- Never make a client component `async` — fetch data in a server parent and pass it down as props
- Props from server → client must be JSON-serializable — no `Date` objects, `Map`/`Set`, class instances, or functions (Server Actions are the exception)
- `useSearchParams` and `usePathname` require a `<Suspense>` boundary wrapping the component
- Use `next/image` (not bare `<img>`) for all static assets not sourced from Figma localhost URLs — it handles optimization, lazy loading, and prevents CLS
- `<title>` format for every page: `"Page Name — KPI"` — set via the `metadata` export in `layout.tsx` or `page.tsx`

*Interactive behavior:*
- Button hover: lifts instantly — 0ms `transition-duration` on `:hover`, ease-off on leave
- Button press: compresses to `scale(0.97)` at 100ms ease-out
- Button disabled: opacity 0.38–0.5 + `cursor-not-allowed` + semantic `disabled` — no hover/active animation
- Use Radix primitive for behavior with `asChild` to preserve existing visual elements:
  ```tsx
  // ✓ Correct
  <DialogPrimitive.Close asChild>
    <IconButton aria-label="Close" className="icon-button-secondary" />
  </DialogPrimitive.Close>

  // ✗ Wrong — stripping named class
  <DialogPrimitive.Close className="p-2 rounded hover:bg-gray-100">
    <X size={16} />
  </DialogPrimitive.Close>
  ```

*Accessibility:*
- Every interactive element: `aria-label`, `aria-describedby`, or visible label
- Decorative icons: `aria-hidden="true"`
- Standalone icons (no adjacent text): parent must have `aria-label`
- Async status areas: `aria-live="polite"` — never `role="alert"` for non-critical messages
- Form submit: move focus to first error field on submission
- Modal close: return focus to the trigger element
- After client-side page transition: move focus to the `<main>` content region (screen readers need to know the page changed)
- `scroll-margin-top` on anchored heading sections — prevents sticky header overlap on hash navigation
- Non-breaking space between numbers and units, keyboard shortcuts: `10&nbsp;MB`, `⌘&nbsp;K`, brand names
- Link/button text must be descriptive standalone — no "click here", "read more", "learn more"

*Forms (if the design includes inputs):*
- Every `<input>`: set `type`, `name`, `autoComplete`, and `inputMode` appropriately
  - Email: `type="email" name="email" autoComplete="email" inputMode="email"`
  - Password (existing): `type="password" name="current-password" autoComplete="current-password"`
  - Password (new): `type="password" name="new-password" autoComplete="new-password"`
- `spellCheck={false}` on email, password, and code inputs
- Show/hide toggle on password fields with icon swap animation
- `touch-action: manipulation` on form containers
- Never `onPaste` + `preventDefault`
- Input font size ≥ 16px

*Typography:*
- Headings and short copy: `text-wrap: balance`
- Body paragraphs: `text-wrap: pretty`
- Numbers, counters, stats: `font-variant-numeric: tabular-nums`
- Use `…` (U+2026), not `...`

*Animation:*
- `prefers-reduced-motion` guard on every transition/animation - replace directional motion with opacity fade, do not remove
- Never `transition: all` — list properties explicitly
- Never animate from `scale(0)` — start from `scale(0.95)` + `opacity: 0`
- Icon state swaps: `opacity` + `scale(0.8→1)` + `filter: blur(4px→0)` at 150ms
- Use CSS `transition` (interruptible) not `@keyframes` on interactive components
- SVG animations: apply `transform` to a `<g>` wrapper, not directly to `<svg>`; set `transform-box: fill-box; transform-origin: center` on the `<g>`

When motion or interaction feel matters, explicitly use `design-engineering-skill` to tune:
- sidebar open/close behavior
- modal and drawer entrance/exit
- hover, active, and focus transitions
- icon swaps, loading states, and success feedback

*Feedback & loading:*
- Destructive actions (delete, overwrite, disconnect): confirm with a dialog or provide an Undo window with timer
- Error messages state cause + fix — "Email must include an @ sign" not "Invalid email"
- Toasts: auto-dismiss in 3–5s, `aria-live="polite"`, never steal focus, never `role="alert"` for non-critical
- Loading states exceeding 300ms: show skeleton or spinner — never blank area
- Optimistic UI: update immediately, reconcile on response, offer rollback/Undo on failure

*React patterns:*
- `{condition && <Comp />}` where condition can be `0` or `NaN` → renders the value to DOM; use `{condition ? <Comp /> : null}`
- Sequential `await` on independent operations → `Promise.all()` to eliminate fetch waterfalls
- Derived state in `useEffect` + `setState` → compute directly during render; no effect needed
- Inline object/array as default prop (`prop = {}`, `prop = []` in signature) → hoist as module-level const; recreated on every render otherwise

### Step 6 — Self-review before writing

Check implementation against every item. Fix failures before writing the file:

**Tokens & design system**
- [ ] `@styles/tokens.css` imported; no hardcoded colors, shadows, or transition durations
- [ ] New tokens were added only when truly reusable and were placed in `styles/tokens.css`, not inline in component code
- [ ] No Tailwind `dark:` prefix; named CSS classes preserved (`.btn-primary`, `.sidebar-tab`, etc.)
- [ ] `cn()` from `@components/utils/cn` for all conditional classNames

**Accessibility & semantics**
- [ ] All interactive elements have label, `aria-label`, or `aria-describedby`; no `<div onClick>`/`<span onClick>`
- [ ] No `outline: none` without `:focus-visible` + `var(--focus-ring)` replacement
- [ ] Icons: `@phosphor-icons/react` only; decorative icons `aria-hidden="true"`
- [ ] Dialog/Sheet/Drawer has accessible title (or `className="sr-only"`); modal has `overscroll-behavior: contain`

**Images & assets**
- [ ] No bare `<img>` without `width`/`height`; `next/image` for project-owned assets
- [ ] Figma `localhost:` sources used directly — not re-downloaded or proxied

**Next.js / RSC**
- [ ] `'use client'` present if file uses hooks, events, or browser APIs; component is not `async`
- [ ] Server→client props JSON-serializable (no `Date`, `Map`, class instances, plain functions)
- [ ] Controlled `<input value>` has `onChange`; prefer `defaultValue` when keystroke state not needed
- [ ] `{condition && <Comp />}` → ternary where condition can be `0`/`NaN`

**Animation**
- [ ] `prefers-reduced-motion` guard on all transitions; no `transition: all`; no `scale(0)` start
- [ ] Icon state swaps: opacity + scale(0.8→1) + blur(4px→0) at 150ms

**Forms — if applicable**
- [ ] Every input: `type`, `name`, `autoComplete`, `inputMode`; `spellCheck={false}` on email/password/code
- [ ] `touch-action: manipulation` on containers; no `onPaste` + `preventDefault`; font size ≥ 16px

### Step 7 — Browser validation

```bash
agent-browser open http://localhost:3000<route>
agent-browser wait --load networkidle
agent-browser screenshot
# also check dark mode:
agent-browser eval 'document.documentElement.setAttribute("data-theme", "dark")'
agent-browser screenshot
agent-browser close
```

Compare both screenshots against the Figma reference from Step 1. Report differences using the same format as `/validate-figma`.

Use `agent-browser` deliberately here:
- inspect the component in the browser
- verify it no longer reads as default shadcn
- verify the interaction feel matches the intended design, not just the static screenshot

After local validation, do not self-approve completion. Hand the result to `ui-change-guard-agent` for the actual Phase 3 sign-off.

If repeated fixes reveal behavior you cannot explain, stop and hand off to `frontend-debug-agent` instead of continuing to patch.

### Step 8 — Output summary

```
## Adaptation complete: <ComponentName>

**File:** <path>
**Shared components used:** ../components/ui/Dialog
**Radix primitives added:** @radix-ui/react-dialog
**Tokens mapped:**
  - #1D4ED8 → var(--color-brand)
  - 16px gap → var(--space-4)
  - 0.2s ease-out → var(--transition-fast)

**Visual validation:** ✓ matches Figma / ✗ N differences remain (see above)
```
