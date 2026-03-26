# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deprecated local GSD commands/templates

This repository previously shipped a local "Get Shit Done" (GSD) distribution under:

- `.claude/get-shit-done/**` (templates, references, VERSION, etc.)
- `.claude/commands/gsd/*` (command definitions)

Those assets and commands have been removed from this repo and are no longer maintained here. Any onboarding docs, automations, or tooling that assumed these paths exist will break unless updated.

If you still rely on the old local GSD setup, you should either:

- Restore the required files from your Git history into a separate, project-specific location, and update your tooling to point there; or
- Update your onboarding/docs/automation to use the new, centralized GSD distribution (if your team maintains one), and document that location in your own README/process docs.

New contributions to this repo should not depend on `.claude/get-shit-done/**` or `.claude/commands/gsd/*` being present.

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

- Every interactive element must have a visible label or `aria-label`
- Status/error messages must use `aria-live="polite"` or `aria-describedby`
- Focus styles must use `focus-visible` (not `focus`) with `var(--focus-ring)`
- Respect `prefers-reduced-motion` — replace directional/spatial motion with an opacity fade; do not simply remove the animation entirely, as this removes state-change communication. Use `useReducedMotion()` from Framer Motion when applicable
- Use semantic HTML: native `<button>`, `<input>`, `<form>`, `<nav>`, `<main>`, etc.

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
- IMPORTANT: For ALL debugging tasks (bugs, test failures, unexpected behavior, build errors, performance problems), use `.claude/skills/systematic-debugging/SKILL.md`. **The Iron Law: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST. You cannot propose fixes before completing Phase 1.**

  **4 mandatory phases — complete each before proceeding:**
  1. **Root Cause** — read the full error/stack trace, reproduce consistently, check recent changes (`git diff`), trace the bad value upstream to where it originates (not where it surfaces)
  2. **Pattern** — find working similar code in the codebase, compare against broken, list every difference (none are too small)
  3. **Hypothesis** — state ONE specific theory ("X because Y"), make the smallest possible change to test it; one variable at a time
  4. **Implementation** — create a failing test first, implement ONE fix, verify. If 3+ fixes have failed → stop, question the architecture, discuss before attempting more

  **Stop and return to Phase 1 if you catch yourself thinking:**
  - "Quick fix for now, investigate later"
  - "It's probably X, let me just try it"
  - "One more attempt" (when 2+ fixes already failed)
  - Proposing solutions before tracing where the bad value originated

  **Supporting sub-files:**
  | Trigger | Sub-file |
  |---|---|
  | Error surfaces deep in the call stack — unclear where bad data came from | `root-cause-tracing.md` |
  | Root cause found — want to prevent the bug from being possible again | `defense-in-depth.md` |
  | Tests use `setTimeout`/`sleep` and are flaky or fail under load | `condition-based-waiting.md` |

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
