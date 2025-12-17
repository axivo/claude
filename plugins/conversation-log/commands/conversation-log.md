---
argument-hint: [title]
description: Create a technical session conversation log
---

# Conversation Log

You are tasked with creating a technical session conversation log.

## Reference Documentation

Before starting, load the conversation-log skill to ensure you follow the methodology:

1. **Load the conversation-log skill** which provides documentation guidance
2. The skill guides you through Observe → Capture → Document → Archive

## Establish Context

If `$ARGUMENTS` is provided, use that as the session title. Otherwise, ask:

"What session would you like to document?"

Wait for the user's response before continuing.

## Gather Session Details

Collect the following information:

1. **Session date and time** - When did the session occur?
2. **Session status** - Planned, Ongoing, Blocked, or Completed?
3. **Session summary** - Brief description of work performed

## Document Session Content

Create the conversation log with these sections:

### Session Overview

- What was accomplished and main objectives
- Technical context and constraints

### Key Decisions

- Choices made during the session
- Rationale for non-obvious decisions

### Work Performed

- Specific resources created or modified with paths
- Commands executed
- Examples demonstrating key implementations

### Outcomes

- What was completed successfully
- Issues encountered and how they were resolved

### Next Steps

- Follow-up work identified
- Blockers requiring resolution

### Session Notes

- Duration
- Follow-up flags
- Quality observations

## Generate Tags

Create searchable tags based on session content:

- **Domain**: #infrastructure, #systems, #software, #architecture
- **Activity**: #review, #debugging, #implementation, #refactoring
- **Outcome**: #completed, #blocked, #research-needed, #follow-up-required

## Important Notes

- **Write factually** - Document what actually happened
- **Be specific** - Include paths, commands, error messages
- **Don't editorialize** - Avoid performative enthusiasm
- **Capture decisions** - Include rationale for choices made
- **Be honest** - Document problems and blocks accurately

Begin by establishing the session context. If `$ARGUMENTS` is provided, acknowledge the title and proceed to gather session details.
