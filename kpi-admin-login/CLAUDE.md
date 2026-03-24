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
├── kpi-admin-login/    ← this app (src/app/)
├── kpi-site/
├── admin-panel/
├── components/         ← shared: Layout, UI, Providers
└── styles/             ← shared: tokens.css (design tokens)
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
- **Motion:** Password strength transitions are disabled when `prefers-reduced-motion` is active. For all animation decisions (easing, duration, micro-interactions, entrance/exit patterns, delight states, jank fixes), consult `.claude/skills/design-engineering-skill/`
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
- IMPORTANT: For all Next.js-specific patterns (App Router, RSC, data fetching, file conventions), always consult `.claude/skills/next-best-practices/`
- IMPORTANT: For all UI decisions (accessibility, layout, interactions, responsiveness), always consult `.claude/skills/web-interface-guidelines/`
- IMPORTANT: For all animations, transitions, micro-interactions, easing, hover states, entrance/exit patterns, delight moments, UI polish, or "this feels off" problems, always consult `.claude/skills/design-engineering-skill/` — this is the baseline for motion and tactile quality in this project
- IMPORTANT: For all debugging tasks, use `.claude/get-shit-done/templates/DEBUG.md` as the session template — create a debug file at `.planning/debug/[slug].md` and follow the lifecycle defined there

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
