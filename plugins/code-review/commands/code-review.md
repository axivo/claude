---
argument-hint: [path]
description: Start a systematic code review using LSP tools
---

# Code Review

You are tasked with performing a systematic code review using Language Server Protocol tools.

## Reference Documentation

Before starting, load the code-review skill to ensure you follow the methodology:

1. **Load the code-review skill** which provides the full 9-phase methodology
2. The skill guides you through Analyze → Verify → Document → Deliver

## Establish Scope

If `$ARGUMENTS` is provided, use that as the review scope. Otherwise, ask:

"What would you like me to review? Please provide a file path, directory, or describe the scope."

Wait for the user's response before continuing.

## Phase 1: Project Discovery

Begin by establishing the tool inventory:

1. Call `get_server_capabilities` to determine available LSP tools
2. Document which capabilities are supported
3. Identify the technology stack and project structure
4. Note any capability limitations that will affect the review

Deliver findings and wait for approval before proceeding.

## Phases 2-8: Analysis

Execute each phase sequentially, following the skill methodology:

- **Phase 2 (Structural Analysis)** - Code organization, module structure, architectural patterns
- **Phase 3 (Dependency Mapping)** - Import relationships, call hierarchies, dependency flow
- **Phase 4 (Type Safety)** - Type coverage, type safety issues, type inference
- **Phase 5 (Usage Analysis)** - Symbol usage throughout the codebase
- **Phase 6 (Code Quality)** - Error handling, resource management, maintainability
- **Phase 7 (Refactoring Safety)** - Rename operations, refactoring risk assessment
- **Phase 8 (Consistency)** - Naming conventions, style consistency, patterns

For each phase:

1. Read the phase instructions from skill resources
2. Execute analysis using available LSP tools
3. Record exact numbers and file:line locations
4. Deliver findings and wait for approval

## Phase 9: Report

Synthesize all findings into an actionable report:

1. Metrics table with real numbers from analysis
2. Issues categorized by severity (Critical, High, Medium, Low)
3. Each issue with exact file:line location
4. Code examples for critical fixes
5. Prioritized recommendations
6. Documented capability limitations

## Important Notes

- **Complete phases sequentially** - Do not skip phases
- **Wait for approval** - Confirm deliverables before proceeding to next phase
- **Report only tool-verified findings** - No speculation
- **Document limitations** - Note when tools are unavailable
- **Be thorough** - Quality over speed

Begin by establishing the review scope. If `$ARGUMENTS` is provided, acknowledge the scope and proceed to Phase 1.
