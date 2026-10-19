---
trigger: always_on
glob: "**/*"
description: "Google Antigravity SDK — agent architecture, model selection, MCP tools, safety, hooks, and observability."
---

# Google Antigravity (AGY) SDK Rules

> These rules apply to **AI agent orchestration** using the Antigravity SDK — not to the Gradewise Fastify/Next.js application code.

## Architecture

Decouple every agent into three components:

| Component | Responsibility |
|-----------|----------------|
| **Agent** | Agentic loop, tool selection, skill execution, input processing |
| **Conversation** | Context memory, system instructions, turn history |
| **Connection** | Bridge to local resources, env config, MCP servers |

## Model Selection

- Use fully qualified model IDs — never abbreviate.
- **Reasoning/planning:** capability-tier model (e.g. current Gemini Pro class).
- **Summarization/routing/validation:** fast model (e.g. current Gemini Flash class).
- Set an explicit **`thinking_budget`** on every reasoning model.

## MCP & Custom Tools

- Register MCP servers via **Stdio** or **SSE** only.
- Python tool functions: type annotations + docstrings (schema generation).
  - Example: `def calculate(x: int, y: int) -> int:`
- Prefer **idempotent**, side-effect-free tools.
- Non-idempotent tools → sandboxed scopes + user confirmation.

## Safety & Execution Restrictions

- Restrict FS tools to the **workspace directory**.
- Block system paths (`/etc`, Windows user dirs) unless explicitly approved.
- Permission predicates:
  - **Read** — path-prefix validation
  - **Write** — approval or sandbox output dir only
  - **Execute/Network** — explicit user confirmation

## Lifecycle Hooks

| Hook | Purpose |
|------|---------|
| `pre_turn(agent, ctx)` | Log input size, check state flags |
| `post_turn(agent, ctx)` | Track output tokens, parse structured output |
| `on_tool_call(agent, name, args)` | Pre-execution safety validation |
| `on_error(agent, err)` | Rate-limit recovery, exponential backoff + jitter |

A single API failure must **never** crash a long-running agent stack.

## Observability & Cost Controls

- Log execution paths to `app_data_dir/logs/` (markdown per turn).
- Track prompt, completion, and thinking tokens per turn.
- Define a session-level token/cost ceiling — terminate with status error when exceeded (no infinite tool loops).

## Scope Boundary

- **Antigravity rules** → agent SDK design, MCP, hooks, safety.
- **Gradewise app rules** → `project_rules.md`, `backend_rules.md`, `frontend_rules.md`, `domain_rules.md`.

Do not mix Express/v2 backend paths or deprecated frontend `src/store/` patterns into Antigravity agent instructions.
