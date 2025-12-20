# Code Review Plugin

Systematic code review methodology using Language Server Protocol tools. Adapts to available LSP capabilities across programming languages.

## Overview

The plugin provides a 9-phase code review methodology that leverages LSP tools for thorough, tool-verified analysis. It adapts to the capabilities available for each programming language while maintaining consistent review quality.

## Features

Auto-invoked skill that guides systematic code review through 9 sequential phases.

What it does:

- Discovers project structure and available LSP capabilities
- Analyzes code organization and architectural patterns
- Maps dependencies and call hierarchies
- Assesses type safety and coverage
- Evaluates code quality and maintainability
- Tests refactoring safety before changes
- Synthesizes findings into actionable reports

When to use:

- Code reviews and quality assessments
- Analyzing unfamiliar codebases
- Pre-refactoring safety analysis
- Architecture and dependency audits

### Review Phases

1. **Project Discovery** - Establish tool inventory, understand project structure
2. **Structural Analysis** - Analyze code organization, module structure
3. **Dependency Mapping** - Map import relationships, call hierarchies
4. **Type Safety** - Assess type coverage, identify type safety issues
5. **Usage Analysis** - Analyze how symbols are used throughout codebase
6. **Code Quality** - Evaluate error handling, resource management
7. **Refactoring Safety** - Test rename operations, assess refactoring risk
8. **Consistency** - Verify naming conventions, style consistency
9. **Report** - Synthesize findings into prioritized recommendations

### Adaptive Capabilities

Full LSP support:

- Complete analysis with all LSP features
- Call hierarchies and type definitions
- Rename operations and code actions

Limited LSP support:

- Graceful degradation with available tools
- Manual assessment fallbacks
- Documented limitations in final report

## Workflow Example

1. Start a code review:

   - _Review the authentication module for quality issues_

2. Phase 1 discovers available tools:

   - _LSP capabilities detected: symbols, references, diagnostics..._

3. Sequential phases analyze the code:

   - _Phase 2: Found 15 modules with 3 architectural patterns..._
   - _Phase 3: Mapped 47 dependencies, 2 circular references..._

4. Final report synthesizes findings:

   - _Critical: 2 issues, High: 5 issues, Medium: 12 issues_

## Best Practices

- **Complete phases sequentially**: Each phase builds on previous findings
- **Wait for approval**: Confirm deliverables before proceeding
- **Trust tool verification**: Report only what tools verify
- **Document limitations**: Note when capabilities are unavailable
- **Be thorough**: Quality over speed
