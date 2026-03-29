---
description: Cross-prototype consistency audit — tokens, accessibility, anti-patterns
argument-hint: [prototype] (kpi-admin-login | kpi-site | admin-panel | all)
---

# Cross-Prototype Consistency Audit

Audit target: **$ARGUMENTS** (default: all three prototypes + shared components)

## Step 0 — Load token vocabulary FIRST (required)

Before scanning any files, read `../styles/tokens.css` (path from any prototype: `prototypes/styles/tokens.css`).
Build an internal lookup table covering every variable in the file:

| Category | Variables to index |
|---|---|
| Colors | `--color-brand`, `--color-destructive`, `--color-success`, `--color-warning`, `--color-info` |
| Backgrounds | `--bg-base`, `--bg-subtle`, `--bg-card`, `--bg-muted` |
| Text | `--text-primary`, `--text-muted`, `--text-subtle` |
| Borders | `--border-subtle`, `--border-subtle-plus` |
| Shadows | `--shadow-btn-secondary`, `--sidebar-tab-active-shadow`, all `--shadow-*` |
| Transitions | `--transition-fast`, `--transition-smooth` and their values |
| Focus rings | `--focus-ring`, `--focus-ring-error`, `--focus-ring-success` |
| Spacing | all `--space-*`, `--padding-*` |
| Fonts | `--font-display`, `--font-body` |

Use this table to:
1. Suggest the **exact correct token** for each hardcoded value (e.g. `#2563eb → var(--color-brand)`)
2. Flag values that look like they should match a token but don't quite — flag as likely typo
3. Skip flagging values inside `tokens.css` itself

Scan all `.tsx`, `.ts`, `.css` files in the requested scope. Report issues grouped by file using `file:line` format. Be terse — state issue + location only, skip explanation unless the fix is non-obvious.

## Scope resolution

- `all` or no argument → scan `kpi-admin-login/src`, `kpi-site/src`, `admin-panel/src`, `../components/`, `../styles/`
- `kpi-admin-login` → scan `kpi-admin-login/src` only
- `kpi-site` → scan `kpi-site/src` only
- `admin-panel` → scan `admin-panel/src` only

---

## Checks

### 1. Hardcoded design values (MUST use tokens)
For each violation, use the token table from Step 0 to suggest the exact `var(--*)` replacement.
- Hex colors: `#[0-9a-fA-F]{3,8}` in className strings or inline styles
- rgb/hsl/oklch literals outside of `tokens.css`
- Hardcoded `box-shadow` values — match to `--shadow-*`
- Hardcoded transition durations (`0.15s`, `300ms`, etc.) — match to `--transition-fast` or `--transition-smooth`
- Hardcoded `font-family` strings — match to `--font-display` or `--font-body`
- Hardcoded spacing in inline styles — match to `--space-*` or `--padding-*`
- Components that use tokens but never `import '@styles/tokens.css'` or `@import '../styles/tokens.css'` — flag missing import

### 2. Dark mode anti-patterns
- Tailwind `dark:` prefix anywhere — must use `[data-theme="dark"]` selector instead
- Dark theme active but `color-scheme: dark` not set on `<html>` — required for native form controls (scrollbars, `<select>`, date inputs)
- `<meta name="theme-color">` static/missing — should update on theme change to match page background

### 3. Animation anti-patterns
- `transition: all` — must list properties explicitly (e.g. `transition: transform 0.2s, opacity 0.2s`)
- Hardcoded ms durations in transition/animation — use tokens
- `ease-in` easing on enter/exit — slow start delays visual feedback; use `ease-out`
- `linear` easing on interactive UI elements — use `ease-out` for enter/exit
- Animation starting from `scale(0)` — must start ≥ `scale(0.95)` + `opacity: 0`
- Layout properties in transition list: `top`, `left`, `width`, `height`, `margin`, `padding` — use `transform` equivalents
- `@keyframes` used on interactive components where CSS `transition` should be used instead — `@keyframes` restarts from zero when interrupted mid-flight
- Exit animation duration ≥ enter duration — exits should be ~60–70% of enter
- No `prefers-reduced-motion` guard when animation/transition code is present — must provide `opacity`-only fallback (do not remove entirely)
- `:hover` missing instant-on pattern — base element carries the ease-off transition; `:hover` override must set `transition-duration: 0ms` so it snaps in immediately

### 4. Accessibility violations
- `<div` or `<span` with `onClick` as button — must be `<button>`
- `<div` or `<span` with `onClick` as navigation — must be `<a>` or `<Link>`
- Icon-only button without `aria-label` (look for `<IconButton` or `<button` containing only icon children)
- `outline: none` or `outline: 0` without `focus-visible` replacement using `var(--focus-ring)`
- `<img` without `width` and `height` (or `aspect-ratio`)
- `role="alert"` on non-critical messages — must use `aria-live="polite"` instead
- Missing `aria-live="polite"` on async status areas (toast containers, validation result zones)
- `<input` without associated `<label>` or `aria-label`
- `user-scalable=no` or `maximum-scale=1` in viewport meta
- Form submit with errors: focus must move to first error field — check for `focus()` call on submit handler
- Modal close: focus must return to trigger element — check for `focus()` on close handler
- `tabIndex` > 0 — positive tabindex breaks natural DOM order; only `0` or `-1` are valid (WCAG 2.4.3)
- Heading levels skipped (e.g. `<h1>` followed by `<h3>`) — must be sequential; never skip for visual styling
- Non-descriptive link/button text ("click here", "read more", "learn more", "here") — must be meaningful standalone (WCAG 2.4.6)
- Skip link absent from layout files — every layout must render `<a href="#main">Skip to main content</a>`, visible on focus
- `aria-hidden="true"` on a focusable element (`button`, `a`, `input`) — must also add `tabIndex={-1}` or remove `aria-hidden`
- Color-only state indicator — error/warning/success must pair color with an icon or text label, not color alone (WCAG 1.4.1)

### 5. Form anti-patterns
- `onPaste` with `preventDefault` — blocks password managers; remove entirely
- `<input type="email"` missing `autoComplete="email"` or `inputMode="email"`
- `<input type="password"` missing `autoComplete` attribute (`current-password` or `new-password`)
- Any `<input` missing a meaningful `name` attribute
- `spellcheck` not set to `false` on email, password, and code inputs — underlines look broken
- No show/hide toggle on password fields
- `touch-action: manipulation` missing on form containers — prevents 300ms tap delay on mobile
- Input font size below 16px — triggers iOS auto-zoom on focus
- Placeholder missing `…` suffix and example format (e.g. `"you@company.com…"` not `"Enter email"`)
- Checkbox or radio where `<label>` does not wrap or link to the control — dead zone between text and control

### 6. Icon system violations
- Icon library other than `@phosphor-icons/react` imported — no other icon libraries allowed
- Decorative icon (adjacent to text) without `aria-hidden="true"`
- Standalone icon (no adjacent text) whose parent lacks `aria-label`
- Icon state swap (e.g. eye/eye-slash, copy/check) without opacity + scale + blur transition at 150ms

### 7. Typography violations
- Heading or short-copy element missing `text-wrap: balance`
- Body paragraph missing `text-wrap: pretty`
- Counter, price, stat, or updating number missing `font-variant-numeric: tabular-nums`
- Global CSS missing `-webkit-font-smoothing: antialiased`
- Three dots `...` used instead of ellipsis character `…` (U+2026) in JSX text

### 8. Content resilience
- Flex container with text children missing `min-w-0` — flex items won't shrink below content width
- Array rendered with `.map()` with no empty-state fallback — broken UI for empty arrays
- Text container with no overflow handling (`truncate`, `line-clamp-*`, or `break-words`)

### 9. Shared component duplication
- Component defined locally inside a prototype that already exists in `../components/`
- Component nearly identical across two prototypes that should be extracted to `../components/`

### 10. Performance
- `.map()` on unbounded or likely >50-item arrays with no virtualization
- `useState` storing animation progress — use CSS transitions or `useMotionValue`

### 11. React / Next.js performance
- Barrel-file import with no subpath (e.g. `from '@components'`, `from '../components'`) — import directly from the source file to avoid pulling in unused module graph
- Sequential `await` on independent operations — use `Promise.all()` to eliminate fetch waterfalls
- `{condition && <Comp />}` where `condition` could be `0` or `NaN` — renders the falsy value to the DOM; use `{condition ? <Comp /> : null}`
- Derived state computed inside `useEffect` + `setState` — compute directly during render; no effect needed
- Inline object/array as default prop (`prop = {}`, `prop = []` in function signature) — new reference every render; hoist as module-level const

---

## Output format

Group by file. One issue per line. Use `file:line` for clickable links.

```
## kpi-admin-login/src/app/page.tsx

kpi-admin-login/src/app/page.tsx:34 — hardcoded #1A2B3C → var(--color-brand)
kpi-admin-login/src/app/page.tsx:78 — dark: prefix → use [data-theme="dark"]
kpi-admin-login/src/app/page.tsx:91 — transition: all → list properties explicitly

## components/ui/Button.tsx

✓ pass
```

After all files:

**Summary** — counts per category (e.g. "Hardcoded values: 4, Accessibility: 2, Animation: 1, Form: 1, React perf: 2 …")

**Top 3 priorities** — highest-impact fixes to do first
