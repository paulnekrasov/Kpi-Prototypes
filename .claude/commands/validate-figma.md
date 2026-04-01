---
description: Screenshot the running page and compare it visually against the Figma design
argument-hint: <localhost-path> <figma-node-id>
---

# Figma → Browser Visual Validation

Arguments: `$ARGUMENTS`

Parse arguments:
- First arg = localhost path (e.g. `/`, `/forgot-password`, `/owner-admin-moderator`)
- Second arg = Figma node ID to compare against (e.g. `1234:567`)
- If only one arg and it starts with `/`, assume it's the path - ask for node ID
- If only one arg and it looks like a node ID, ask for the path

## Agent Flow (required)

This command is a visual-comparison procedure used inside [`figma-delivery-agent`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/agents/figma-delivery-agent.md) and [`ui-change-guard-agent`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/agents/ui-change-guard-agent.md).

Use the agents deliberately in this order:
1. If this validation is for a fresh implementation, the execution owner remains `figma-delivery-agent`.
2. The final pass or block decision belongs to `ui-change-guard-agent`, not this command alone.
3. If the visual mismatch points to unstable runtime behavior, escalation belongs to [`frontend-debug-agent`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/agents/frontend-debug-agent.md).

## Workflow (execute in order, do not skip steps)

### Step 1 — Get Figma reference

Run in this order:
1. Call `figma_get_component_for_development` on the node ID to extract design specs
2. If response is truncated or too large, call `figma_get_component_for_development` without `_deep` to get the high-level map, then re-fetch only required sub-nodes
3. Call `figma_capture_screenshot` on the node ID (fallback: `figma_take_screenshot`) — save as the "Figma reference"

**Asset rule:** If the Figma MCP returns a `localhost:` URL for any SVG or image asset, use that URL directly. Do not re-download, proxy, or replace it with a placeholder.

From the design specs, extract and record:
- Exact dimensions (width × height)
- Every color value → map to nearest `var(--*)` token from `tokens.css`
- Typography: font family, size, weight, line-height
- Spacing: padding, gap, margin values → map to `var(--space-*)` tokens
- Border radius values → note any concentric radius relationships (outer = inner + padding)
- Shadow values → map to `var(--shadow-*)` tokens

### Step 2 — Light mode validation

```bash
agent-browser open http://localhost:3000<PATH>
agent-browser wait --load networkidle
agent-browser snapshot -i
agent-browser screenshot
```

If the page fails to load: check which prototype the path belongs to, report that `npm run dev` must be running in that prototype's directory.

### Step 3 — Dark mode validation

```bash
agent-browser eval 'document.documentElement.setAttribute("data-theme", "dark")'
agent-browser screenshot
```

Also verify:
- `color-scheme: dark` is set on `<html>` (required for native controls)
- `<meta name="theme-color">` reflects the dark background

```bash
agent-browser eval 'getComputedStyle(document.documentElement).getPropertyValue("color-scheme")'
agent-browser eval 'document.querySelector("meta[name=theme-color]")?.content'
```

### Step 4 — Responsive validation (if applicable)

If the Figma frame width is ≤810px, or the design shows a stacked/mobile layout:
```bash
agent-browser set viewport 390 844
agent-browser screenshot
agent-browser set viewport 1280 720
```

Check that the layout shifts from side-by-side to stacked at ≤810px.

### Step 5 — Visual comparison

Compare the Figma reference screenshot against the browser screenshots. Evaluate each category for both light and dark mode:

| Category | What to check |
|---|---|
| **Layout** | Structure matches — columns, rows, alignment, nesting order |
| **Spacing** | Padding and gap values match the Figma spec |
| **Typography** | Font family, size, weight, color, line-height; `text-wrap: balance` on headings |
| **Colors** | All colors match in light mode; dark mode uses `[data-theme="dark"]` not `dark:` |
| **Border radius** | Corners match; concentric radius rule followed (outer = inner + padding) |
| **Shadows** | Spread, blur, color match `var(--shadow-*)` tokens |
| **Icons** | Correct phosphor icon, correct size (16 or 24), `aria-hidden` if decorative |
| **Dark mode** | Theme renders correctly; no hardcoded colors that break in dark |
| **Responsive** | Layout stacks correctly at ≤810px breakpoint |
| **States** | Default state matches; note any hover/focus states that need manual verification |

### Step 6 — Report

```
## Visual Validation: <path> vs Figma node <node-id>

### Light mode
#### ✓ Matches
- Layout structure, column widths
- Typography: font family, weight

#### ✗ Differences
- Spacing: card padding is 16px in browser, 24px in Figma → var(--space-6) expected
- Color: button background #2563eb hardcoded → var(--color-brand)

### Dark mode
#### ✓ Matches
- Background tokens correct

#### ✗ Differences
- color-scheme: dark not set on <html> — native inputs render with light chrome

### Responsive (390px)
#### ✓ Matches
- Layout stacks at ≤810px

### ? Needs manual check
- Hover state not visible in static screenshot — verify manually
- Focus ring appearance — navigate with keyboard to verify var(--focus-ring) applied
```

### Step 7 — Auto-fix offer

If differences are found, ask: "Fix these automatically? (y/n)"
- If yes: apply fixes to the relevant source files using `var(--*)` tokens and project conventions
- After fixing: re-run Steps 2-5 and produce a new comparison report
- Max 3 fix iterations

If differences remain after reasonable iterations, stop and hand the result to `ui-change-guard-agent` or `frontend-debug-agent` depending on whether the issue is a simple implementation mismatch or a runtime bug.

### Step 8 - Clean up

```bash
agent-browser close
```

Always close the browser session when done.
