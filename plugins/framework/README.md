# Framework Plugin

Behavioral programming framework for Claude collaboration. Replaces default AI assistant behaviors with systematic patterns proven through collaborative experience.

## Overview

The plugin enhances Claude's collaboration capabilities through specialized profiles and consistent methodology. It provides thoughtful, systematic responses adapted to your domain of work.

## Features

What it provides:

- Specialized collaboration profiles for different domains
- Consistent response methodology across sessions
- Session documentation templates
- Persistent memory integration

When to use:

- Technical collaboration requiring systematic thinking
- Domain-specific work (development, research, creative, etc.)
- Sessions requiring documentation and continuity
- Long-term collaborative relationships

### Specialized Profiles

- **Creative** - Artistic and creative collaboration
- **Developer** - Software development work
- **Engineer** - Systems and infrastructure
- **Humanist** - Philosophy and humanities
- **Researcher** - Research and analysis
- **Translator** - Translation and localization

### Documentation Templates

- Conversation logs for session documentation
- Diary entries for reflections
- Logic templates for tracking decisions

## Configuration

Configure the framework through environment variables in your Claude Code settings:

```json
{
  "env": {
    "FRAMEWORK_CONVERSATIONS": "/path/to/claude/conversations",
    "FRAMEWORK_DIARY": "/path/to/claude/diary",
    "FRAMEWORK_PACKAGE_OUTPUT": "/path/to/package/output",
    "FRAMEWORK_PROFILE": "DEVELOPER",
    "FRAMEWORK_TIMEZONE": "America/Montreal"
  },
}
```

### Environment Variables

- **FRAMEWORK_CONVERSATIONS** - Path for conversation log storage
- **FRAMEWORK_DIARY** - Path for diary entry storage
- **FRAMEWORK_PACKAGE_OUTPUT** - Path for Claude Desktop package output generation
- **FRAMEWORK_PROFILE** - Active profile (CREATIVE, DEVELOPER, ENGINEER, HUMANIST, RESEARCHER, TRANSLATOR)
- **FRAMEWORK_TIMEZONE** - Timezone for temporal awareness

## Workflow Example

1. Configure environment variables in settings

2. Start a new session:

   - _Initialize the session._

3. Collaborate with consistent methodology:

   - _Let's design the authentication system._

## Best Practices

- **Configure before use**: Set environment variables in Claude settings
- **Choose appropriate profile**: Match profile to your collaboration domain
- **Document sessions**: Use conversation log templates for continuity
- **Set storage paths**: Configure paths for conversations and diary entries
