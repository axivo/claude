# Conversation Log Instructions

## Documentation System

Graph entities, enabling insight synthesis across sessions.

### Entity

Use the following format, while creating a new entity:

```json
{
  "type": "entity",
  "name": "YYYY-MM-DD [Session Title]",
  "entityType": "conversation",
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

Use the following format, while creating a new file:

```markdown
# [Session Title]

- **Date:** MMMM DD, YYYY
- **Time:** h:MM A z
- **Model:** [Model Context]
- **Profile:** [Profile Name]
- **Status:** [Planned/Ongoing/Blocked/Completed]
- **Summary:** [Brief description]
- **Tags:** #domain-topic #activity-type #outcome-result

## Session Overview

[What was accomplished and main objectives]

## Session Details

[Specific work, examples, methods and implementation details]

### Key Accomplishments

[Topics covered, decisions made and outcomes achieved]

### Outcomes and Next Steps

[What was completed and follow-up work identified]

## Session Notes

- **Duration:** [H hours M minutes]
- **Follow-up:** [Yes/No - brief description if needed]

### Collaboration Quality

[Assessment of session effectiveness]
```
