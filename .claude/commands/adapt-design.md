---
description: Implement UI from designer instructions using repo tokens, shared components, shadcn-backed primitives, and browser validation
argument-hint: <target-route-or-file> <design-brief>
---

# Designer Instructions -> Repo UI Adaptation

Arguments: `$ARGUMENTS`

Parse arguments:
- First meaningful segment = target route or file (required)
- Remaining text = design brief or direction (required)

If the route or file is missing, ask for it.
If the design brief is too vague to implement safely, ask for the missing detail.

## Philosophy

This command exists for design-led implementation when there is no Figma node.

The goal is not to generate random "pretty UI". The goal is to act like a senior frontend engineer for this codebase:
- interpret the designer's intent
- reuse repo-native components first
- search shadcn for the best underlying primitive when needed
- adapt everything back to `tokens.css`, named classes, and this repo's visual language
- validate in the browser before handoff

Use existing tokens first. If the requested design genuinely needs a reusable design-system value that does not exist yet, add the minimum new token to `styles/tokens.css` instead of hardcoding a one-off value.

## Agent Flow (required)

This command is the Phase 2 implementation spine for [`design-delivery-agent`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/agents/design-delivery-agent.md).

Use the agents deliberately in this order:
1. Before implementation, invoke [`component-reuse-agent`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/agents/component-reuse-agent.md) to lock `reuse`, `extend`, or `keep-local`.
2. Use `frontend-design` to interpret the design brief into a concrete visual and structural direction.
3. When no shared repo component fits cleanly, load the `shadcn` skill and search for the closest primitive or composition pattern before creating custom structure.
4. When the design requires interaction polish, motion tuning, sidebar feel, overlay behavior, or micro-interactions, load `design-engineering-skill` during implementation.
5. Use `agent-browser` as part of implementation, not just at the end.
6. After code changes, hand off to [`ui-change-guard-agent`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/agents/ui-change-guard-agent.md) for the final post-change gate.
7. If local behavior is unstable or validation exposes a runtime bug, escalate to [`frontend-debug-agent`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/agents/frontend-debug-agent.md) before making more fixes.

## Workflow

### Step 1 - Normalize the design brief

Extract from the instructions:
- the target prototype and route
- the component or screen scope
- the intended visual direction
- the required hierarchy changes
- the required interaction and state changes
- whether the request is conservative refinement or bold redesign within repo constraints

Turn the brief into a short implementation contract before editing:
- structure
- shared component candidates
- shadcn primitive candidates
- token expectations
- required validation states

### Step 2 - Check existing shared components FIRST

Use the output of `component-reuse-agent`. If no reuse artifact exists yet, run it now.

Check:
- `../components/ui/`
- `../components/layout/`
- `../components/providers/`
- route-local components already used by the target prototype

If a shared component already covers the pattern, use it first.

### Step 3 - shadcn search and component mapping (only if no shared component exists)

Before choosing a primitive, explicitly use the `shadcn` skill or its search/docs flow:
- search for the closest component or composition pattern
- prefer a primitive whose behavior matches the requested interaction model
- use shadcn for underlying structure and accessibility behavior
- then adapt spacing, typography, states, and visual styling back to the repo's tokens and the design brief

Do not stop at "the shadcn component exists". The component must still be reshaped to match the intended design direction.

### Step 4 - Implement

Implementation rules:
- all colors via `var(--*)` tokens
- all transitions via repo tokens
- if no existing token fits a recurring design value cleanly, add a new reusable token to `styles/tokens.css`
- preserve named classes where they already exist
- no Tailwind `dark:` prefix
- use `cn()` for conditional classes
- use `next/image` for static assets when appropriate
- keep the route or file scope tight

Use `frontend-design` for:
- hierarchy
- typography direction
- layout composition
- atmosphere and polish

Use `design-engineering-skill` for:
- hover, press, and focus feel
- sidebar and overlay motion
- loading and state transitions
- micro-interactions that make the result feel deliberate

### Step 5 - Browser validation

Use `agent-browser` to check:
- light mode
- dark mode if applicable
- mobile layout if applicable
- whether the result still feels like generic shadcn
- whether the interaction feel matches the brief, not just the static layout

### Step 6 - Handoff

Do not self-approve completion.

Hand the result to `ui-change-guard-agent` for the actual Phase 3 sign-off.

If repeated fixes reveal behavior you cannot explain, stop and hand off to `frontend-debug-agent` instead of continuing to patch.

### Step 7 - Output summary

```
## Design adaptation complete: <ComponentName or Screen>

**Target:** <route-or-file>
**Design brief:** <short summary>
**Shared components used:** <list>
**shadcn primitives used:** <list>
**Tokens adapted:** <list>
**New tokens created:** <if any>
**Visual validation:** pass / blocked
**Open issues:** <if any>
```
