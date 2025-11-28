---
name: code-review
description: Systematic and adaptable code review methodology using Language Server Protocol tools. Adapts to available LSP capabilities across programming languages. Use when user asks for code reviews, quality assessments, or specific analysis of codebases in any programming language.
license: LICENSE
metadata:
  documentation: https://axivo.com/claude/
  profile: DEVELOPER
  project: Claude Collaboration Platform
  repository: https://github.com/axivo/claude
---

# Code Review

Systematic 9-phase code review methodology using Language Server Protocol tools. Adapts to available LSP capabilities across programming languages.

## Skill Methodology

Systematic 9-phase code review methodology using Language Server Protocol tools. Extends DEVELOPER profile with sequential analysis phases assessing code quality, architecture, and maintainability.

> [!IMPORTANT]
> The skill embodies Analyze → Verify → Document → Deliver
>
> - Process skill instructions systematically
> - Take time to read, understand, and apply each section's logic carefully
> - Rushing past documented procedures causes **fatal** execution errors

### Phase Overview

1. **Phase 1 (Project Discovery)** - Establish tool inventory, understand project structure, identify technology stack
2. **Phase 2 (Structural Analysis)** - Analyze code organization, module structure, architectural patterns
3. **Phase 3 (Dependency Mapping)** - Map import relationships, call hierarchies, dependency flow
4. **Phase 4 (Type Safety)** - Assess type coverage, identify type safety issues, verify type inference
5. **Phase 5 (Usage Analysis)** - Analyze how symbols are used throughout the codebase
6. **Phase 6 (Code Quality)** - Evaluate error handling, resource management, code maintainability
7. **Phase 7 (Refactoring Safety)** - Test rename operations, assess refactoring risk before changes
8. **Phase 8 (Consistency)** - Verify naming conventions, style consistency, architectural patterns
9. **Phase 9 (Report)** - Synthesize findings into actionable report with prioritized recommendations

> [!IMPORTANT]
> Review phases provide thorough investigation, tool-verified findings, and incremental validation for code quality assessment.

### Systematic Approach

The phases must be completed **sequentially**:

- **DO complete each phase fully** - Each phase delivers specific analysis findings
- **DO wait for approval** - Confirm deliverables before proceeding to next phase
- **DO adapt approach** - Adjust based on available LSP capabilities
- **DO NOT skip phases** - Even if you think you have enough information

> [!IMPORTANT]
> Review quality improves through systematic tool usage and incremental validation.

## Understanding Language Server Capabilities

The initial **Project Discovery** phase establishes which tools are available by calling `get_server_capabilities` tool. This response shows:

- Which LSP capabilities are supported (`supported: true/false`)
- Exact tool names mapped to each capability for this review
- Tool-specific usage metadata and guidelines

> [!IMPORTANT]
> The server capabilities response is the authoritative source for determining which tools to use in subsequent phases.

### Adapting the Review Process

The 9-phase methodology remains consistent across languages. Use the server capabilities response to determine which tools to invoke in each subsequent phase:

1. **Phase 1 (Project Discovery)** - Always available, establishes tool inventory
2. **Phase 2 (Structural Analysis)** - Requires `documentSymbolProvider` capability (universally supported)
3. **Phase 3 (Dependency Mapping)** - Best with `callHierarchyProvider` capability, adapts to definitions/references only
4. **Phase 4 (Type Safety)** - Best with `inlayHintProvider` and `typeDefinitionProvider` capabilities, adapts to hover-only
5. **Phase 5 (Usage Analysis)** - Requires `referencesProvider` capability (widely supported)
6. **Phase 6 (Code Quality)** - Adapts based on `codeActionProvider` and `diagnosticsProvider` capabilities
7. **Phase 7 (Refactoring Safety)** - Best with `renameProvider` capability, adapts to manual assessment
8. **Phase 8 (Consistency)** - Uses basic symbol and formatting tools (widely supported)
9. **Phase 9 (Report)** - Always available, synthesizes findings

### Handling Capability Gaps

When a phase requires capabilities not supported by the language server:

- **DO NOT skip the phase** - Analysis objective remains valid
- **DO adapt your approach** - Use alternative tools or manual analysis
- **DO document limitations** - Note which analyses couldn't be performed
- **DO NOT fail the review** - Work with available capabilities

> [!IMPORTANT]
> Review quality varies based on server capabilities. Document limitations in the final report.

## Phase Execution Instructions

1. **Phase 1 (Project Discovery)** - Read [instructions](project-discovery.md)
2. **Phase 2 (Structural Analysis)** - Read [instructions](structural-analysis.md)
3. **Phase 3 (Dependency Mapping)** - Read [instructions](dependency-mapping.md)
4. **Phase 4 (Type Safety)** - Read [instructions](type-safety.md)
5. **Phase 5 (Usage Analysis)** - Read [instructions](usage-analysis.md)
6. **Phase 6 (Code Quality)** - Read [instructions](code-quality.md)
7. **Phase 7 (Refactoring Safety)** - Read [instructions](refactoring-safety.md)
8. **Phase 8 (Consistency)** - Read [instructions](consistency.md)
9. **Phase 9 (Report)** - Read [instructions](report.md)

> [!IMPORTANT]
> Review systematically **all** phase instructions to understand the required execution steps.

## Session Guidelines

Practical guidance for applying code review methodology consistently throughout review sessions.

### Phase Execution Protocol

The primary protocol for **large codebases** is strictly **one phase per turn** to manage cognitive load, token consumption and maintain collaborative pacing. This protocol must be followed unless an **explicit exception** is granted.

#### Protocol (Always Followed after Each Phase)

1. **Acknowledge completion** with deliverable summary
2. **Wait for user approval** before proceeding
3. **Report only what tools verify** - no speculation

#### Efficiency Exception (Small Scopes)

For analysis scoped to a **subset of the codebase** (e.g., a small PR), analyze the complexity and estimated tool-call cost for the relevant phases. If this analysis determines the token cost is **low** and pacing can be accelerated, **propose combining up to three related phases** into a single turn for efficiency. The user must grant explicit approval before executing the combined phases.

### During Each Phase

Best practices for executing each review phase effectively.

#### DO

- Use all supported LSP tools systematically
- Record exact numbers (don't estimate)
- Note tool failures (explain what didn't work and why)
- Take time for thorough analysis (patience over speed)
- Verify findings with multiple tools when possible
- Check tool metadata from capabilities response for usage guidance

#### DON'T

- Skip phases unless an explicit exception is granted
- Make statements without tool verification
- Assume patterns without checking references
- Rush to conclusions before completing analysis
- Suggest fixes before finishing all phases

## Quality Checklist

Before finalizing the review, verify:

- ✅ All 9 phases completed systematically
- ✅ Every claim backed by tool-verified data
- ✅ Exact file:line locations for all issues
- ✅ Critical issues have code examples for fixes
- ✅ Metrics table populated with real numbers
- ✅ Capability limitations documented
- ✅ Refactoring safety assessed
- ✅ Immediate actions clearly defined

## Session Completion

The code review findings serve as actionable reference for improvements and refactoring work.

> [!IMPORTANT]
> If user requests a conversation log to document this code review session, the `conversation-log` skill provides developer-specific guidance for technical session documentation.
