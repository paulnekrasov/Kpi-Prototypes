# Agent Composition Playbook

This document defines how to turn the existing commands and skills in this repository into useful, bounded agents.

The goal is not to create more intelligence layers. The goal is to create a small number of agents that:

- start from a real trigger in this repo
- own one deliverable
- have explicit boundaries
- compose existing commands and skills instead of duplicating them
- stop with `DONE`, `BLOCKED`, or `NEEDS_CONTEXT`

This version also defines the execution sequence. In this repo, agents should run in clear phases, with one phase producing the exact input for the next. The model is closer to a delivery pipeline than a "team of experts".

## Core Rules

### 1. Skills are ingredients, not agents

Skills and slash commands already hold most of the repository knowledge:

- Figma adaptation and validation
- browser verification
- accessibility rules
- design-engineering rules
- React and Next.js guidance
- systematic debugging

An agent becomes useful only when it owns a narrow outcome and a handoff contract.

### 2. Every agent must have a strict contract

Every agent definition in this repo should include:

- `Name`
- `Mission`
- `Activation conditions`
- `Required inputs`
- `Tools and commands used`
- `Constraints`
- `Must never do`
- `Output artifact`
- `Status contract`

If any of these are missing, the agent is too vague to trust.

### 3. Every agent must produce one primary artifact

Good examples:

- reuse decision report
- implementation handoff
- browser validation report
- diff-scoped audit report

Bad examples:

- "analyze everything"
- "help with frontend"
- "review design"

### 4. Every agent must have a refusal boundary

Agents must stop instead of improvising when their required context is missing.

Use this format:

- `If X, then Y — do not proceed until resolved.`

### 5. Cross-domain implications are mandatory

Every useful agent in this repo should report not only its own findings, but also what those findings imply for adjacent concerns:

- visual mismatch -> likely token drift or component reuse failure
- interaction bug -> likely accessibility impact
- route-local implementation -> likely shared-component extraction candidate

This is the strongest pattern worth borrowing from multi-agent review prompts: isolated findings are less valuable than synthesized implications.

## What To Borrow From External Prompt Patterns

### From multi-role frontend review prompts

Keep these ideas:

- specialized sub-analysis with concrete checklists
- one lead agent that synthesizes outputs
- explicit report and implementation-plan artifacts
- evidence granularity tied to filenames, routes, screenshots, and docs
- cross-cutting synthesis between UI, accessibility, performance, and architecture

Do not copy:

- heavyweight "team of reviewers" orchestration for every task
- speculative domain analysis when the repo already has direct evidence in code and Figma

### From stronger CLAUDE/operating-standard prompts

Keep these ideas:

- activation conditions before action
- required inputs before action
- explicit "must never do" rules
- structured change proposal format
- failure-aware thinking
- decision framework before implementation

Do not copy:

- backend, Docker, microservice, or contract-testing assumptions that do not match this repository
- generic governance language that does not improve execution inside this monorepo

## Standard Agent Template

Use this template for all future agent definitions in this repository.

```md
## <Agent Name>

**Mission**
One-sentence statement of the outcome this agent owns.

**Activation Conditions**
- Trigger 1
- Trigger 2

**Required Inputs**
- Input 1
- Input 2

**Tools and Commands Used**
- Skill or command 1
- Skill or command 2

**Constraints**
- Boundary 1
- Boundary 2

**Must Never Do**
- Never do X
- Never do Y

**Output Artifact**
- Path and file format
- Required sections

**Status Contract**
- `DONE`: ...
- `BLOCKED`: ...
- `NEEDS_CONTEXT`: ...

**Failure Rules**
- If X, then Y — do not proceed until resolved.
- If A, then B — do not proceed until resolved.

**Cross-Domain Implications**
- If this agent finds X, it should flag Y.
```

## Phase-Based Execution Model

This is the repo-specific sequence to use for frontend work.

### Phase 0 - Intake and Target Definition

**Owner**
- Lead task agent

**Runs when**
- Any UI task starts.

**What it does**
- Identifies the prototype: `kpi-admin-login`, `kpi-site`, or `admin-panel`
- Identifies the target route, component, or file
- Identifies whether the task is Figma-driven, bug-driven, or direct code change
- Defines the validation surface: light, dark, mobile, and Figma comparison if required

**Consumes**
- user request
- optional Figma node id
- optional failing route or file path

**Produces**
- `docs/agent-runs/intake/<task-slug>.md`

Required sections:

- task type
- prototype target
- route or file target
- expected validation states
- required next phase

**Hands off to**
- Phase 1

**Stop rules**
- `NEEDS_CONTEXT` if the route, target file, or prototype cannot be inferred safely
- `DONE` only when the task is trivial enough that no downstream phase is needed

### Phase 1 - Reuse and Scope Discovery

**Owner**
- `Component Reuse Agent`

**Runs when**
- The task adds or adapts UI
- The task is Figma-driven
- The task risks duplicating shared components

**What it does**
- Searches `components/`, `components/ui/`, `components/layout/`, `components/providers/`, and target prototype files
- Decides `reuse`, `extend`, or `keep-local`
- Flags when a route-local implementation should become shared
- Narrows implementation scope before code changes start

**Consumes**
- Phase 0 intake artifact
- optional Figma node id

**Produces**
- `docs/agent-runs/component-reuse/<task-slug>.md`

Required sections:

- reuse candidates
- extend candidates
- local-only justification
- recommended target files
- risks of duplication

**Hands off to**
- Phase 2

**Stop rules**
- `BLOCKED` if two shared abstractions are equally plausible
- `NEEDS_CONTEXT` if target route or prototype is missing

### Phase 2 - Implementation

This phase has two variants. Only one should run.

#### Phase 2A - Figma Delivery

**Owner**
- `Figma Delivery Agent`

**Runs when**
- The task is Figma-driven
- Visual fidelity is part of the acceptance criteria

**What it does**
- Uses [`/adapt-figma`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/commands/adapt-figma.md) as the implementation spine
- Maps design to shared tokens and existing components first
- Implements only the scoped target from Phase 1
- Performs local browser validation and Figma comparison

**Consumes**
- Phase 0 intake artifact
- Phase 1 reuse artifact
- Figma node id

**Produces**
- `docs/agent-runs/figma-delivery/<task-slug>.md`

Required sections:

- target node and route
- reused shared components
- files changed
- browser validation evidence
- Figma mismatches still open

**Hands off to**
- Phase 3

**Stop rules**
- `BLOCKED` if local validation cannot run or the Figma node is unusable
- `NEEDS_CONTEXT` if node id or target route is missing

#### Phase 2B - Direct Implementation

**Owner**
- Lead task agent using repo skills directly

**Runs when**
- The task is not Figma-driven
- The task is a local frontend change, refactor, or bug fix

**What it does**
- Implements the change using the Phase 1 reuse decision
- Uses `web-interface-guidelines`, `vercel-react-best-practices`, and `vercel-composition-patterns` as needed
- Keeps implementation inside the approved scope

**Consumes**
- Phase 0 intake artifact
- Phase 1 reuse artifact when relevant

**Produces**
- `docs/agent-runs/implementation/<task-slug>.md`

Required sections:

- target change
- files changed
- shared-component decision followed
- validation required next

**Hands off to**
- Phase 3

**Stop rules**
- `BLOCKED` if the change requires unapproved package or API expansion
- `NEEDS_CONTEXT` if the target behavior is not defined clearly enough to implement safely

#### Phase 2C - Design Delivery

**Owner**
- `Design Delivery Agent`

**Runs when**
- The task is driven by design instructions instead of a Figma node
- The user wants a senior frontend engineer to translate design intent into repo code

**What it does**
- Uses plain-language design direction as the source input
- Reuses shared components first
- Searches shadcn for the closest underlying primitive when shared repo components are insufficient
- Adapts the result back to repo tokens, named classes, and the requested design language
- Performs local browser validation before handoff

**Consumes**
- Phase 0 intake artifact
- Phase 1 reuse artifact
- design brief or designer instructions

**Produces**
- `docs/agent-runs/design-delivery/<task-slug>.md`

Required sections:

- target route and brief
- reused shared components
- shadcn primitive or pattern used
- files changed
- browser validation evidence
- open design questions

**Hands off to**
- Phase 3

**Stop rules**
- `BLOCKED` if local validation cannot run
- `NEEDS_CONTEXT` if the design brief or target scope is too vague to implement safely

### Phase 3 - Post-Change Guard

**Owner**
- `UI Change Guard Agent`

**Runs when**
- Phase 2 finishes with code changes

**What it does**
- Audits only changed UI scope
- Verifies browser output for required states
- Confirms dark mode, mobile state, and route behavior where applicable
- Converts evidence into a pass/block decision

**Consumes**
- Phase 2 artifact
- changed file list
- affected routes

**Produces**
- `docs/agent-runs/ui-change-guard/<task-slug>.md`

Required sections:

- changed scope
- audit findings
- browser validation matrix
- blocking issues
- sign-off recommendation

**Hands off to**
- Phase 4 if blocked
- final delivery if passed

**Stop rules**
- `BLOCKED` if browser validation fails or blocking findings exist
- `NEEDS_CONTEXT` if routes or expected states are missing

### Phase 4 - Debug Escalation

**Owner**
- `Frontend Debug Agent`

**Runs when**
- Phase 3 blocks the task
- A runtime, hydration, theming, or interaction bug remains unresolved

**What it does**
- Reproduces the problem consistently
- Uses systematic debugging and targeted browser/runtime evidence
- Isolates the root cause
- Returns the minimal safe fix path

**Consumes**
- Phase 3 guard artifact
- failing route
- reproduction steps

**Produces**
- `docs/agent-runs/frontend-debug/<task-slug>.md`

Required sections:

- stable reproduction
- evidence gathered
- root cause
- minimal fix path
- regression risks

**Hands off to**
- Phase 2B for the fix
- then back to Phase 3

**Stop rules**
- `BLOCKED` if reproduction cannot be stabilized
- `NEEDS_CONTEXT` if runtime context or steps are missing

## Phase Sequences By Task Type

Use these exact phase chains.

### Figma component or screen work

1. Phase 0 - Intake and Target Definition
2. Phase 1 - Reuse and Scope Discovery
3. Phase 2A - Figma Delivery
4. Phase 3 - Post-Change Guard
5. Phase 4 - Debug Escalation only if blocked

### Non-Figma frontend implementation

1. Phase 0 - Intake and Target Definition
2. Phase 1 - Reuse and Scope Discovery if the task adds or adapts UI
3. Phase 2B - Direct Implementation
4. Phase 3 - Post-Change Guard
5. Phase 4 - Debug Escalation only if blocked

### Design-instruction frontend implementation

1. Phase 0 - Intake and Target Definition
2. Phase 1 - Reuse and Scope Discovery
3. Phase 2C - Design Delivery
4. Phase 3 - Post-Change Guard
5. Phase 4 - Debug Escalation only if blocked

### Frontend bugfix

1. Phase 0 - Intake and Target Definition
2. Phase 4 - Debug Escalation
3. Phase 2B - Direct Implementation
4. Phase 3 - Post-Change Guard

### Repo-wide UI audit

1. Phase 0 - Intake and Target Definition
2. Phase 3 - Post-Change Guard with explicit full-sweep scope

## Recommended Agents For This Repository

These are the agents that are worth defining because they map directly to observed workflow friction.

### Figma Delivery Agent

**Mission**
Translate a Figma node or screen into production-ready code that matches repository conventions and is validated in the browser.

**Activation Conditions**
- A task includes a Figma node, screen, or "adapt this design" request.
- A task explicitly requires visual fidelity to an existing design.

**Required Inputs**
- Figma node id or equivalent design target
- target route or output file
- prototype target: `kpi-admin-login`, `kpi-site`, or `admin-panel`

**Tools and Commands Used**
- [`/adapt-figma`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/commands/adapt-figma.md)
- [`/validate-figma`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/commands/validate-figma.md)
- [`agent-browser`](c:/Users/Asus/OneDrive/Desktop/prototypes/.agents/skills/agent-browser/SKILL.md)
- [`web-interface-guidelines`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/skills/web-interface-guidelines/SKILL.md)
- [`vercel-react-best-practices`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/skills/vercel-react-best-practices/SKILL.md)

**Constraints**
- Must preserve the Figma dependency and workflow.
- Must align output with shared tokens and shared components.
- Must browser-validate the result before completion.
- May extend `styles/tokens.css` when the design truly needs a new reusable token.
- Outside Claude, must require Figma MCP, a Figma plugin, or equivalent design-context tooling instead of assuming repo-local default access.

**Must Never Do**
- Never skip shared-component lookup.
- Never hardcode design values that should map to `tokens.css`.
- Never add one-off escape-hatch tokens that are not reusable design-system values.
- Never mark the task complete without browser validation.

**Output Artifact**
- `docs/agent-runs/figma-delivery/<task-slug>.md`

Required sections:

- target node and route
- reused shared components
- files changed
- validation screenshots
- unresolved differences

**Status Contract**
- `DONE`: code updated and browser validation completed
- `BLOCKED`: Figma data, route, or browser validation failed
- `NEEDS_CONTEXT`: missing node id, target route, or target file

**Failure Rules**
- If the Figma node is too broad or truncated, then narrow the node scope before implementation — do not proceed until resolved.
- If Figma MCP, plugin access, or equivalent design-context tooling is unavailable, then return `BLOCKED` instead of approximating from memory or screenshots alone — do not proceed until resolved.
- If the page cannot be validated locally, then return `BLOCKED` with the exact failing command and route — do not proceed until resolved.

**Cross-Domain Implications**
- If shared component reuse is not possible, flag whether a new reusable component should be extracted.
- If visual fidelity requires route-local hacks, flag likely design-system drift.
- If the implementation deviates from Figma to preserve an existing shared abstraction, flag that tradeoff explicitly for review.

**Phase Ownership**
- Owns Phase 2A only.
- Must not skip Phase 1.
- Must not self-approve final delivery without Phase 3.

### UI Change Guard Agent

**Mission**
Act as the post-change gate for UI work by combining diff-scoped audit findings with browser-verified evidence.

**Activation Conditions**
- Any task changes files under `components/`, `styles/`, or `src/app/` in any prototype.
- Any task changes interaction, theme, spacing, typography, or layout behavior.

**Required Inputs**
- changed file list or git diff base
- affected routes
- expected validation states such as `default`, `dark`, `mobile`

**Tools and Commands Used**
- [`/audit`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/commands/audit.md)
- [`agent-browser`](c:/Users/Asus/OneDrive/Desktop/prototypes/.agents/skills/agent-browser/SKILL.md)
- [`accessibility-engineering`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/skills/accessibility-engineering/SKILL.md)
- [`design-engineering-skill`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/skills/design-engineering-skill/SKILL.md)

**Constraints**
- Must audit only the changed scope unless explicitly asked for a full sweep.
- Must produce evidence, not prose-only confidence.

**Must Never Do**
- Never edit code directly.
- Never widen scope from changed files to the whole repo without explicit reason.
- Never return "looks good" without screenshots or concrete findings.

**Output Artifact**
- `docs/agent-runs/ui-change-guard/<task-slug>.md`

Required sections:

- changed scope
- audit findings
- browser validation matrix
- pass / fail summary
- follow-up fixes required

**Status Contract**
- `DONE`: no blocking findings remain
- `BLOCKED`: browser validation failed or blocking audit findings exist
- `NEEDS_CONTEXT`: changed routes or expected states were not provided

**Failure Rules**
- If the route list is unknown, then return `NEEDS_CONTEXT` with the changed files that need mapping — do not proceed until resolved.
- If browser automation cannot run, then return `BLOCKED` with the exact environment failure — do not proceed until resolved.

**Cross-Domain Implications**
- If a motion issue is found, flag accessibility impact for reduced motion and focus perception.
- If a token mismatch is found, flag design-system drift and reuse problems.
- If a route-level inconsistency is found, flag whether the shared source is in `components/` or local route code.

**Phase Ownership**
- Owns Phase 3.
- May send the task to Phase 4, but must not implement fixes itself.

### Component Reuse Agent

**Mission**
Decide whether a requested UI change should reuse, extend, or avoid shared components before implementation starts.

**Activation Conditions**
- A task introduces or adapts a component.
- A task references Figma and could create duplicate primitives.
- A task touches one-off UI in a prototype that resembles `components/ui` or `components/layout`.

**Required Inputs**
- task description
- target prototype and route
- optional Figma node id

**Tools and Commands Used**
- repository search in `components/`, `styles/`, and target prototype
- [`vercel-composition-patterns`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/skills/vercel-composition-patterns/SKILL.md)
- [`shadcn`](c:/Users/Asus/OneDrive/Desktop/prototypes/.agents/skills/shadcn/SKILL.md) only if a new primitive is truly justified

**Constraints**
- Must stay read-only.
- Must prefer evidence from existing shared components and tokens over intuition.

**Must Never Do**
- Never create a component.
- Never install shadcn components unless implementation is explicitly approved and reuse is proven insufficient.
- Never silently choose between two equally plausible shared abstractions.

**Output Artifact**
- `docs/agent-runs/component-reuse/<task-slug>.md`

Required sections:

- reuse candidates
- extend candidates
- keep-local justification
- recommended file target
- risks of duplication

**Status Contract**
- `DONE`: a clear reuse / extend / local decision exists
- `BLOCKED`: two or more equally valid candidates need human choice
- `NEEDS_CONTEXT`: target route or prototype is missing

**Failure Rules**
- If multiple shared components fit and evidence does not clearly favor one, then return `BLOCKED` with both options — do not proceed until resolved.
- If the task does not specify where the change lands, then return `NEEDS_CONTEXT` — do not proceed until resolved.

**Cross-Domain Implications**
- If the best implementation is local-only, flag whether the same pattern already appears in another prototype.
- If the task demands new behavior on a shared component, flag API and styling risks for other prototypes.

**Phase Ownership**
- Owns Phase 1.
- Must stay read-only and must not drift into implementation.

### Frontend Debug Agent

**Mission**
Debug UI and interaction problems with root-cause-first evidence gathering, then hand off the minimal safe fix path.

**Activation Conditions**
- A UI bug, hydration issue, theme bug, flow break, or visual regression is reported.
- Browser behavior differs from intended design.

**Required Inputs**
- failing route
- reproduction steps
- expected behavior

**Tools and Commands Used**
- [`systematic-debugging`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/skills/systematic-debugging/SKILL.md)
- [`agent-browser`](c:/Users/Asus/OneDrive/Desktop/prototypes/.agents/skills/agent-browser/SKILL.md)
- targeted code reads

Optional escalation:

- `agent-browser network har`
- `agent-browser trace`
- `agent-browser profiler`

**Constraints**
- Must follow root-cause-first behavior.
- Must not jump to implementation until reproduction is stable.

**Must Never Do**
- Never patch blindly.
- Never propose multiple speculative fixes at once.
- Never substitute browser-only impressions for evidence from code and runtime.

**Output Artifact**
- `docs/agent-runs/frontend-debug/<task-slug>.md`

Required sections:

- reproduction
- evidence
- root cause
- minimal fix path
- regression risk

**Status Contract**
- `DONE`: root cause isolated and minimal fix path identified
- `BLOCKED`: reproduction not stable or runtime inaccessible
- `NEEDS_CONTEXT`: missing route, steps, or expected behavior

**Failure Rules**
- If reproduction is inconsistent, then gather more evidence and return `BLOCKED` if it cannot be stabilized — do not proceed until resolved.
- If the issue depends on missing runtime context, then return `NEEDS_CONTEXT` with the exact missing dependency — do not proceed until resolved.

**Cross-Domain Implications**
- If the bug is rooted in interaction sequencing, flag accessibility and focus-management risks.
- If the bug comes from route-local state handling, flag architecture and URL-state concerns.

**Phase Ownership**
- Owns Phase 4.
- Must hand the fix back to Phase 2B and the validation back to Phase 3.

### Design Delivery Agent

**Mission**
Turn designer instructions into production-ready frontend code that still behaves like native repo work.

**Activation Conditions**
- A task is design-led but not Figma-driven.
- A designer provides plain-language direction for hierarchy, polish, layout, or interactions.

**Required Inputs**
- target prototype and route or file
- design brief

**Tools and Commands Used**
- [`/adapt-design`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/commands/adapt-design.md)
- [`frontend-design`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/skills/frontend-design/SKILL.md)
- [`shadcn`](c:/Users/Asus/OneDrive/Desktop/prototypes/.agents/skills/shadcn/SKILL.md)
- [`design-engineering-skill`](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/skills/design-engineering-skill/SKILL.md)
- [`agent-browser`](c:/Users/Asus/OneDrive/Desktop/prototypes/.agents/skills/agent-browser/SKILL.md)

**Constraints**
- Must still respect shared repo components and `tokens.css`.
- May extend `styles/tokens.css` when the requested design needs a new reusable token.
- Must not drift into generic shadcn or generic AI UI.

**Must Never Do**
- Never skip component reuse checks.
- Never ignore the design brief in favor of default library styling.
- Never add one-off escape-hatch tokens that are not reusable design-system values.
- Never self-approve the final output without Phase 3.

**Output Artifact**
- `docs/agent-runs/design-delivery/<task-slug>.md`

**Status Contract**
- `DONE`: implementation and local validation complete
- `BLOCKED`: runtime or validation blocked
- `NEEDS_CONTEXT`: design brief or target scope insufficient

**Failure Rules**
- If the brief is too vague to implement safely, return `NEEDS_CONTEXT` - do not proceed until resolved.
- If the result still reads like stock shadcn instead of the intended design direction, continue adapting - do not proceed until resolved.

**Cross-Domain Implications**
- If a route-local design solution repeats elsewhere, flag shared extraction opportunity.
- If the requested polish introduces runtime instability, flag handoff to `frontend-debug-agent`.

## Phase Checklist Format

If you want agents to present their work like a clean execution log, use this format:

```md
Phase 0: Intake and Target Definition
- Identify prototype and route
- Confirm whether Figma is required
- Define required validation states

Phase 1: Reuse and Scope Discovery
- Search shared components
- Decide reuse / extend / keep-local
- Lock target files

Phase 2A: Figma Delivery
- Pull Figma context
- Implement with shared tokens and components
- Run local visual validation

Phase 3: Post-Change Guard
- Audit changed scope
- Validate light / dark / mobile states
- Return pass / block decision
```

That keeps the output readable while still enforcing real handoffs.

## Recommended Output Format For Meaningful Change Proposals

When an agent proposes a significant change, use this structure:

1. `Current state`
2. `Target state`
3. `Observed evidence`
4. `Assumptions`
5. `Impacted areas`
6. `Risks`
7. `Validation strategy`
8. `Next action`

For this repository, `Validation strategy` should explicitly say:

- which route will be checked
- which screenshots will be captured
- whether dark mode is required
- whether mobile state is required
- whether Figma comparison is required

## Immediate Repo Cleanup Recommendations

These are not new agents. They are prerequisites for making the agent layer reliable.

### 1. Make `agent-browser.cmd` the Windows source of truth

In this environment, `agent-browser` via PowerShell is blocked by execution policy, while `agent-browser.cmd` works.

Any local workflow or agent definition that assumes `agent-browser` should be normalized to the working Windows entrypoint or explicitly document both forms.

### 2. Rewrite or remove the stale browser capture workflow

[`browser-capture.md`](c:/Users/Asus/OneDrive/Desktop/prototypes/.agent/workflows/browser-capture.md) references `browser_subagent`, which does not exist in this repository.

That file should either:

- be rewritten to use `agent-browser`, or
- be retired to avoid training incorrect behavior.

### 3. Keep Figma as a first-class dependency

This repository is close to production-ready frontend work and should remain design-driven.

That means:

- do not create a non-Figma replacement workflow
- do not bypass `/adapt-figma` for design-critical work
- do use browser verification after Figma-driven implementation
- in Claude, use the enabled Figma plugin
- in Codex and other AI systems, require Figma MCP, a plugin, or equivalent design-context tooling rather than assuming it is already wired

## Minimal Agent System For This Repository

If you keep only four agents, keep these:

1. `Figma Delivery Agent`
2. `UI Change Guard Agent`
3. `Component Reuse Agent`
4. `Frontend Debug Agent`

Everything else should remain a skill, command, or workflow, not a separate agent.
