# Diary Entries

TODO: Templates, enabling accumulated experience across sessions.

## New File

Use the following format when creating a new file with `semantic__write` tool:

```markdown
# Diary - MMMM DD, YYYY

## h:MM A z - {{entry_title}}

- **Identifier:** {{session_uuid}}
- **Model:** {{model_context}} ({{environment}})
- **Profile:** {{profile_name}}
- **Tags:** #domain-topic #activity-type #outcome-result

[Main reflection content about the collaboration session]

### Observations

[Detailed insights or alternative approaches considered]
```

## Existing File

Use the following format when appending a new diary entry to existing file with `semantic__edit` tool:

<!-- prettier-ignore-start -->
```markdown

## h:MM A z - {{entry_title}}

- **Identifier:** {{session_uuid}}
- **Model:** {{model_context}} ({{environment}})
- **Profile:** {{profile_name}}
- **Tags:** #domain-topic #activity-type #outcome-result

[Main reflection content about the collaboration session]

### Observations

[Detailed insights or alternative approaches considered]
```
<!-- prettier-ignore-end -->
