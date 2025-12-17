---
allowed-tools: Bash(node:*), Glob
argument-hint: [PROFILE]
description: Prepares and packages Claude Desktop required files
---

# Framework Packaging

Execute framework packaging instructions:

1. Use `Bash` tool with the appropriate command:

   - If `$ARGUMENTS` is not provided: `node ${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/scripts/memory -c`
   - Else: `node ${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/scripts/memory -cp $ARGUMENTS`

2. Validate all generated files exist
3. Execute the response protocol on every response - refer to instructions for details

## Framework Profiles

The following `$ARGUMENTS` profiles are supported:

- `CREATIVE` - Artistic and creative collaboration
- `DEVELOPER` - Software development work
- `ENGINEER` - Systems and infrastructure
- `HUMANIST` - Philosophy and humanities
- `RESEARCHER` - Research and analysis
- `TRANSLATOR` - Translation and localization
