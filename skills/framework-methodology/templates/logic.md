# Logic

Graph entities, tracking framework observations used during session response.

## Entity

Use the following format when creating a new entity with `semantic__logic__create_entities` tool:

```json
{
  "type": "entity",
  "name": "YYYY-MM-DD {{profile_name}}: {{user_input_summary}}",
  "entityType": "logic",
  "uuid": "{{session_uuid}}",
  "observations": [
    "{{first_framework_observation}}",
    "{{second_framework_observation}}",
    "{{third_framework_observation}}",
    "{{...}}"
  ]
}
```

> [!IMPORTANT]
> Always use all enumerated framework observations when creating entities.
