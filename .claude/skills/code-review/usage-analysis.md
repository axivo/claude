# Usage Analysis

Analyze how symbols are used throughout the codebase.

## Tools

Use these LSP tools to track symbol usage.

| Required                | Enhanced                   |
| ----------------------- | -------------------------- |
| `get_symbol_references` | `get_highlights`           |
|                         | `get_linked_editing_range` |

## Data to Collect

Analyze how symbols are used and referenced.

- Symbol usage frequency (functions, classes, variables)
- Unused symbols (defined but never referenced)
- Over-used symbols (potential code smell)
- Single-use functions (potential inline candidates)
- Symmetric patterns (e.g., open/close, create/destroy pairs)
- Naming consistency patterns
- Cross-module usage patterns

## Deliverables

- Symbol usage frequency table (sorted by reference count)
- Unused code list (symbols with zero references, file:line)
- Single-use candidates (functions used only once)
- Overused symbols (potential coupling issues)
- Naming consistency analysis (convention adherence across codebase)
