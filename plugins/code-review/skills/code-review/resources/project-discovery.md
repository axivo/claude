# Project Discovery

Establish tool inventory, understand project structure, identify technology stack.

## Tools

Use these LSP tools to gather project information.

| Required                  | Enhanced |
| ------------------------- | -------- |
| `get_project_files`       |          |
| `get_server_capabilities` |          |
| `get_server_status`       |          |

## Data to Collect

Gather the following project metrics and characteristics.

> [!IMPORTANT]
> Ensure `get_server_capabilities` tool was already called prior starting the data collection.

- **Server capabilities (complete response)**
- **Available tool count from capabilities.tools**
- **Supported capability list**
- Total files and size distribution
- Entry point identification
- Package dependencies
- Build/test configuration
- Documentation files

## Deliverables

- Supported capabilities matrix (which LSP features are available)
- Available tool count (exact number from capabilities.tools)
- Project file inventory (analysis scope count vs. total project count, size distribution)
- Entry point files identified
- Technology stack summary (dependencies, build tools, frameworks)
