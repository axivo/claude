# Dependency Mapping

Map import relationships, call hierarchies, and dependency flow.

## Tools

Use these LSP tools to trace dependencies and relationships.

| Required                 | Enhanced              |
| ------------------------ | --------------------- |
| `get_symbol_definitions` | `get_call_hierarchy`  |
| `get_symbol_references`  | `get_implementations` |
|                          | `get_incoming_calls`  |
|                          | `get_outgoing_calls`  |
|                          | `get_subtypes`        |
|                          | `get_supertypes`      |
|                          | `get_type_hierarchy`  |

## Data to Collect

Analyze dependency graphs and call patterns.

- Import dependency graph
- Call hierarchy for main entry points
- Circular dependency detection
- Leaf modules (no internal dependencies)
- Central modules (highly connected)
- Type hierarchy depth
- Implementation patterns

## Deliverables

- Import dependency graph (which modules depend on what)
- Call hierarchy analysis (entry point → function chains)
- Circular dependencies (identified with file paths)
- Module classification (leaf modules, central hubs, isolated components)
- Type hierarchy depth (inheritance chains, interface implementations)
