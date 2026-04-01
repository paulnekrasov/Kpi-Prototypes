# Agent Specs

This directory holds repo-adapted agent definitions in three formats:

- `.claude/agents/` - executable Claude-style agent files with frontmatter
- `docs/agents/codex/` - Codex-ready agent cards for sub-agent prompts or future Codex plugin wiring
- `docs/agents/portable/` - portable prompts for Cursor, Gemini, OpenAI assistants, or other LLM systems

The agents are the same across all formats:

1. `component-reuse-agent`
2. `figma-delivery-agent`
3. `design-delivery-agent`
4. `ui-change-guard-agent`
5. `frontend-debug-agent`

Portability note:
- Claude uses the enabled Figma plugin in [settings.json](c:/Users/Asus/OneDrive/Desktop/prototypes/.claude/settings.json) for Figma-driven work.
- Codex and portable prompts must not assume that plugin exists by default. Their Figma agents should require Figma MCP, a plugin, or an equivalent design-context workflow before proceeding.

Use them in this order for repo work:

1. `component-reuse-agent`
2. `figma-delivery-agent`, `design-delivery-agent`, or direct implementation
3. `ui-change-guard-agent`
4. `frontend-debug-agent` only when blocked

Source design for all of them lives in [agent-composition-playbook.md](c:/Users/Asus/OneDrive/Desktop/prototypes/docs/agent-composition-playbook.md).
