# Memory Builder

Transforms YAML profile definitions into hierarchical JSON memory graph cache with inheritance resolution.

## Usage

```bash
# Build specific profile
node index.js DEVELOPER

# Generate timestamp only
node index.js
```

## Features

- Hierarchical profile inheritance (e.g., DEVELOPER � ENGINEER � COLLABORATION)
- Circular dependency detection
- Template variable substitution from configuration
- Timezone-aware timestamp generation
- Validates YAML structure and relation types
- Container environment synchronization

## Configuration

Located in [`config/builder.yaml`](config/builder.yaml):

```yaml
build:
  outputPath: stdout # Output destination (stdout or file path)
  profilesPath:
    common: ./profiles/common # Shared common profiles
    domain: ./profiles # Domain-specific profiles
  relations: # Valid relation types
    - extends
    - inherits
    - overrides

settings:
  environment: # Container environment variables
    BASH_MAX_OUTPUT_LENGTH: 100000
  path: # Path configurations
    conversations: /path/to/conversations
    diary: /path/to/diary
  timezone: America/Montreal # Default timezone
```

## Profile Structure

Profiles are YAML files in [`profiles/`](profiles/):

```yaml
PROFILE_NAME:
  description: Profile description

  relations:
    - type: inherits
      target: PARENT_PROFILE

  section_name:
    subsection:
      observations:
        - Observation 1
        - Observation 2
```

## Output Format

```json
{
  "profiles": {
    "path": ".claude/skills/framework-initialization/resources/memory.json"
  },
  "timestamp": {
    "datetime": "2025-11-20T17:00:00-05:00",
    "day_of_week": "Thursday",
    "is_dst": false,
    "timezone": "America/Montreal"
  }
}
```

## Architecture

```
memory/
├── index.js                        # Entry point
├── config/
│   └── builder.yaml                # Configuration
├── profiles/                       # Domain profiles
│   └── common/                     # Common profiles
└── lib/
    ├── core/                       # Core classes
    │   ├── Environment.js          # Container environment sync
    │   ├── Error.js                # Custom error class
    │   └── Memory.js               # Main orchestrator
    ├── loaders/                    # File and config loaders
    │   ├── Config.js               # Configuration loader
    │   └── File.js                 # YAML file loader
    ├── processors/                 # Data processors
    │   └── Profile.js              # Profile processor with inheritance
    └── generators/                 # Output generators
        ├── Output.js               # JSON output generator
        └── Time.js                 # Timestamp generator
```

## Development

### Code Standards

- Clean code principles (SOLID, single responsibility)
- No defensive programming patterns
- Fail-fast error handling
- Consistent JSDoc documentation
- Alphabetically sorted private methods

### Testing

```bash
# Test profile build
node index.js DEVELOPER

# Test timestamp generation
node index.js

# Expected: Clean JSON output with no errors
```

## Error Handling

All errors use the `MemoryBuilderError` class with descriptive messages:

- `ERR_CONFIG_NOT_FOUND` - Configuration file missing
- `ERR_CONFIG_INVALID` - Invalid configuration structure
- `ERR_CONFIG_PARSE` - YAML parsing failed
- `PROFILE_NOT_FOUND` - Profile file not found
- `CIRCULAR_DEPENDENCY` - Circular inheritance detected
- `INVALID_RELATION_TYPE` - Unknown relation type used
