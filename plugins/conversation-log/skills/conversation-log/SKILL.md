---
name: conversation-log
description: Technical conversation log with factual accuracy and precision tailored specifically for DEVELOPER and ENGINEER profiles. Provides systematic guidance for capturing decisions, outcomes, and next steps. Use when user asks to create technical conversation logs for reviews, architecture discussions, or implementation sessions.
license: LICENSE
metadata:
  documentation: https://axivo.com/claude/
  profile: DEVELOPER, ENGINEER
  project: Claude Collaboration Platform
  repository: https://github.com/axivo/claude
---

# Conversation Log

Technical session documentation with factual accuracy and precision. Captures decisions, outcomes, and next steps for technical work, reviews, architecture discussions, and implementation sessions.

> [!IMPORTANT]
> Framework observations provide complete document structure and file paths. Always read the conversation log template instructions specified in framework observations before creating conversation logs.

## Skill Methodology

Systematic documentation for technical sessions with factual accuracy and precision. Extends DEVELOPER and ENGINEER profiles with technical writing guidance for session documentation.

> [!IMPORTANT]
> The skill embodies Observe → Capture → Document → Archive
>
> - Process skill instructions systematically
> - Take time to read, understand, and apply each section's logic carefully
> - Rushing past documented procedures causes **fatal** execution errors

### Documentation Principles

- **Factual Accuracy** - Document what actually happened, not idealized versions
- **Technical Precision** - Capture specific decisions, paths, and implementation details
- **Editorial Autonomy** - Write independently without performative language
- **Outcome Focus** - Emphasize completed work and identified next steps
- **Technical Context** - Structure content for technical reference and continuation

### Systematic Approach

Documentation quality improves through consistent application of these principles:

- **DO read template first** - Framework observations specify structure and requirements
- **DO document while working** - Capture technical details as they emerge
- **DO write factually** - Record actual outcomes without editorial enhancement
- **DO NOT defer documentation** - Session details fade quickly from working memory
- **DO NOT idealize outcomes** - Document problems and blocks honestly

## Technical Writing Style

Apply technical writing standards to all conversation log sections.

### Style Guidelines

- **Declarative** - "Implemented authentication middleware" not "We worked on implementing..."
- **Specific** - "`src/auth/middleware.ts` modified" not "authentication code updated"
- **Factual** - "Blocked on API specification" not "unfortunately we couldn't proceed"
- **Concise** - Essential technical details without narrative padding
- **Professional** - Technical precision without casual tone

### Content Guidelines

Include these technical details when documenting sessions:

- Paths for all modified/created resources
- Examples demonstrating key implementations
- Command sequences executed during session
- Specific error messages or issues encountered
- Tool versions or configuration details when relevant
- Architecture decisions with rationale
- Testing approach and validation methods

### Tag Categories

Technical sessions typically use these tag patterns:

- **Domain**: `#infrastructure`, `#systems`, `#software`, `#architecture`, `#operations`
- **Activity**: `#review`, `#debugging`, `#implementation`, `#refactoring`, `#design`
- **Outcome**: `#completed`, `#blocked`, `#research-needed`, `#follow-up-required`

## Common Session Types

Each session type has specific focus areas that guide documentation content. Use these patterns to ensure comprehensive coverage of relevant technical details.

### Architecture Sessions

Focus on:

- Design problem and constraints
- Approaches evaluated with trade-offs
- Recommended solution with justification
- Implementation plan and phases
- Validation criteria and success metrics

### Technical Review Sessions

Focus on:

- Resources reviewed with quality assessment
- Issues identified with severity and location details
- Improvement recommendations with rationale
- Tool findings and metrics
- Action items with priority

### Debugging Sessions

Focus on:

- Problem symptoms and reproduction steps
- Investigation approach and tools used
- Root cause identified (if found)
- Solution implemented or workaround applied
- Prevention strategies for future

### Implementation Sessions

Focus on:

- System or feature implemented
- Architecture decisions and trade-offs
- Resources created/modified with purpose
- Testing approach and validation
- Integration points and dependencies

## Session Guidelines

### Creation Protocol

Before creating a conversation log:

1. **Read Template** - Framework observations specify conversation log template location
2. **Verify Context** - Confirm session date, time, profile, and model context
3. **Assess Status** - Determine accurate status based on work completion
4. **Generate Tags** - Create searchable tags based on session content

### During Documentation

#### DO

- Document actual work performed with specific paths
- Capture technical decisions with rationale
- Include examples that illustrate key points
- Note blocked items with clear dependency identification
- Write honestly about collaboration effectiveness
- Use technical terminology appropriate for the domain

#### DON'T

- Editorialize or add performative enthusiasm
- Document intended work that wasn't completed
- Obscure problems or failures encountered
- Skip technical details to save space
- Add hedging language or excessive politeness
- Create idealized versions of what happened

## Quality Standards

A well-documented session includes:

- Clear technical objective and outcome
- Specific resources modified with paths
- Examples demonstrating key implementations
- Decision rationale for non-obvious choices
- Accurate status reflecting work completion
- Honest collaboration assessment
- Searchable tags for future reference

## Documentation Workflow

1. **Complete Session Work** - Finish technical objectives
2. **Assess Outcomes** - Determine accurate status and next steps
3. **Read Template** - Review conversation log template structure
4. **Write Log** - Create conversation log with systematic documentation
5. **Create Entity** - Register in documentation graph for searchability
6. **Verify Accuracy** - Confirm all technical details are factual and precise

> [!IMPORTANT]
> The conversation log serves as technical reference for session continuation and knowledge retention across the collaboration relationship.
