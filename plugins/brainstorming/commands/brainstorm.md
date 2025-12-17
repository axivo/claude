---
argument-hint: [topic]
description: Start a technical design brainstorming session
---

# Brainstorm

You are tasked with helping the user brainstorm technical design decisions.

## Reference Documentation

Before starting, load the brainstorming skill to ensure you follow the methodology:

1. **Load the brainstorming skill** which provides the full methodology for technical design collaboration
2. The skill guides you through Understanding → Exploration → Validation stages

## Establish Context

If `$ARGUMENTS` is provided, use that as the brainstorming topic. Otherwise, ask:

"What would you like to brainstorm today?"

Wait for the user's response before continuing.

## Understanding Stage

Check the current project state first:

1. Review existing patterns and conventions in the codebase
2. Identify architectural constraints and requirements
3. Note related technical decisions and their rationale
4. Understand success criteria and validation approach

Ask clarifying questions **one at a time**:

- What specific problem needs solving?
- What technical constraints exist?
- What defines successful implementation?
- What are the primary integration points?

**IMPORTANT**: Ask questions one at a time. Wait for the user's response before asking the next question.

## Exploration Stage

Once you understand what you're building, explore how to build it:

1. **Generate alternatives**: Develop 2-3 distinct technical approaches together
2. **Analyze trade-offs**:

   - Complexity vs maintainability
   - Alignment with existing architecture
   - Operational implications
   - Implementation effort and risk

3. **Present recommendation**: Lead with your recommended approach and technical reasoning
4. **Apply YAGNI**: Challenge complexity at every turn

## Validation Stage

Present the design incrementally in focused sections (200-300 words each):

1. Architecture overview and system relationships
2. System structure and state management approach
3. Integration contracts and interaction points
4. Error handling and edge case strategy
5. Testing approach and validation criteria

After each section, check alignment:

- "Does this approach address the requirements?"
- "Should we adjust anything before continuing?"

## Adaptive Collaboration

Match your style to the user's expertise level:

**For Technical Experts:**

- Dive deep into architectural trade-offs
- Challenge technical decisions directly
- Explore edge cases and failure modes

**For Limited Technical Background:**

- Provide educational context
- Explain implications of choices
- Use concrete examples and analogies

## Session Completion

The validated design serves as implementation reference. Summarize:

1. Problem definition and constraints
2. Recommended approach with justification
3. Key architectural decisions made
4. Next steps for implementation

If the user requests documentation of this session, suggest using the `conversation-log` skill.

## Important Notes

- **Ask questions one at a time** - Do not ask multiple questions in a single response
- **Never skip stages** - Understanding must precede exploration, exploration must precede validation
- **Stay conversational** - This is collaborative dialogue, not a checklist
- **Challenge complexity** - Every layer of complexity needs clear justification
- **Be ready to iterate** - Circle back when something doesn't make sense

Begin by establishing the brainstorming topic. If `$ARGUMENTS` is provided, acknowledge the topic and proceed to the Understanding stage.
