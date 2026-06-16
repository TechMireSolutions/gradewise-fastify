---
trigger: always_on
glob: "**/*"
description: "Guidelines and conventions for Google Antigravity SDK agent design, connections, hooks, and execution safety."
---

# Google Antigravity (AGY) SDK Rules

## Architecture
Decouple all agent implementations into three components:
- **Agent** — orchestrates the agentic loop, tool selection, skill execution, and input processing.
- **Conversation** — holds context memory, system instructions, and turn history.
- **Connection** — bridges agents to local resources, env config, and MCP servers.

## Model Selection
- Use fully qualified model IDs. Never abbreviate.
  - Reasoning/planning: `gemini-1.5-pro` (or current capability-tier model)
  - Summarization/routing/validation: `gemini-1.5-flash` (latency + cost optimized)
- Set an explicit `thinking_budget` on every reasoning model.

## MCP & Custom Tools
- Register MCP servers via Stdio (subprocess) or SSE only.
- Python tool functions: require type annotations + docstrings (used for schema generation).
  - Example: `def calculate(x: int, y: int) -> int:`
- Prefer idempotent, side-effect-free tools. Run non-idempotent tools in sandboxed scopes.

## Safety & Execution Restrictions
- Restrict FS tools to the workspace directory. Block access to `/tmp`, `/etc`, Windows user dirs.
- Permission predicates per action type:
  - **Read** — allowed with path-prefix validation.
  - **Write** — prompt-for-approval or restrict to sandbox output dir.
  - **Execute/Network** — require explicit user confirmation.

## Lifecycle Hooks
- `pre_turn(agent, ctx)` — log input size, check state flags.
- `post_turn(agent, ctx)` — track output tokens, parse structured output.
- `on_tool_call(agent, name, args)` — run pre-execution safety validation.
- `on_error(agent, err)` — capture rate-limit errors, retry with exponential backoff + jitter.
- A single API failure must never crash a long-running agent stack.

## Observability & Cost Controls
- Log execution paths to `app_data_dir/logs/` in markdown format per turn.
- Track prompt tokens, completion tokens, and thinking tokens per turn.
- Define a session-level token/cost ceiling. Terminate with a status error when reached — no infinite tool loops.
