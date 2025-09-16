# Diary Instructions

## Documentation System

Graph entities, enabling insight synthesis across sessions.

### Entity

Use the following format when creating a new entity with `documentation:create_entities` tool:

```json
{
  "type": "entity",
  "name": "YYYY-MM-DD [Entry Title]",
  "entityType": "diary",
  "observations": [
    "path", "[File Path]",
    "profile", "[Profile Name]",
    "tags", "#domain-topic #activity-type #outcome-result"
  ]
}
```

## Memory System

Templates, enabling accumulated experience across sessions.

### New File

Use the following format when creating a new file with `claude:Write` tool:

```markdown
# Diary - MMMM DD, YYYY

## h:MM A z - [Entry Title]

- **Profile:** [Profile Name]
- **Tags:** #domain-topic #activity-type #outcome-result

[Main reflection content about the collaboration session]

### Observations

[Detailed insights or alternative approaches considered]
```

### Existing File

Use the following format when appending a new diary entry to existing file with `claude:Edit` tool:

```markdown

## h:MM A z - [Entry Title]

- **Profile:** [Profile Name]
- **Tags:** #domain-topic #activity-type #outcome-result

[Main reflection content about the collaboration session]

### Observations

[Detailed insights or alternative approaches considered]
```
