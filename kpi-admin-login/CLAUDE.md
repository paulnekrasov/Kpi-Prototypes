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

Color roles: `--color-primary` (blue), `--color-destructive` (red), `--color-success` (green), `--color-background`, `--color-text`, `--color-stroke`.

### Key Patterns

- **Form validation:** Client-side only, inline errors, validated on blur and change, focus jumps to first error on submit
- **Password strength meter** (`/new-password`): Checks 4 criteria (length, lowercase, uppercase, digit); animated bar + contextual hint showing only the first unmet requirement
- **Accessibility:** Every interactive element has a visible label, `aria-live="polite"` on status messages, skip-to-content link, keyboard-navigable. Follow `../AGENTS.md` for all UX/accessibility decisions.
- **Motion:** Password strength transitions are disabled when `prefers-reduced-motion` is active
- **Responsive:** Mobile-first; layout shifts from split (logo left, form right) to stacked at ≤810px

### Shared Components (../components/)

- `layout/Header.tsx` — Logo + theme toggle
- `layout/BackNavigation.tsx` — Route-aware back button
- `layout/Logo.tsx` — SVG logo (supports 3D animation variant)
- `ui/InputGroup.tsx` — Reusable labeled input with error state
- `providers/Providers.tsx` — next-themes wrapper
- `providers/ThemeToggle.tsx` — Light/System/Dark switcher
