# Refactoring Safety

Test rename operations and assess refactoring risk before recommending changes.

## Tools

Use these LSP tools to test rename operations and assess refactoring risk.

| Required             | Enhanced              |
| -------------------- | --------------------- |
| `get_symbol_renames` | `get_code_actions`    |
|                      | `get_selection_range` |

## Data to Collect

Assess the scope and impact of potential rename operations.

- Rename scope (single file vs. cross-module)
- Number of locations affected per rename
- Import/export updates required
- Breaking change risk assessment
- Selection range depth (nesting levels)

## Deliverables

- Refactoring safety matrix (5 rename tests with impact analysis)
- Safe refactoring candidates (low-risk operations identified)
- High-risk operations (operations that could break external code)
- Rename impact summary (locations affected per operation)

## Safety Assessment

- ✅ **Very Safe** - Local scope, single file, private symbols
- ✅ **Safe with Awareness** - Cross-module, tracked by LSP
- ⚠️ **Medium Risk** - Shared interfaces, multiple consumers
- 🔴 **High Risk** - Public API changes, external consumers
