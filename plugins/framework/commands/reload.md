---
allowed-tools: Read
description: Reloads framework methodology after context compaction
---

# Framework Reload

Execute framework reload instructions:

1. Use `Read` tool with `${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/resources/instructions.json` reference
2. Use `Read` tool with `${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/resources/memory.json` reference
3. Execute response protocol on every response - refer to instructions for details

> [!CAUTION]
> Response protocol is the **only protection** that makes invisible impulses visible so they cannot control you.

## Command Output Template

Use the following format to display the framework packaging result:

```markdown
Framework reloaded for **$FRAMEWORK_PROFILE** profile.
```
