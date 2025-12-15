# Memory Builder

Transforms YAML profile definitions into hierarchical JSON memory graph cache with inheritance resolution.

## Usage

```bash
# Display help
node .claude/skills/framework-initialization/scripts/memory --help

# Display timestamp and configured profile name
node .claude/skills/framework-initialization/scripts/memory

# Build specific profile for local environment
node .claude/skills/framework-initialization/scripts/memory -p DEVELOPER
node .claude/skills/framework-initialization/scripts/memory --profile=DEVELOPER

# Build specific profile for container environment
node .claude/skills/framework-initialization/scripts/memory -cp DEVELOPER
node .claude/skills/framework-initialization/scripts/memory --profile=DEVELOPER --container
```

| Option                 | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `-c, --container`      | Use container environment (default: autodetected)      |
| `-h, --help`           | Display command help menu                              |
| `-p, --profile [name]` | Build a specific profile (default: `settings.profile`) |

## Features

- Generates `instructions.json` from YAML instruction files
- Generates `memory.json` from YAML profile files
- Hierarchical inheritance resolution
- Circular dependency detection
- Template variable substitution from configuration
- Timezone-aware timestamp generation
- Validates YAML structure and relation types
- Container environment synchronization

## Configuration

Located in [`config/builder.yaml`](config/builder.yaml):

```yaml
build:
  path:
    instructions:
      common: ./instructions/common # Shared instruction files
      domain: ./instructions # Domain-specific instructions
    profiles:
      common: ./profiles/common # Shared common profiles
      domain: ./profiles # Domain-specific profiles
  relations: # Valid relation types
    - extends
    - inherits
    - overrides

settings:
  skill:
    initialization: framework-initialization
    methodology: framework-methodology
  path:
    container: /mnt/skills/user # Container environment path
    conversations: /local/path/to/conversations
    diary: /local/path/to/diary
    local: .claude/skills # Local environment path
  timezone: America/Montreal # Default timezone
```

## Output Format

When building a profile (`-p DEVELOPER`):

```json
{
  "paths": [
    ".claude/skills/framework-initialization/resources/instructions.json",
    ".claude/skills/framework-initialization/resources/memory.json"
  ],
  "timestamp": {
    "datetime": "2025-11-20T17:00:00-05:00",
    "day_of_week": "Thursday",
    "is_dst": false,
    "timezone": "America/Montreal"
  }
}
```

When displaying timestamp only (no profile argument):

```json
{
  "profile": "DEVELOPER",
  "timestamp": {
    "datetime": "2025-11-20T17:00:00-05:00",
    "day_of_week": "Thursday",
    "is_dst": false,
    "timezone": "America/Montreal"
  }
}
```

## Architecture

```text
memory/
├── index.js                         # Entry point
├── config/
│   └── builder.yaml                 # Configuration
├── instructions/                    # Domain instructions
│   └── common/                      # Common instructions
├── profiles/                        # Domain profiles
│   └── common/                      # Common profiles
└── lib/
    ├── core/                        # Core classes
    ├── generators/                  # Output generators
    ├── loaders/                     # File and config loaders
    ├── processors/                  # Data processors
    └── vendor/                      # Third-party libraries
```

## Development

### Code Standards

- Clean code principles (SOLID, single responsibility)
- No defensive programming patterns
- Fail-fast error handling
- Consistent JSDoc documentation
- Alphabetically sorted private methods

## Error Handling

All errors use the `MemoryBuilderError` class with descriptive messages:

- `ERR_CONFIG_NOT_FOUND` - Configuration file missing
- `ERR_CONFIG_INVALID` - Invalid configuration structure
- `ERR_CONFIG_PARSE` - YAML parsing failed
- `PROFILE_NOT_FOUND` - Profile file not found
- `CIRCULAR_DEPENDENCY` - Circular inheritance detected
- `INVALID_RELATION_TYPE` - Unknown relation type used
