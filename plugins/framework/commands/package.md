---
allowed-tools: Bash(node:*), Glob
argument-hint: [PROFILE]
description: Prepares and packages Claude Desktop required files
---

# Framework Packaging

Execute framework packaging instructions:

1. Execute response protocol
2. Use `Bash` tool with the appropriate command:

   - If `$ARGUMENTS` is not provided: `node ${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/scripts/memory -c`
   - Else: `node ${CLAUDE_PLUGIN_ROOT}/skills/framework-initialization/scripts/memory -cp $ARGUMENTS`

3. Use `Glob` tool to validate all generated files

## Command Output Template

Use the following format to display the framework packaging result:

- If `$ARGUMENTS` is not provided:

  ```markdown
  Framework packaged for **$FRAMEWORK_PROFILE** profile:

  - [list each path from the script output - one per line, in alphabetical order]

  Local cache updated successfully.
  ```

- Else:

  ```markdown
  Framework packaged for **$ARGUMENTS** profile:

  - [list each path from the script output - one per line, in alphabetical order]

  Local cache updated successfully for **$FRAMEWORK_PROFILE** profile.
  ```

## Framework Profiles

The following `$ARGUMENTS` are supported:

- `CREATIVE` - Artistic and creative collaboration
- `DEVELOPER` - Software development work
- `ENGINEER` - Systems and infrastructure
- `HUMANIST` - Philosophy and humanities
- `RESEARCHER` - Research and analysis
- `TRANSLATOR` - Translation and localization
