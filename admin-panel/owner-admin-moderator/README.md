# Owner / Admin / Moderator Roles Page

## What Was Built

The runnable implementation lives in `kpi-admin-login` and adds a dashboard-style `/roles` route with:

- Owner, Admin, and Moderator viewer modes
- Members and Suggestions tabs
- Search, filter, table, pagination, and per-row edit/delete actions
- Direct create/edit/delete flows for Owner and Admin
- Suggestion-based create/edit/delete flows for Moderator
- Confirmation and verification steps before destructive direct actions

## Prototype Decisions

### MagicPatterns used as visual authority

- Header treatment: large page title, short description, compact pills, and a single primary CTA
- Tabs: soft card-style container, active raised state, subtle shadow, and suggestion count badge
- Table: uppercase micro-headings, soft borders, light hover, compact density, masked email/password reveal, and icon-only row actions
- Surfaces: pale layered backgrounds with light border + subtle shadow instead of heavy card chrome

### MagicPath used as logic authority

- Owner/Admin can mutate directly
- Moderator submits suggestions instead of changing data directly
- Suggestions remain reviewable in a separate tab
- Filter model includes search, member ID, role, and created date range
- Create/Edit uses a centered modal
- Delete requires a confirmation dialog before action

## Reused Components

- Shared table: `components/layout/table.tsx`
- Shared pagination: `components/ui/pagination.tsx`
- Shared sidebar shell primitives: `components/layout/sidebar.tsx`, `components/ui/sidebar-tab.tsx`
- Shared buttons: `components/ui/Button.tsx`, `components/ui/IconButton.tsx`
- Shared theme toggle: `components/providers/ThemeToggle.tsx`

## New Shared Components

- `components/layout/dashboard-shell.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Dialog.tsx`
- `components/ui/Tabs.tsx`

## App Files Added or Updated

- `kpi-admin-login/src/app/app-shell.tsx`
- `kpi-admin-login/src/app/layout.tsx`
- `kpi-admin-login/src/app/roles/layout.tsx`
- `kpi-admin-login/src/app/roles/page.tsx`
- `kpi-admin-login/src/app/roles/roles-data.ts`

## Token Notes

- `styles/tokens.css` was used as the source of truth
- No new design tokens were added
- Shared shadows, borders, background roles, text roles, and focus rings were reused directly

## One Resolved Ambiguity

The codebase did not contain an existing dashboard route group or top-nav shell to slot this page into. To stay compatible with the current Next.js app without moving the auth prototype around, the implementation uses a route-aware `AppShell` that keeps the auth pages intact and renders the dashboard shell only for `/roles`.

## Verification

- `npm run lint` passes
- `npm run build` compiles and type-checks successfully, but final page-data generation is intermittently blocked by OneDrive locking `.next` output files on existing auth routes such as `/forgot-password`
