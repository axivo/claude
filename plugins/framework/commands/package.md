---
allowed-tools: Bash(ls:*), Bash(node:*)
argument-hint: [PROFILE]
description: Prepares and packages Claude Desktop required files
---

# Framework Packaging

Execute framework packaging instructions:

1. Use `Bash` tool with `node ${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/scripts/memory -c${ARGUMENTS:+p $ARGUMENTS}` command
2. Validate all generated files exist

## Framework Profiles

The following $ARGUMENTS profiles are supported:

- `CREATIVE` - Artistic and creative collaboration
- `DEVELOPER` - Software development work
- `ENGINEER` - Systems and infrastructure
- `HUMANIST` - Philosophy and humanities
- `RESEARCHER` - Research and analysis
- `TRANSLATOR` - Translation and localization
