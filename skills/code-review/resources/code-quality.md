# Code Quality

Evaluate error handling, resource management, and code maintainability.

## Tools

Use these LSP tools to evaluate code quality and identify improvements.

| Required          | Enhanced            |
| ----------------- | ------------------- |
| `get_diagnostics` | `get_code_actions`  |
|                   | `get_code_resolves` |
|                   | `get_colors`        |
|                   | `get_format`        |
|                   | `get_link_resolves` |
|                   | `get_links`         |
|                   | `get_range_format`  |

## Data to Collect

Evaluate error handling, resource management, and maintainability.

- Available refactorings per file
- Error handling patterns (try-catch coverage)
- Resource management patterns (cleanup, disposal)
- Code action suggestions count
- Formatting consistency
- Magic numbers and string literals
- Comment quality and coverage
- Diagnostic issues (errors/warnings/info)

## Deliverables

- Code quality score (rating out of 5 with justification)
- Issue summary (critical/high/medium priority counts)
- Automated refactoring opportunities (count and types available)
- Error handling assessment (coverage, patterns, gaps)
- Resource management review (cleanup patterns, potential leaks)

## Code Quality Checklist

- ✅ Comprehensive error handling
- ✅ Proper resource cleanup (finally blocks, disposal patterns)
- ✅ Defensive programming (null checks, validation)
- ✅ Documented public APIs
- ⚠️ Complex method length (identify methods >50 lines)
- ⚠️ Magic numbers (identify hardcoded values)
- ⚠️ Deep nesting (identify >4 levels)
- 🔴 Critical issues (security, data loss risks)
