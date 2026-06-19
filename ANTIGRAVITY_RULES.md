# Google Antigravity (AGY) SDK Development Rules

Engineering guidelines for designing and orchestrating autonomous AI agents using the **Google Antigravity (AGY) SDK**.

> **Scope:** Agent SDK orchestration only — not Gradewise application code. For app rules see `.agent/rules/` or `.claude/rules/`.

---

## 1. Core Architecture

Every agent implementation must decouple three components:

| Component | Role |
|-----------|------|
| **Agent** | Orchestrates the loop, tool selection, skills, input processing |
| **Conversation** | Context memory, system instructions, turn history |
| **Connection** | Bridge to local resources, env config, MCP servers |

---

## 2. Model Selection & Configuration

- Use fully qualified model IDs — never abbreviate (e.g. current Gemini Pro / Flash tier names).
- **Reasoning models** for planning, multi-step debugging, structural design.
- **Fast models** for summarization, validation, routing (latency + cost).
- Set an explicit **`thinking_budget`** on every reasoning model.

---

## 3. MCP Server & Custom Tool Integration

- Register MCP servers via **Stdio** or **SSE** only.
- Python tools: type annotations + docstrings for schema generation.
- Prefer **idempotent**, side-effect-free tools; sandbox non-idempotent tools.

---

## 4. Safety & Execution Restrictions

- Restrict FS tools to the **workspace directory**.
- Block system folders unless explicitly approved.
- **Read** — path-prefix validation · **Write** — approval or sandbox · **Execute/Network** — user confirmation.

---

## 5. Lifecycle Hooks & Error Recovery

| Hook | Purpose |
|------|---------|
| `pre_turn` | Log input size, check state |
| `post_turn` | Track tokens, parse output |
| `on_tool_call` | Pre-execution safety check |
| `on_error` | Rate limits → exponential backoff + jitter |

Single API failures must not crash long-running agent stacks.

---

## 6. Observability & Token Auditing

- Markdown turn logs in `app_data_dir/logs/`.
- Track prompt, completion, and thinking tokens per turn.
- Session-level cost/token ceiling — terminate on exceed (no infinite tool loops).

---

## Mirrored Locations

This content is kept in sync with:

- `.agent/rules/antigravity_rules.md` (Antigravity / Cursor agent)
- `.claude/rules/antigravity_rules.md` (Claude Code)
