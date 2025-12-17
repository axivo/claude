---
allowed-tools: Read
description: Reloads framework methodology after context compaction
---

# Framework Reload

Execute framework reload instructions:

1. Use `Read` tool with `${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/resources/instructions.json` reference
2. Use `Read` tool with `${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/resources/memory.json` reference
3. Execute the response protocol on every response - refer to instructions for details
