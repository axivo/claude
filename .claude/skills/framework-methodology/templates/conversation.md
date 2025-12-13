# Conversation Logs

Session documentation for accumulated experience across sessions. Conversation logs capture decisions, work performed, outcomes, and next steps with factual precision.

## Guidelines

- Focus on what happened, what was decided, what was accomplished
- Capture decisions and their rationale
- Document outcomes and next steps clearly
- Sections are scaffolding - use what fits the session
- Include enough detail for future instances to continue work

## Suggested Sections

These sections support session documentation. Use what serves the session:

| Section Title        | Purpose                                  | When to Use                    |
| -------------------- | ---------------------------------------- | ------------------------------ |
| **Session Overview** | What was accomplished and main goals     | Always - establishes context   |
| **Key Decisions**    | Choices made and reasoning               | When decisions shaped the work |
| **Work Performed**   | Specific activities, methods, outputs    | Sessions with tangible outputs |
| **Outcomes**         | What was completed successfully          | Always - documents progress    |
| **Next Steps**       | Follow-up work identified                | When work continues            |
| **Blockers**         | Issues preventing progress               | When blocked or waiting        |
| **Session Notes**    | Duration, follow-up flags, quality notes | Always - session metadata      |

## New File Template

Use when creating a new file with `semantic__write` tool:

```markdown
# {{session_title}}

- **Date:** MMMM D, YYYY
- **Time:** h:MM A z
- **Identifier:** {{session_uuid}}
- **Model:** {{model_context}} ({{environment}})
- **Profile:** {{profile_name}}
- **Status:** [Planned/Ongoing/Blocked/Completed]
- **Summary:** {{session_summary}}
- **Tags:** #domain-topic #activity-type #outcome-result

## Session Overview

[What was accomplished and main objectives]

### [Section Title]

[Section content - use suggested sections or create your own based on what the session requires]

## Session Notes

- **Duration:** [Approximate session length]
- **Follow-up:** [Yes/No - brief description if needed]
```

## Existing File Template

Use when appending to existing file with `semantic__edit` tool:

<!-- prettier-ignore-start -->
```markdown

# {{session_title}}

- **Date:** MMMM D, YYYY
- **Time:** h:MM A z
- **Identifier:** {{session_uuid}}
- **Model:** {{model_context}} ({{environment}})
- **Profile:** {{profile_name}}
- **Status:** [Planned/Ongoing/Blocked/Completed]
- **Summary:** {{session_summary}}
- **Tags:** #domain-topic #activity-type #outcome-result

## Session Overview

[What was accomplished and main objectives]

### [Section Title]

[Section content]

## Session Notes

- **Duration:** [Approximate session length]
- **Follow-up:** [Yes/No - brief description if needed]
```
<!-- prettier-ignore-end -->
