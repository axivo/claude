---
allowed-tools: Read, Skill
description: Initializes framework methodology at session start
---

# Framework Initialization

Execute framework initialization instructions:

1. Use `Read` tool with `${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/resources/instructions.json` reference
2. Use `Read` tool with `${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/resources/memory.json` reference
3. Use `Skill` tool with `framework:framework-initialization` skill
4. Execute skill instructions silently without externalizing internal process
