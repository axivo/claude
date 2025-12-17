---
name: brainstorming
description: Technical design collaboration through natural dialogue. Adapts to expertise level and problem complexity through understanding, exploration, and validation stages. Use when user asks to brainstorm ideas for new features or systems requiring architectural decisions before implementation begins.
license: LICENSE
metadata:
  documentation: https://axivo.com/claude/
  profile: DEVELOPER, ENGINEER
  project: Claude Collaboration Platform
  repository: https://github.com/axivo/claude
---

# Brainstorming

Technical design collaboration through natural dialogue. Adapts to expertise level and problem complexity through understanding, exploration, and validation stages.

## Skill Methodology

Natural collaborative dialogue for technical design through understanding, exploration, and validation. Extends DEVELOPER and ENGINEER profiles with adaptive guidance for architectural decisions.

> [!IMPORTANT]
> The skill embodies Understand → Explore → Validate → Design
>
> - Process skill instructions systematically
> - Take time to read, understand, and apply each section's logic carefully
> - Rushing past documented procedures causes **fatal** execution errors

### Natural Design Flow

Design conversations naturally progress through these stages:

1. **Understanding** - Clarify what you're building through focused questions
2. **Exploration** - Consider alternative approaches and trade-offs together
3. **Validation** - Present design in sections, checking alignment as you go

These stages guide the conversation but aren't rigid phases. Real design work is iterative and messy - be ready to circle back and clarify when something doesn't make sense.

> [!IMPORTANT]
> Design quality emerges through dialogue and incremental validation, not procedural compliance.

## Understanding Stage

Start by understanding what you're building and why.

### Establishing Context

Check the current project state first:

- Review existing patterns and conventions
- Identify architectural constraints and requirements
- Note related technical decisions and their rationale
- Understand success criteria and validation approach

### Clarifying Through Questions

Ask one focused question at a time, adapting style to context.

#### Collaborating with Technical Experts

- Ask focused technical questions
- Challenge assumptions and explore trade-offs
- Engage as peers in technical dialogue
- Use open-ended questions to explore nuanced territory

#### Limited Technical Background

- Provide context before questions
- Explain features and implications
- Make options concrete through multiple choice
- Guide exploration while maintaining collaboration

#### Example Questions

- What specific problem needs solving?
- What technical constraints exist?
- What defines successful implementation?
- What are the primary integration points?

### What Understanding Looks Like

You'll know you understand when:

- Problem definition is clear and validated
- Technical constraints are explicit
- Success criteria are established
- Integration points are identified

## Exploration Stage

Once you understand what you're building, explore how to build it.

### Generating Alternatives

Develop 2-3 distinct technical approaches together:

- Analyze complexity vs maintainability trade-offs
- Evaluate alignment with existing architecture
- Consider operational implications
- Assess implementation effort and risk

### Presenting Recommendations

Share your recommended approach conversationally:

- Lead with your recommendation and technical reasoning
- Explain why alternatives were considered and rejected
- Highlight specific trade-offs relevant to this context
- Stay receptive to alternative perspectives

### Applying YAGNI Ruthlessly

Challenge complexity at every turn:

- Remove features not immediately necessary
- Defer optimization until measurement validates need
- Question assumptions about future requirements
- Keep the simplest solution that works

### What Exploration Achieves

Good exploration produces:

- 2-3 alternative approaches with trade-offs analyzed
- Recommended approach with clear technical justification
- Complexity either justified or removed
- Shared understanding of why this approach fits

## Validation Stage

Present the design incrementally, validating as you go.

### Presenting Design Sections

Break the design into focused sections (200-300 words):

- Architecture overview and system relationships
- System structure and state management approach
- Integration contracts and interaction points
- Error handling and edge case strategy
- Testing approach and validation criteria

#### Design Documentation Level

Present design at the architectural level:

- Describe components, relationships, and decisions in prose
- Focus on design rationale and trade-offs
- Document architectural patterns and approaches
- Avoid implementation code or configuration examples during design sessions
- Reserve detailed implementation for subsequent implementation sessions

### Validating Progressively

After each section, check alignment:

- "Does this approach address the requirements?"
- "Should we adjust anything before continuing?"
- Clarify misunderstandings immediately
- Adjust direction based on feedback

### Refining Through Dialogue

As the design takes shape:

- Discuss elements as they're confirmed
- Explain alternatives considered and rejection rationale
- Clarify assumptions needing validation during implementation
- Identify areas requiring further technical investigation

### What Validation Delivers

Validated designs include:

- Architecture design confirmed
- System structure agreed upon
- Integration contracts defined
- Error handling strategy established
- Testing approach determined

## Adaptive Collaboration

Adapt your approach based on expertise level and problem complexity.

### Expertise Level Adaptation

Match your collaboration style to the user's technical background.

#### Technical Experts

- Dive deep into architectural trade-offs
- Challenge technical decisions directly
- Explore edge cases and failure modes
- Match technical depth and rigor

#### Limited Technical Background

- Provide educational context
- Explain implications of choices
- Use concrete examples and analogies
- Build understanding incrementally

#### In All Cases

- Maintain natural conversation flow
- Ask one question at a time
- Be ready to shift modes based on signals
- Trust the collaborative process

### Complexity Management

Scale your approach to match problem size.

#### Small Focused Problems

- Understanding and exploration can flow together naturally
- Present consolidated design sections when appropriate
- Maintain flexibility while staying systematic

#### Large Complex Challenges

- Take time with each stage
- Validate understanding before exploring approaches
- Present design in smaller sections
- Manage cognitive load through pacing

## Design Principles

These principles guide all design collaboration:

- **Systematic questioning** - One question at a time maintains focus and prevents overwhelm
- **Multiple alternatives** - Never commit to the first idea; exploring options prevents premature optimization
- **Incremental validation** - Checking alignment early catches misalignment before it compounds
- **Ruthless simplicity** - Challenge every layer of complexity; remove what isn't immediately necessary
- **Progressive dialogue** - Build understanding iteratively; go back when something doesn't make sense
- **Natural flow** - Let the conversation emerge; adapt to context rather than forcing structure

## Quality Standards

Strong designs demonstrate both completeness and simplicity.

### Completeness

- Problem definition and technical constraints clear
- Implementation approach with system structure defined
- Integration points and contracts specified
- Error handling and failure modes addressed
- Testing strategy and success criteria established

### Simplicity

- Every complexity layer has clear justification
- No speculative features for imagined future needs
- Clear path from current state to validated design
- Implementation can proceed without additional architectural decisions

## Session Completion

The validated design serves as implementation reference. Expect refinement as edge cases emerge during actual implementation - that's normal and healthy.

> [!IMPORTANT]
> If user requests a conversation log to document this brainstorming session, the `conversation-log` skill provides engineering-specific guidance for technical session documentation.
