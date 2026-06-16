# Google Antigravity (AGY) SDK Development Rules

This document outlines the engineering guidelines, design patterns, safety protocols, and operational practices for designing and orchestrating autonomous AI agents and multi-agent architectures using the **Google Antigravity (AGY) SDK**.

---

## 🏗️ 1. Core Architecture Principles

Every agent implementation must cleanly decouple its three key architectural components:
1. **Agent (`Agent` class)**: The autonomous core orchestrating the loop, selecting tools, utilizing skills, and processing inputs.
2. **Conversation (`Conversation` class)**: Manages context memory, system instructions, and structural turn histories.
3. **Connection (`Connection` class)**: The protocol bridge linking agents to local resources, environment configs, and external Model Context Protocol (MCP) servers.

---

## 🤖 2. Model Selection & Configuration Rules

To ensure performance, predictability, and safety, follow these rules:
- **Explicit Model Identifiers**: Never make assumptions or abbreviate model names. Use standard, fully qualified identifier strings (e.g., `gemini-1.5-pro`, `gemini-1.5-flash`).
- **Reasoning Models**: For complex planning, multi-step debugging, or structural design code execution, default to capability-tier reasoning models.
- **Fast Pipeline Models**: Use lightweight models (e.g., `gemini-1.5-flash`) for linear summarization, basic validation, and text routing to optimize latency and token spend.
- **Thinking Token Budgeting**: Reasoning models must be configured with an explicit thinking budget to balance processing latency and task accuracy.

---

## 🔌 3. MCP Server & Custom Tool Integration

Extending an agent's capability through tools must adhere to strict interface safety:
- **Stdio and SSE Protocols**: Register external MCP servers using standard process execution (Stdio) or server-sent events (SSE).
- **Explicit Type Signatures**: Custom Python tool functions must declare clear type annotations (e.g., `def calculate(x: int, y: int) -> int:`) and include detailed docstrings for prompt schema generation.
- **Idempotency**: Whenever possible, ensure custom tools are side-effect-free (idempotent) or run in sandboxed execution scopes.

---

## 🔒 4. Safety Policies & Execution Restrictions

Security must be configured explicitly on every connection:
- **Workspace Isolation**: Restrict standard file system tools (e.g., write/read) to the workspace directory. Prevent access to system folders (`/tmp`, `/etc`, windows user folders) unless explicitly requested and verified.
- **Action Predicates**: Use permission predicates to intercept and validate tool execution requests dynamically based on target scopes:
  - *Read Actions*: Allowed with path prefix validation.
  - *Write Actions*: Prompt-for-approval or restrict to sandbox output directories.
  - *Execution/Network Actions*: Require user confirmation before spawning child processes or hitting public endpoints.

---

## 🩺 5. Hook-Based Lifecycle & Error Recovery

Agents must handle API rate limits, connection dropouts, and command failures gracefully:
- **Lifecycle Hooks**: Attach custom handlers to agent lifecycles:
  - `pre_turn(agent, turn_context)`: Log input sizes, check state flags.
  - `post_turn(agent, turn_context)`: Track output tokens, parse structured output.
  - `on_tool_call(agent, tool_name, args)`: Run pre-execution safety validation.
  - `on_error(agent, error)`: Capture API rate limit errors and invoke retry mechanisms.
- **Resilience**: Implement exponential backoff with jitter on API calls. Do not allow single API failures to crash the long-running agent execution stack.

---

## 📊 6. Observability & Token Auditing

Implement transparent auditing for all operations:
- **Turn Loggers**: Log standard agent execution paths in markdown logs to `app_data_dir/logs/`.
- **Token Tracking**: Track prompt tokens, completion tokens, and thinking tokens per conversation turn.
- **Cost Controls**: Define a session-level token or cost ceiling to prevent infinite tool loops. Terminate the run with a status error if limits are reached.
