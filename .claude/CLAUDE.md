# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js with webpack)
npm run build    # Production build (static export)
npm run start    # Serve production build
npm run lint     # ESLint (next/core-web-vitals + typescript)
```

No test runner is configured.

## Architecture

This is a **Next.js 16 App Router** authentication UI prototype (login → forgot password → email confirmation → reset password). Static export only (`output: "export"` in next.config.ts) — no server-side rendering or API routes.

### Monorepo Structure

The app lives in a monorepo where components and styles are shared across multiple prototypes:

```
/prototypes/
├── kpi-admin-login/        ← auth UI prototype (login → forgot → reset)
│   └── src/app/            ← page.tsx, layout.tsx, forgot-password/, check-email/, new-password/
├── kpi-site/               ← marketing/public site
│   └── src/app/            ← page.tsx, layout.tsx, not-found.tsx
├── admin-panel/            ← admin dashboard (removed — pages cleaned up)
│   └── src/app/            ← layout.tsx, analytics/, owner-admin-moderator/, media/
├── components/             ← shared across all prototypes
│   ├── layout/             ← Header.tsx, BackNavigation.tsx, Logo.tsx, sidebar.tsx, dashboard-shell.tsx, table.tsx
│   ├── ui/                 ← InputGroup.tsx, Button.tsx, IconButton.tsx, Badge.tsx, Card.tsx, Dialog.tsx, Tabs.tsx, sidebar-tab.tsx, pagination.tsx
│   ├── providers/          ← Providers.tsx, ThemeToggle.tsx
│   └── utils/              ← cn.ts (class merging utility)
├── styles/                 ← shared: tokens.css (design tokens — colors, spacing, shadows, transitions)
├── images/                 ← Logo.svg, new_logo.svg, logo-animation/ (Vite/Three.js logo prototype)
├── docs/                   ← user flow docs, animation references, implementation plans
├── skills-lock.json
└── tsconfig.json           ← root tsconfig with shared path aliases
```

Path aliases (via tsconfig.json):
- `@/*` → `./src/*`
- `@components/*` → `../components/*`
- `@styles/*` → `../styles/*`

The `experimental.externalDir: true` in next.config.ts enables webpack to resolve modules outside the app directory. TypeScript path mappings must explicitly include `next-themes` and `@phosphor-icons/react` because they're resolved from the shared components directory.

### Page Flow

```
/ (Login)
  → /forgot-password → /check-email → /new-password → / (reset complete)
```

All navigation is client-side. `BackNavigation` in `../components/layout/` uses `usePathname()` to render the correct back link for each page.

### Design System

- **Tokens:** `../styles/tokens.css` — CSS custom properties for colors, typography, spacing in both light and dark themes
- **Theming:** `next-themes` via `../components/providers/Providers.tsx`
- **Icons:** `@phosphor-icons/react`
- **Fonts:** Unbounded (display/titles), Onest (body) — loaded in `layout.tsx`
- **Tailwind v4** via `@tailwindcss/postcss`

Color roles: `--color-brand` (blue), `--color-destructive` (red), `--color-success` (green), `--bg-base`, `--text-primary`, `--border-subtle`.

### Key Patterns

- **Form validation:** Client-side only, inline errors, validated on blur and change, focus jumps to first error on submit. Error state: shake the input 3–5px horizontally (never 20px) at 300ms ease-out + red border at 150ms ease-out. See `design-engineering-skill/references/micro-interactions.md`
- **Password strength meter** (`/new-password`): Checks 4 criteria (length, lowercase, uppercase, digit); animated bar + contextual hint showing only the first unmet requirement
- **Accessibility:** Every interactive element has a visible label, `aria-live="polite"` on status messages, skip-to-content link, keyboard-navigable. Follow `../AGENTS.md` for all UX/accessibility decisions.
- **Motion:** Password strength transitions are disabled when `prefers-reduced-motion` is active. For all animation decisions (easing, duration, micro-interactions, entrance/exit patterns, delight states, jank fixes), start with `.claude/skills/design-engineering-skill/SKILL.md` — it has instant easing/duration answers and a "Something Feels Wrong" diagnostic for most common cases
- **Responsive:** Mobile-first; layout shifts from split (logo left, form right) to stacked at ≤810px

### Form Hardening (auth-critical)

Every `<input>` in this project is part of an authentication flow — these rules directly affect user success:

- IMPORTANT: Set `autocomplete` + meaningful `name` + correct `type` and `inputmode` on every input (e.g. `<input type="email" name="email" autoComplete="email" inputMode="email">`, `<input type="password" name="current-password" autoComplete="current-password">`)
- Never block paste on inputs — users paste passwords from managers; `onPaste` + `preventDefault` is a security anti-pattern
- Set `spellcheck="false"` on email, password, and code inputs — spellcheck underlines look broken on these
- Mobile `<input>` font-size must be ≥16px to prevent iOS auto-zoom on focus
- Placeholders should end with `…` and show example format: `"you@company.com…"` not `"Enter email"`
- Checkbox/radio: the `<label>` must wrap or be linked to the control so the entire row is one click/tap target — no dead zones between label text and the control
- Loading/submit buttons: show spinner + keep original label text visible, disable only after request starts (not before); prevents double-submit while keeping the action clear
- Add `touch-action: manipulation` on form containers to prevent 300ms tap delay and double-tap zoom on mobile
- Provide a show/hide toggle for password fields (animated icon swap per Icon System rules)
- Trim input values before validation and submission — trailing spaces from text expansion cause silent auth failures
- Enter key submits the focused form; in `<textarea>`, use ⌘/Ctrl+Enter to submit
- Accept free text first, validate after — never block typing in real-time
- Allow incomplete form submission to surface all validation errors at once

### Hit Targets & Touch

- Minimum interactive hit target: 24×24px on desktop, 44×44px on mobile
- If the visual element is smaller than the minimum (e.g. a 16px icon button), expand the hit area using padding or a `::after` pseudo-element — never shrink the target to match the visual
- Maintain ≥8px spacing between adjacent interactive targets to prevent mis-taps
- Set `-webkit-tap-highlight-color` to match the design system (or `transparent` to suppress the default blue flash, then provide your own `:active` state)

### Content Resilience

- Text containers must handle overflow: use `truncate`, `line-clamp-*`, or `break-words` depending on context
- Flex children need `min-w-0` to allow text truncation (without it, flex items refuse to shrink below content width)
- Handle empty states — no broken UI for empty strings, null values, or empty arrays; show a helpful message + next action
- Use the `…` ellipsis character (U+2026), not three dots `...`
- Components must be resilient to user-generated content: test with very short, average, and very long strings

### URL State & Navigation

- Links must use `<a>` or Next.js `<Link>` for navigation — this enables Cmd/Ctrl+click, middle-click, and right-click → Open in New Tab
- Never use `<div onClick>` or `<span onClick>` for navigation — this breaks standard browser link behavior
- Back/Forward browser buttons should restore scroll position
- URL should reflect meaningful state (active tab, expanded panel, filter selections) so pages are deep-linkable

### Shared Components (../components/)

- `layout/Header.tsx` — Logo + theme toggle
- `layout/BackNavigation.tsx` — Route-aware back button
- `layout/Logo.tsx` — SVG logo (supports 3D animation variant)
- `ui/InputGroup.tsx` — Reusable labeled input with error state
- `providers/Providers.tsx` — next-themes wrapper
- `providers/ThemeToggle.tsx` — Light/System/Dark switcher

---

## Figma MCP Integration Rules

These rules define how to translate Figma inputs into code for this project. Follow them for every Figma-driven change.

### Required Workflow (do not skip steps)

1. Run `get_design_context` first to fetch the structured representation for the exact node(s)
2. If the response is too large or truncated, run `get_metadata` for the high-level node map, then re-fetch only the required node(s)
3. Run `get_screenshot` for a visual reference of the node being implemented
4. Only after both steps above, download any assets needed and start implementation
5. Translate the output (usually React + Tailwind) into this project's conventions, styles, and framework
6. Validate against Figma for 1:1 look and behavior before marking complete

### Component Organization

- IMPORTANT: Always check `../components/` for existing components before creating new ones
- Layout components go in `../components/layout/`
- UI primitives go in `../components/ui/`
- Theme/provider utilities go in `../components/providers/`
- Page-level components stay inside `src/app/[route]/page.tsx`
- Import shared components using path aliases: `@components/layout/Header`, `@components/ui/InputGroup`

### Styling Rules

- IMPORTANT: Always import and use `@styles/tokens.css` for all colors — never hardcode hex, rgb, hsl, or named color values
- Use `var(--color-brand)`, `var(--color-destructive)`, `var(--color-success)`, etc.
- Spacing and layout values must reference `var(--*)` tokens (e.g. `var(--space-*)`, `var(--padding-*)`)
- Shadows use `var(--shadow-brand)`, `var(--shadow-*)`; never hardcode `box-shadow` values — prefer shadows over solid borders for depth; shadows adapt to any background via transparency
- Transitions use `var(--transition-fast)` or `var(--transition-smooth)`; never hardcode durations
- Concentric border radius: when an element with `border-radius` contains an inner element with its own radius, use `outer_radius = inner_radius + padding` (e.g. card at 20px with 8px padding → inner element gets 12px)
- Use Tailwind v4 utilities with CSS variable references: `text-(--text-primary)`, `bg-(--bg-subtle)`, `border-(--border-subtle)`
- Dark theme is controlled by `[data-theme="dark"]` on `<html>` via `next-themes` — do not use Tailwind's `dark:` prefix

### Dark Mode Polish

- Set `color-scheme: dark` on `<html>` when the dark theme is active — this fixes native form controls (scrollbars, `<select>`, `<input type="date">`) rendering with light-mode chrome in a dark UI
- `<meta name="theme-color">` should match the current page background color and update on theme change — this colors the browser toolbar/address bar to match the page
- Native `<select>` elements: always set explicit `background-color` and `color` — Windows renders them with default OS styling otherwise, breaking dark mode
- Layered shadows for depth: combine an ambient shadow (soft, large spread) with a direct shadow (sharp, small offset) — a single `box-shadow` value looks flat
- Avoid dark-color gradient banding — on large dark gradients, CSS can produce visible color steps; use a subtle noise texture or `background-image` with dithering when banding is visible
- Increase contrast on `:hover`, `:active`, and `:focus` states — in dark mode, state changes are harder to perceive; bump contrast noticeably beyond the resting state
- Dark mode uses desaturated/lighter tonal variants, not inverted colors — test contrast separately for each theme, don't assume light-mode values transfer
- Borders and dividers must remain visible in both themes — a border that works on white may vanish on dark surfaces; use `var(--border-subtle)` which is theme-aware
- Modal/drawer scrim opacity: 40–60% black to isolate foreground content from the background; too light and the background competes visually

### Design Tokens (`../styles/tokens.css`)

| Token category | Example variables |
|---|---|
| Colors | `--color-brand`, `--color-destructive`, `--color-success`, `--color-warning`, `--color-info` |
| Backgrounds | `--bg-base`, `--bg-subtle`, `--bg-card`, `--bg-muted` |
| Text | `--text-primary`, `--text-muted`, `--text-subtle` |
| Borders | `--border-subtle`, `--border-subtle-plus` |
| Shadows | `--shadow-btn-secondary`, `--sidebar-tab-active-shadow` |
| Transitions | `--transition-fast` (0.15s), `--transition-smooth` (0.3s cubic-bezier) |
| Focus rings | `--focus-ring`, `--focus-ring-error`, `--focus-ring-success` |

### Radix UI + shadcn Authoring Pattern

> **UI stack & version policy:** The canonical Radix UI and shadcn/ui versions in use are pinned in `package.json` at the workspace/prototype root. Always check `package.json` before assuming a version — do not upgrade Radix or shadcn/ui packages without updating this guidance to reflect any breaking API changes.

**shadcn/ui is built on top of Radix UI** — they are not two separate things. Radix provides headless, unstyled behavior primitives (`@radix-ui/react-dialog`, `@radix-ui/react-slot`, etc.); shadcn is a set of copy-paste components that wrap those primitives with Tailwind styling and authoring conventions. When we say "use Radix/shadcn patterns" we mean: use Radix primitives for behavior, and follow shadcn's structural conventions (`asChild`, `cn()`, `data-slot`, compound components).

**Radix is the behavioral foundation — never the visual replacement.**

- **Keep all custom CSS class names intact.** Classes like `.btn-primary`, `.icon-button-secondary`, `.sidebar-tab`, `.input-group` etc. are defined in tokens.css and carry polished, production-ready visual styles. Never strip them out.
- **Keep all custom inline styles and design tokens intact.** Any `text-(--text-primary)`, `bg-(--bg-subtle)`, `shadow-[var(--shadow-subtle)]`, transition classes, and focus-ring utilities that were already there must stay.
- **Radix primitives add behavior, not style.** Use `@radix-ui/react-dialog` for focus-trapping/portal/Escape key. Use `@radix-ui/react-slot` to enable `asChild` polymorphism. Use `DialogPrimitive.Title/Description` for correct ARIA semantics. None of this replaces visual styling.
- **The correct composition pattern:** wrap the existing visual component with the Radix primitive using `asChild`. For example, `<DialogPrimitive.Close asChild><IconButton … /></DialogPrimitive.Close>` — the `IconButton` keeps its `.icon-button-secondary` class; Radix just wires up the close behavior.
- **Never substitute bare Tailwind utilities for existing named CSS classes** just because they are "more explicit". The named classes exist specifically to encode the design system's visual contract.

### Component Patterns

- All components must accept a `className` prop for styling extension
- Extend native HTML element attributes: `React.ButtonHTMLAttributes<>`, `React.InputHTMLAttributes<>`
- Use `React.forwardRef` for any form element or interactive component
- Compound components use `Object.assign(Root, { Sub1, Sub2 })` and export both flat and compound forms
- Status variants follow the union type: `status: "default" | "success" | "error"`
- IMPORTANT: All interactive components must have `aria-label`, `aria-describedby`, or visible label
- Button states: hover lifts instantly (0ms transition-duration on `:hover`, ease-off on leave); press compresses to `scale(0.97)` at 100ms ease-out; disabled state has no hover/active animation — opacity only. See `design-engineering-skill/references/micro-interactions.md`
- Interactive transitions must use CSS `transition` (interruptible), not `@keyframes animation` (which restarts from zero when interrupted mid-flight)
- Disabled state: reduced opacity (0.38–0.5) + `cursor-not-allowed` + semantic `disabled` attribute — no hover/active animation

### Animation Refinements

These extend the motion rules in Key Patterns and Component Patterns:

- Never use `transition: all` — always list properties explicitly (e.g. `transition: transform 0.2s ease-out, opacity 0.2s ease-out`); `all` causes unexpected transitions on properties you didn't intend and can trigger expensive reflows
- Exit animations should be shorter than enter (~60–70% of enter duration) — exiting content is less important; users want it gone fast

### Feedback & Destructive Actions

- Confirm destructive actions with a dialog or provide an Undo window (e.g. "Undo delete" toast with a timer)
- Optimistic UI: update the interface immediately on user action, reconcile when the server responds, rollback or offer Undo on failure
- Error messages must state the cause + how to fix it — "Invalid email" is bad; "Email must include an @ sign" is good
- Toasts: auto-dismiss in 3–5 seconds, must not steal focus, announced via `aria-live="polite"` — never use `role="alert"` for non-critical messages
- First tooltip: show after a short delay (~300ms); subsequent sibling tooltips while hovering: show instantly (group delay pattern)
- Loading states exceeding 300ms must show a skeleton or progress indicator — never leave users staring at a blank area

### Icon System

- Icons use `@phosphor-icons/react` exclusively — do NOT install other icon libraries
- IMPORTANT: If the Figma MCP server returns a localhost source for an SVG/image, use that source directly
- Standard icon size: `16` or `24` (px); use the `size` prop
- Icons decorating text must have `aria-hidden="true"`
- Icons used standalone (no adjacent text) must have a parent with `aria-label`
- When an icon changes state contextually (e.g. copy→check, eye→eye-slash, sun→moon), animate the swap with `opacity` + `scale(0.8→1)` + `filter: blur(4px→0)` at 150ms — never swap icons without transition. See `design-engineering-skill/references/make-interfaces-feel-better.md`

### Typography

- Display/headings: `font-family: var(--font-display)` (Unbounded) — loaded in `layout.tsx`
- Body text: `font-family: var(--font-body)` (Onest) — loaded in `layout.tsx`
- Do not import fonts locally; they are already loaded globally
- Headings and short copy: `text-wrap: balance` — prevents orphaned words on the last line
- Body paragraphs: `text-wrap: pretty` — smarter wrapping algorithm for longer text
- Counters, prices, stats, any updating number: `font-variant-numeric: tabular-nums` — prevents layout shift when digits change
- Apply `-webkit-font-smoothing: antialiased` globally — makes text render crisper, especially in dark mode

### Accessibility Requirements

- Focus styles must use `focus-visible` with `var(--focus-ring)` — never `outline: none` without replacement
- `prefers-reduced-motion`: replace directional motion with opacity fade, do not remove entirely
- Move focus to first error on form submit; return focus to trigger on modal close
- `<title>` format: "Forgot Password — KPI" not just "KPI"
- IMPORTANT: For all accessibility decisions, consult `.claude/skills/accessibility-engineering/SKILL.md`

### Asset Handling

- IMPORTANT: Use localhost asset sources from the Figma MCP server directly — do not re-download or proxy
- IMPORTANT: Do not use or create placeholder images if a localhost source is provided
- Static assets go in `public/` (images, icons not from Figma)
- Do not commit large binary assets to the repo

### Development Standards

- IMPORTANT: For all React/Next.js code, always consult `.claude/skills/vercel-react-best-practices/` before writing or reviewing components
- IMPORTANT: For all Next.js-specific patterns, consult `.claude/skills/next-best-practices/` — open the specific sub-file that matches the trigger:

  | Trigger / Task | Sub-file |
  |---|---|
  | App Router special files (`page.tsx`, `layout.tsx`, `error.tsx`, `route.ts`, `default.tsx`) | `file-conventions.md` |
  | `'use client'` + `async function`, or passing non-plain props server→client | `rsc-boundaries.md` |
  | `params`, `searchParams`, `cookies()`, `headers()` access (Next.js 15+) | `async-patterns.md` |
  | Adding or auditing `'use client'` / `'use server'` / `'use cache'` | `directives.md` |
  | `useRouter`, `usePathname`, `useSearchParams`, `generateStaticParams`, `generateMetadata` | `functions.md` |
  | `error.tsx`, `not-found.tsx`, `redirect()`, `notFound()`, `forbidden()`, `unauthorized()` | `error-handling.md` |
  | Deciding where/how to fetch data; preventing sequential waterfalls | `data-patterns.md` |
  | Creating `route.ts` API endpoint | `route-handlers.md` |
  | `metadata` export, `generateMetadata`, OG image generation | `metadata.md` |
  | Any `<img>` tag or image import | `image.md` |
  | Font loading, `next/font`, `@import` fonts | `font.md` |
  | `window is not defined`, `require() of ES Module`, dynamic imports, `ssr: false` | `bundling.md` |
  | Third-party `<script>` tags, Google Analytics / GTM | `scripts.md` |
  | "Hydration failed" / server-client HTML mismatch | `hydration-error.md` |
  | `useSearchParams` or `usePathname` without Suspense wrapper | `suspense-boundaries.md` |
  | `@slot` parallel routes, intercepting routes `(.)`, modal patterns | `parallel-routes.md` |
  | `export const runtime = 'edge'` | `runtime-selection.md` |
  | Docker, standalone output (`output: 'standalone'`), multi-instance ISR | `self-hosting.md` |
  | Next.js build errors, `/_next/mcp` dev endpoint, `--debug-build-paths` | `debug-tricks.md` |
- IMPORTANT: For all UI decisions (accessibility, layout, interactions, responsiveness), always consult `.claude/skills/web-interface-guidelines/`
- IMPORTANT: For all animations, transitions, micro-interactions, easing, hover states, entrance/exit patterns, delight moments, UI polish, or "this feels off" problems, start with `.claude/skills/design-engineering-skill/SKILL.md` — it contains the 4 easing questions, duration table, 7 instant wins, and a "Something Feels Wrong" diagnostic you can apply immediately. Then open the specific sub-file:

  | Trigger / Task | Sub-file |
  |---|---|
  | Choosing easing, duration, CSS vs. spring | `references/web-animations.md` |
  | Button states, hover/press, toggle, checkbox, icon swap, form validation, loading | `references/micro-interactions.md` |
  | Modal, toast, dropdown, sidebar, list add/remove, page transition | `references/entrance-exit-patterns.md` |
  | Success state, confetti, like button, achievement unlock, onboarding milestone | `references/joy-delight.md` |
  | Choppy/janky animation, frame drops, Safari blur lag, layout thrashing | `references/performance-diagnosis.md` |
  | Animation "feels off" but you can't name why — use Disney principles to diagnose | `references/disney-12-principles.md` |
  | Text wrapping, concentric radius, shadow vs. border, tabular nums, stagger | `references/make-interfaces-feel-better.md` |
  | clip-path reveals, tabs transition, interruptibility, motion cohesion | `references/userinterface-wiki.md` |
  | Hover flicker, wrong transform-origin, tooltip group delay, blur trick | `references/web-animations/practical-tips.md` |
- IMPORTANT: For ALL debugging tasks (bugs, test failures, unexpected behavior, build errors, performance problems), use `.claude/skills/systematic-debugging/SKILL.md`. **Iron Law: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.** Follow the 4-phase approach (Root Cause → Pattern → Hypothesis → Implementation) defined in that file.

### Performance Baseline

- Explicit `width` and `height` (or `aspect-ratio`) on all `<img>` elements — prevents Cumulative Layout Shift (CLS target: <0.1)
- Debounce/throttle high-frequency events: scroll, resize, input (e.g. password strength check should debounce, not fire per keystroke)
- Prefer uncontrolled inputs (`defaultValue`) when you don't need per-keystroke state; controlled inputs must be cheap per keystroke

### Navigation Patterns

These rules apply when building navigation structures — tabs, sidebars, bottom navs, breadcrumbs, or multi-page flows. Follow them for any new prototype or when extracting navigation from Figma designs.

#### Hierarchy & Structure

- Primary navigation (top-level destinations) and secondary navigation (settings, sub-pages) must be clearly separated — never mix them at the same level
- Bottom navigation: max 5 items; every item must have both an icon and a text label — icon-only nav hurts discoverability
- Sidebar/drawer: use for secondary navigation or supplementary content, not for primary actions
- Breadcrumbs: use for hierarchies 3+ levels deep to aid orientation; each crumb is a link except the current page
- Adaptive navigation: screens ≥1024px prefer a persistent sidebar; small screens use bottom nav or hamburger menu
- Never mix Tab + Sidebar + Bottom Nav at the same hierarchy level — pick one pattern per level
- Each screen should have only one primary CTA; secondary actions must be visually subordinate

#### State & Behavior

- Current location must be visually highlighted in navigation — use color, font-weight, or an active indicator (e.g. underline, pill background)
- Back navigation must be predictable and consistent — preserve scroll position, filter state, and input values when navigating back
- Never silently reset the navigation stack or unexpectedly jump to the home page
- Navigating back must restore previous scroll position, filter state, and form input
- Modals must not be used for primary navigation flows — they break the user's spatial model and back-button behavior
- Modals and sheets must offer a clear close/dismiss affordance; support swipe-to-dismiss on mobile
- Overflow menu: when actions exceed available space, use an overflow/more menu (`...`) instead of cramming

#### Accessibility

- After a client-side page transition, move focus to the `<main>` content region — screen reader users need to know the page changed
- Core navigation must remain reachable from deep pages; don't hide it entirely in sub-flows
- Dangerous actions (delete account, logout) must be visually and spatially separated from normal navigation items
- Navigation items with pending state (unread count, notifications) use badges sparingly — clear the badge after the user visits
- When a navigation destination is unavailable, explain why with a message instead of silently hiding the item

### Browser Automation (`browser-use` + `agent-browser`)

Two browser automation CLIs are available. Both control real Chromium via a persistent background daemon.

| Tool | Element targeting | Best for |
|---|---|---|
| `browser-use` (v0.12.3) | Numeric indices from `state` | Quick screenshots, simple interactions, Python scripting |
| `agent-browser` | Semantic refs (`@e1`, `@e2`) from `snapshot -i` | Complex flows, diff verification, annotated screenshots, device emulation, network inspection |

**Default choice:** Use `agent-browser` for any task that involves more than opening a page and taking a screenshot. Its ref-based targeting, diff verification, and annotated screenshots are significantly more reliable for form-heavy UI work.

#### When to use

| Trigger | What to do |
|---|---|
| After implementing or changing any UI component | Open the page, screenshot, visually verify against the design |
| Figma implementation — validating 1:1 fidelity | Use `agent-browser diff screenshot --baseline` to pixel-compare against the saved Figma reference |
| Testing the auth page flow (`/` → `/forgot-password` → `/check-email` → `/new-password`) | Walk the full navigation path with `snapshot -i` at each page, verify each renders correctly |
| Form validation behavior (error shake, red border, focus jump) | Fill inputs with invalid data via `fill @ref`, submit, `diff snapshot` to verify error states appear |
| Dark / light theme switching | Use `agent-browser --color-scheme dark` to force dark mode, or toggle via ThemeToggle and verify `[data-theme="dark"]` on `<html>` |
| Responsive layout at ≤810px breakpoint | Use `agent-browser set device "iPhone 14"` or `set viewport 390 844` to test stacked layout |
| Password strength meter on `/new-password` | Type progressively stronger passwords with `fill`, use `snapshot -i` after each to verify bar + hint update |
| Hydration error or visual bug reported in the browser | Open with `--headed`, reproduce steps, use `screenshot --annotate` to see element mapping |
| Checking `prefers-reduced-motion` behavior | Use `eval` to force the media query, verify opacity fallback replaces directional motion |
| Verifying the built static export (`out/`) | Serve `out/` and open it — confirm `npm run build` output is correct |
| Verifying a code change had the intended DOM effect | `snapshot -i` → make change → `diff snapshot` to see exactly what changed |
| Debugging slow page loads or API issues | `agent-browser network har start` → reproduce → `network har stop capture.har` |
| Recording a walkthrough for documentation | `agent-browser record start demo.webm` → perform flow → `record stop` |

#### When NOT to use

- Reading or searching code — use `Read`, `Grep`, `Glob` instead
- Simple text/style changes with no visual ambiguity
- When `npm run dev` is not already running (start it first: `npm run dev`)
- To look up documentation or external references — use `WebFetch`

#### Mandatory workflow — every session

**With `agent-browser` (preferred):**

```bash
# 1. Open the page (dev server must be running on port 3000)
agent-browser open http://localhost:3000

# 2. Wait for page to fully load
agent-browser wait --load networkidle

# 3. ALWAYS snapshot first — get refs for every interactive element
agent-browser snapshot -i

# 4. Interact using refs from snapshot
agent-browser fill @e1 "test@example.com"
agent-browser fill @e2 "Password123"
agent-browser click @e3

# 5. Re-snapshot after ANY navigation or DOM change (refs are now stale)
agent-browser wait --load networkidle
agent-browser snapshot -i

# 6. Verify with screenshot or diff
agent-browser screenshot                    # visual check
agent-browser diff snapshot                 # see what changed in the DOM

# 7. Clean up when done
agent-browser close
```

**Critical rules:**
- **Never interact without inspecting first** — always run `snapshot -i` before any click/fill
- **Re-snapshot after every navigation** — refs are invalidated by page changes, DOM updates, modal opens
- **Wait for page load** — use `agent-browser wait --load networkidle` after `open` and after form submissions

#### Project-specific commands

```bash
# ── Auth flow pages ──
agent-browser open http://localhost:3000                  # Login
agent-browser open http://localhost:3000/forgot-password
agent-browser open http://localhost:3000/check-email
agent-browser open http://localhost:3000/new-password

# ── Theme verification ──
agent-browser eval 'document.documentElement.getAttribute("data-theme")'
agent-browser --color-scheme dark open http://localhost:3000
agent-browser --color-scheme light open http://localhost:3000

# ── CSS token verification ──
agent-browser eval 'getComputedStyle(document.documentElement).getPropertyValue("--color-brand").trim()'

# ── Responsive testing (≤810px breakpoint) ──
agent-browser set viewport 390 844
agent-browser set device "iPhone 14"
agent-browser set viewport 1280 720     # back to desktop
```

#### Cleanup rule

**Always close the browser when the task is complete:**

```bash
agent-browser close                # close current session
# or
agent-browser close --all          # close all sessions (nuclear option)
```

The daemon keeps the browser alive in the background — it will persist indefinitely if not explicitly closed. Do not leave sessions open between unrelated tasks.

---

### What Not to Do

- Never hardcode colors, font families, spacing values, or shadow definitions
- Never install new CSS frameworks — Tailwind v4 + CSS custom properties is the styling stack
- Never use `styled-components`, `emotion`, or CSS-in-JS
- Never bypass the `Providers` wrapper; always ensure `next-themes` context is present
- Never use Tailwind's `dark:` variant — dark mode is `[data-theme="dark"]`
- Never add server-side API routes — this is a static export
- Never animate from `scale(0)` — always start from `scale(0.95)` + `opacity: 0` so the element has visible shape
- Never use `linear` easing for interactive UI elements — it feels robotic; use `ease-out` for enter/exit
- Never animate layout properties (`top`, `left`, `height`, `width`, `margin`, `padding`) — use `transform` equivalents which are GPU-accelerated
- Never store animation progress in React `useState` — it triggers a re-render on every frame; use `useMotionValue` or CSS transitions instead
- Never use `<div onClick>` or `<span onClick>` for navigation — use `<a>` or `<Link>` so Cmd/Ctrl+click, middle-click, and right-click work
- Never use `<div>` or `<span>` with click handlers as buttons — use native `<button>` for correct keyboard/screen-reader behavior
- Never use `user-scalable=no` or `maximum-scale=1` in the viewport meta — this disables zoom for users who need it
- Never use `outline: none` or `outline: 0` without providing a visible `:focus-visible` replacement
- Never render images without explicit `width`/`height` or `aspect-ratio` — this causes Cumulative Layout Shift
- Never render large arrays (>50 items) with `.map()` without virtualization — DOM node count kills performance
- Never hardcode date, time, or number formats — use `Intl.DateTimeFormat` and `Intl.NumberFormat` for locale-aware formatting
- Never show an error message without stating what to do about it — "Invalid input" is not actionable; "Email must include an @ sign" is
