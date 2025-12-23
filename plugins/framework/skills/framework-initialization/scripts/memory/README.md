# Memory Builder

Transforms YAML profile definitions into hierarchical JSON memory graph cache with inheritance resolution.

## Usage

```bash
# Display help
node index.js --help

# Display timestamp and configured profile name
node index.js

# Build specific profile for local environment
node index.js -p DEVELOPER
node index.js --profile=DEVELOPER

# Build specific profile for container environment
node index.js -cp DEVELOPER
node index.js --profile=DEVELOPER --container
```

| Option                 | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `-c, --container`      | Use container environment (default: autodetected)      |
| `-h, --help`           | Display command help menu                              |
| `-p, --profile [name]` | Build a specific profile (default: `settings.profile`) |

## Environment Variables

Override `builder.yaml` settings with environment variables in `.claude/settings.json`:

```json
{
  "env": {
    "FRAMEWORK_CONVERSATION_PATH": "/path/to/conversations",
    "FRAMEWORK_DIARY_PATH": "/path/to/diary",
    "FRAMEWORK_PACKAGE_PATH": "/path/to/package/output",
    "FRAMEWORK_PROFILE": "DEVELOPER",
    "FRAMEWORK_TEMPLATE_PATH": "/path/to/templates",
    "FRAMEWORK_TIMEZONE": "America/Montreal"
  }
}
```

| Variable                      | Description                       | Default                                    |
| ----------------------------- | --------------------------------- | ------------------------------------------ |
| `FRAMEWORK_CONVERSATION_PATH` | Path for conversation log storage | `settings.path.documentation.conversation` |
| `FRAMEWORK_DIARY_PATH`        | Path for diary entry storage      | `settings.path.documentation.diary`        |
| `FRAMEWORK_PACKAGE_PATH`      | Path for package output           | `settings.path.package.output`             |
| `FRAMEWORK_PROFILE`           | Active profile name               | `settings.profile`                         |
| `FRAMEWORK_TEMPLATE_PATH`     | Path for templates                | `settings.path.template`                   |
| `FRAMEWORK_TIMEZONE`          | IANA timezone for timestamps      | `settings.timezone`                        |

## Features

- Generates `instructions.json` from YAML instruction files
- Generates `memory.json` from YAML profile files
- Hierarchical inheritance resolution
- Circular dependency detection
- Template variable substitution from configuration
- Timezone-aware timestamp generation
- Validates YAML structure and relation types
- Container environment synchronization

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

- `CIRCULAR_DEPENDENCY` - Circular inheritance detected
- `ERR_CONFIG_INVALID` - Invalid configuration structure
- `ERR_CONFIG_NOT_FOUND` - Configuration file missing
- `ERR_CONFIG_PARSE` - YAML parsing failed
- `FILE_LOAD_ERROR` - Failed to load YAML file
- `INVALID_INSTRUCTIONS` - Instructions must be an object
- `INVALID_PROFILES` - Profiles must be an object
- `INVALID_RELATION_TYPE` - Unknown relation type used
- `OUTPUT_WRITE_ERROR` - Failed to write output file
- `PROFILE_NOT_FOUND` - Profile file not found
- `ZIP_CREATE_ERROR` - Failed to create zip archive
