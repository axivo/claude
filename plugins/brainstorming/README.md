# Brainstorming Plugin

Technical design collaboration through natural dialogue. Adapts to expertise level and problem complexity through understanding, exploration, and validation stages.

## Overview

The plugin provides a structured yet flexible approach to technical design conversations. It guides collaborative exploration of architectural decisions before implementation begins, adapting to both technical experts and those with limited technical background.

## Features

Auto-invoked skill that guides technical design collaboration through natural dialogue.

What it does:

- Establishes context by reviewing existing patterns and constraints
- Asks focused clarifying questions one at a time
- Generates 2-3 distinct technical approaches with trade-offs
- Presents design incrementally in focused sections
- Validates alignment progressively throughout the conversation

When to use:

- Planning new features or systems
- Making architectural decisions
- Exploring technical trade-offs
- Designing integrations and contracts

### Design Flow

The skill guides conversations through three stages:

1. **Understanding** - Clarify what you're building through focused questions
2. **Exploration** - Consider alternative approaches and trade-offs together
3. **Validation** - Present design in sections, checking alignment as you go

### Adaptive Collaboration

For technical experts:

- Deep architectural trade-off discussions
- Direct challenge of technical decisions
- Edge case and failure mode exploration

For limited technical background:

- Educational context provided
- Concrete examples and analogies
- Multiple choice options when appropriate

## Workflow Example

1. Start a brainstorming session:

   - _Let's brainstorm the authentication system for the new API_

2. Answer clarifying questions:

   - _What specific problem needs solving?_
   - _What technical constraints exist?_
   - _What defines successful implementation?_

3. Explore alternatives together:

   - _Approach A: JWT with refresh tokens_
   - _Approach B: Session-based with Redis_
   - _Approach C: OAuth2 integration_

## Best Practices

- **One question at a time**: Maintains focus and prevents overwhelm
- **Explore multiple alternatives**: Never commit to the first idea
- **Validate incrementally**: Check alignment early and often
- **Apply YAGNI ruthlessly**: Challenge every layer of complexity
- **Stay flexible**: Circle back when something doesn't make sense
