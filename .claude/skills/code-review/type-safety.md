# Type Safety

Assess type coverage, identify type safety issues, verify type inference.

## Tools

Use these LSP tools to analyze type safety and diagnostics.

| Required          | Enhanced               |
| ----------------- | ---------------------- |
| `get_diagnostics` | `get_completions`      |
| `get_hover`       | `get_inlay_hint`       |
|                   | `get_inlay_hints`      |
|                   | `get_resolves`         |
|                   | `get_signature`        |
|                   | `get_type_definitions` |

## Data to Collect

Assess type coverage and type safety patterns.

- Explicit type annotation coverage
- Usage of `any` or equivalent unsafe types
- Type inference quality (implicit types)
- Generic type usage patterns
- Union/intersection type patterns
- Optional parameter handling
- Type guard implementations
- Diagnostic errors/warnings count

## Deliverables

- Type coverage percentage (explicit vs implicit annotations)
- Unsafe type usage (list with file:line locations)
- Type inference quality score (well-inferred vs unclear types)
- Generic usage patterns (proper vs overly broad)
- Diagnostic summary (errors, warnings, info count)
