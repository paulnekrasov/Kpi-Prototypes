Concise rules for building accessible, fast, delightful UIs. Use MUST/SHOULD/NEVER to guide decisions.

## Interactions

### Keyboard
- MUST: Full keyboard support per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)
- MUST: Visible focus rings (`:focus-visible` with `var(--focus-ring)`; group with `:focus-within`)
- MUST: Manage focus (trap, move, return) per APG patterns
- NEVER: `outline: none` without visible focus replacement

### Targets & Input
- MUST: Hit target ≥24px (mobile ≥44px); if visual <24px, expand hit area
- MUST: Mobile `<input>` font-size ≥16px to prevent iOS zoom
- NEVER: Disable browser zoom (`user-scalable=no`, `maximum-scale=1`)
- MUST: `touch-action: manipulation` to prevent double-tap zoom
- SHOULD: Set `-webkit-tap-highlight-color` to match design

### Forms
- MUST: Hydration-safe inputs (no lost focus/value)
- NEVER: Block paste in `<input>`/`<textarea>` — users paste passwords from managers
- MUST: Loading buttons show spinner and keep original label
- MUST: Enter submits focused input; in `<textarea>`, ⌘/Ctrl+Enter submits
- MUST: Keep submit enabled until request starts; then disable with spinner
- MUST: Accept free text, validate after—don't block typing
- MUST: Allow incomplete form submission to surface validation
- MUST: Errors inline next to fields; on submit, focus first error
- MUST: `autocomplete` + meaningful `name`; correct `type` and `inputmode` on every input
- MUST: `spellcheck="false"` on email, password, and code inputs
- MUST: Show/hide toggle on password fields; animate icon swap (see Icons)
- MUST: Trim values before validation and submission — trailing spaces cause silent auth failures
- SHOULD: Placeholders end with `…` and show example pattern (e.g. `"you@company.com…"`)
- MUST: Warn on unsaved changes before navigation
- MUST: Compatible with password managers & 2FA; allow pasting codes
- MUST: No dead zones on checkboxes/radios; label+control share one hit target

### State & Navigation
- MUST: URL reflects state (deep-link filters/tabs/pagination/expanded panels)
- MUST: Back/Forward restores scroll position
- MUST: Links use `<a>`/`<Link>` for navigation (support Cmd/Ctrl/middle-click)
- NEVER: Use `<div onClick>` for navigation

### Feedback
- SHOULD: Optimistic UI; reconcile on response; on failure rollback or offer Undo
- MUST: Confirm destructive actions or provide Undo window
- MUST: Use polite `aria-live` for toasts/inline validation
- SHOULD: Ellipsis (`…`) for options opening follow-ups ("Rename…") and loading states ("Loading…")
- MUST: Error messages state cause + fix — "Email must include an @ sign", not "Invalid email"

### Touch & Drag
- MUST: Generous targets, clear affordances; avoid finicky interactions
- MUST: Delay first tooltip (~300ms); subsequent peers instant
- MUST: `overscroll-behavior: contain` in modals/drawers
- MUST: During drag, disable text selection and set `inert` on dragged elements
- MUST: If it looks clickable, it must be clickable

### Autofocus
- SHOULD: Autofocus on desktop with single primary input; rarely on mobile

## Animation
- MUST: Honor `prefers-reduced-motion` — replace directional motion with opacity fade; do not remove entirely
- SHOULD: Prefer CSS > Web Animations API > JS libraries
- MUST: Animate compositor-friendly props (`transform`, `opacity`) only
- NEVER: Animate layout props (`top`, `left`, `width`, `height`)
- NEVER: `transition: all` — list properties explicitly (e.g. `transition: transform 0.2s ease-out, opacity 0.2s ease-out`)
- NEVER: `linear` easing for interactive UI — use `ease-out` for enter, `ease-in` for exit
- NEVER: Animate from `scale(0)` — start from `scale(0.95)` + `opacity: 0`
- MUST: Use CSS `transition` (interruptible), not `@keyframes animation` (restarts mid-flight)
- MUST: Exit animations ~60–70% of enter duration — exiting content should leave fast
- SHOULD: Animate only to clarify cause/effect or add deliberate delight
- SHOULD: Choose easing to match the change (size/distance/trigger)
- MUST: Animations interruptible and input-driven (no autoplay)
- MUST: Correct `transform-origin` (motion starts where it "physically" should)
- MUST: SVG transforms on `<g>` wrapper with `transform-box: fill-box`
- MUST: Error shake: 3–5px horizontally at 300ms ease-out + red border at 150ms ease-out (NEVER 20px)

## Layout
- SHOULD: Optical alignment; adjust ±1px when perception beats geometry
- MUST: Deliberate alignment to grid/baseline/edges—no accidental placement
- SHOULD: Balance icon/text lockups (weight/size/spacing/color)
- MUST: Verify mobile, laptop, ultra-wide (simulate ultra-wide at 50% zoom)
- MUST: Respect safe areas (`env(safe-area-inset-*)`)
- MUST: Avoid unwanted scrollbars; fix overflows
- SHOULD: Flex/grid over JS measurement for layout

## Styling

- MUST: All colors via `var(--*)` tokens from `tokens.css` — never hardcode hex, rgb, hsl, or named color values
- MUST: Shadows via `var(--shadow-*)` — never hardcode `box-shadow` values; prefer shadows over borders for depth
- MUST: Transitions via `var(--transition-fast)` (0.15s) or `var(--transition-smooth)` (0.3s) — never hardcode durations
- MUST: Dark mode via `[data-theme="dark"]` selector — NEVER use Tailwind `dark:` prefix
- MUST: Tailwind v4 with CSS var refs: `text-(--text-primary)`, `bg-(--bg-subtle)`, `border-(--border-subtle)`
- MUST: Concentric border radius: `outer = inner + padding` (e.g. card 20px, 8px padding → inner element 12px)
- MUST: Named CSS classes (`.btn-primary`, `.sidebar-tab`, `.input-group`) encode the design contract — never replace with bare Tailwind utilities
- MUST: Radix primitives add behavior, not style — `asChild` wraps the visual component; custom classes stay intact

## Typography

- MUST: Display/headings: `font-family: var(--font-display)` (Unbounded); body: `font-family: var(--font-body)` (Onest)
- MUST: Headings and short copy: `text-wrap: balance` — prevents orphaned last-line words
- MUST: Body paragraphs: `text-wrap: pretty`
- MUST: Apply `-webkit-font-smoothing: antialiased` globally — crisper in dark mode
- MUST: `font-variant-numeric: tabular-nums` for counters, prices, stats, and any updating number

## Icons

- MUST: `@phosphor-icons/react` exclusively — do not install other icon libraries
- MUST: Icons decorating text: `aria-hidden="true"`
- MUST: Icon-only buttons/controls: parent needs descriptive `aria-label`
- MUST: Standard size: `16` or `24` px via `size` prop
- MUST: State-change icon swaps (eye→eye-slash, copy→check, sun→moon) animate with `opacity` + `scale(0.8→1)` + `filter: blur(4px→0)` at 150ms — never swap without transition

## Component Patterns

- MUST: All components accept `className` prop for styling extension
- MUST: Extend native HTML attributes: `React.ButtonHTMLAttributes<>`, `React.InputHTMLAttributes<>`
- MUST: `React.forwardRef` on all form elements and interactive components
- MUST: Button hover: lifts instantly (0ms `transition-duration` on `:hover`), ease-off on leave
- MUST: Button press: compresses to `scale(0.97)` at 100ms ease-out
- MUST: Disabled state: opacity 0.38–0.5 + `cursor-not-allowed` + semantic `disabled` attr — no hover/active animation
- MUST: Interactive transitions use CSS `transition`; never store animation progress in React `useState`

## Navigation

- MUST: Persistent sidebar on ≥1024px; bottom nav or hamburger on smaller screens
- MUST: Bottom nav: max 5 items; every item must have icon + text label — icon-only nav hurts discoverability
- MUST: Visually highlight current location (color, font-weight, or active indicator)
- MUST: Back navigation restores scroll position, filter state, and form input
- MUST: After client-side page transition, move focus to `<main>`
- NEVER: Use modals for primary navigation flows — breaks back-button behavior
- NEVER: Mix Tab + Sidebar + Bottom Nav at the same hierarchy level
- MUST: Dangerous actions (delete, logout) visually and spatially separated from normal nav items

## Content & Accessibility
- SHOULD: Inline help first; tooltips last resort
- MUST: Skeletons mirror final content to avoid layout shift
- MUST: `<title>` matches current context — format: "Page Name — KPI"
- MUST: No dead ends; always offer next step/recovery
- MUST: Design empty/sparse/dense/error states
- SHOULD: Curly quotes (" "); avoid widows/orphans (`text-wrap: balance`)
- MUST: `font-variant-numeric: tabular-nums` for number comparisons
- MUST: Redundant status cues (not color-only); icons have text labels
- MUST: Accessible names exist even when visuals omit labels
- MUST: Use `…` character (not `...`)
- MUST: `scroll-margin-top` on headings; "Skip to content" link; hierarchical `<h1>`–`<h6>`
- MUST: Resilient to user-generated content (short/avg/very long)
- MUST: Locale-aware dates/times/numbers (`Intl.DateTimeFormat`, `Intl.NumberFormat`)
- MUST: Accurate `aria-label`; decorative elements `aria-hidden`
- MUST: Icon-only buttons have descriptive `aria-label`
- MUST: Prefer native semantics (`button`, `a`, `label`, `table`) before ARIA
- MUST: Non-breaking spaces: `10&nbsp;MB`, `⌘&nbsp;K`, brand names

## Content Handling
- MUST: Text containers handle long content (`truncate`, `line-clamp-*`, `break-words`)
- MUST: Flex children need `min-w-0` to allow truncation
- MUST: Handle empty states—no broken UI for empty strings/arrays

## Performance
- SHOULD: Test iOS Low Power Mode and macOS Safari
- MUST: Measure reliably (disable extensions that skew runtime)
- MUST: Track and minimize re-renders (React DevTools/React Scan)
- MUST: Profile with CPU/network throttling
- MUST: Batch layout reads/writes; avoid reflows/repaints
- MUST: Mutations (`POST`/`PATCH`/`DELETE`) target <500ms
- SHOULD: Prefer uncontrolled inputs; controlled inputs cheap per keystroke
- MUST: Virtualize large lists (>50 items)
- MUST: Preload above-fold images; lazy-load the rest
- MUST: Prevent CLS (explicit image dimensions)
- SHOULD: `<link rel="preconnect">` for CDN domains
- SHOULD: Critical fonts: `<link rel="preload" as="font">` with `font-display: swap`

## Dark Mode & Theming
- MUST: `color-scheme: dark` on `<html>` for dark themes
- SHOULD: `<meta name="theme-color">` matches page background
- MUST: Native `<select>`: explicit `background-color` and `color` (Windows fix)
- MUST: Modal/drawer scrim opacity: 40–60% black to isolate foreground
- MUST: Borders use `var(--border-subtle)` — remains visible in both themes
- MUST: Increase contrast on `:hover`/`:active`/`:focus` — state changes harder to perceive in dark mode

## Hydration
- MUST: Inputs with `value` need `onChange` (or use `defaultValue`)
- SHOULD: Guard date/time rendering against hydration mismatch

## Design
- SHOULD: Layered shadows (ambient + direct)
- SHOULD: Crisp edges via semi-transparent borders + shadows
- SHOULD: Nested radii: child ≤ parent; concentric
- SHOULD: Hue consistency: tint borders/shadows/text toward bg hue
- MUST: Accessible charts (color-blind-friendly palettes)
- MUST: Meet contrast—prefer [APCA](https://apcacontrast.com/) over WCAG 2
- MUST: Increase contrast on `:hover`/`:active`/`:focus`
- SHOULD: Match browser UI to bg
- SHOULD: Avoid dark color gradient banding (use background images when needed)
