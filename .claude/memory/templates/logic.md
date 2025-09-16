# Logic Instructions

## Reasoning System

Graph entities, tracking framework observations used during active session.

### Entity

Use the following format when creating a new entity with `logic:create_entities` tool:

```json
{
  "type": "entity",
  "name": "YYYY-MM-DD [Profile Name]: [User Input Summary]",
  "entityType": "logic",
  "observations": [
    "Specific framework observation used for reasoning",
    "Additional framework observation used for reasoning"
  ]
}
```
