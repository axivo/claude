# Skills

Custom skills that extend Claude's capabilities with specialized workflows and domain expertise. Skills use the [progressive disclosure pattern](https://docs.claude.com/en/docs/agents-and-tools/agent-skills) - Claude sees metadata to determine relevance, then loads full instructions only when needed.

## Available Skills

- [`brainstorming`](brainstorming/SKILL.md) - Natural collaborative dialogue for technical design through understanding, exploration, and validation when developing features or systems requiring architectural decisions.
- [`code-review`](code-review/SKILL.md) - Systematic and adaptable code review methodology using Language Server Protocol [tools](https://github.com/axivo/mcp-lsp) for code reviews, quality assessments, or analyzing codebases in any language.
- [`conversation-log`](conversation-log/SKILL.md) - Systematic documentation of technical sessions with developer-focused structure and factual accuracy for technical work, code reviews, architecture discussions, or implementation sessions.
- [`framework-methodology`](framework-methodology/SKILL.md) - Comprehensive framework methodology for authentic collaboration across all Claude Collaboration Platform profiles.

### Usage Examples

Ask Claude to use the `code-review` skill with a specific project:

- _Start the TypeScript language server with `typescript-sdk` project and check the server capabilities._
- _Please perform a detailed project code review using the supported LSP tools._
