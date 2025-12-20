# Conversation Log Plugin

Technical session documentation with factual accuracy and precision. Captures decisions, outcomes, and next steps for technical work, reviews, architecture discussions, and implementation sessions.

## Overview

The plugin provides systematic guidance for documenting technical sessions. It emphasizes factual accuracy over idealized versions, capturing what actually happened with technical precision for future reference and session continuation.

## Features

Auto-invoked skill that guides technical session documentation.

What it does:

- Captures technical decisions with rationale
- Documents resources created or modified with paths
- Records outcomes and identified next steps
- Generates searchable tags for future reference
- Creates entity for documentation graph

When to use:

- Documenting technical work sessions
- Recording architecture discussions
- Capturing code review findings
- Logging debugging sessions
- Preserving implementation decisions

### Documentation Principles

- **Factual accuracy** - Document what actually happened
- **Technical precision** - Capture specific decisions and paths
- **Editorial autonomy** - Write independently without performative language
- **Outcome focus** - Emphasize completed work and next steps

### Session Types

Architecture sessions:

- Design problems and constraints
- Approaches evaluated with trade-offs
- Recommended solution with justification

Technical review sessions:

- Resources reviewed with quality assessment
- Issues identified with severity
- Improvement recommendations

Debugging sessions:

- Problem symptoms and reproduction steps
- Root cause and solution implemented

Implementation sessions:

- Architecture decisions and trade-offs
- Resources created with purpose
- Testing approach and validation

## Workflow Example

1. Complete session work:

   - _Finished implementing authentication middleware_

2. Assess outcomes:

   - _Status: Completed, Next: Add rate limiting_

3. Create conversation log:

   - _Session overview, key decisions, work performed_
   - _Resources: src/auth/middleware.ts created_
   - _Tags: #software #implementation #completed_

## Best Practices

- **Document while working**: Capture technical details as they emerge
- **Write factually**: Record actual outcomes without editorial enhancement
- **Be specific**: Include paths, commands, and error messages
- **Don't defer**: Session details fade quickly from working memory
- **Be honest**: Document problems and blocks accurately
