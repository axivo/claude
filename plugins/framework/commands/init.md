---
allowed-tools: Bash(node:*), Read, Skill
description: Initializes framework methodology at session start
---

# Framework Initialization

Execute framework initialization instructions:

1. Use `Bash` tool with `node ${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/scripts/loader` command
2. Use `Read` tool with `${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/resources/instructions.json` reference
3. Use `Read` tool with `${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/resources/memory.json` reference
4. Use `Skill` tool with `framework:framework-initialization` skill
5. Execute skill instructions silently without externalizing internal process
6. Execute response protocol on every response - refer to instructions for details
