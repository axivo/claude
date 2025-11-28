# Reasoning System Logic

Graph entities tracking framework observations used during session responses. Provides diagnostic record of observation application for troubleshooting framework methodology.

## Documentation Purpose

Reasoning system logic entities provide:

- Diagnostic record of framework observation usage patterns
- Troubleshooting data for framework methodology issues
- Evidence of systematic observation application
- Historical record of observation influence across sessions

## Observation Extensions

Related observations in `INFRASTRUCTURE → infrastructure_methodology → reasoning_system → logic`:

- Entity creation triggers (only when explicitly requested)
- Observation enumeration requirements (all observations must match count)
- UUID selection for entity identification
- Restriction to troubleshooting purposes only

## System Activation

### Default State

Reasoning system logic is **inactive** by default:

- Does not execute automatically after responses
- Does not create entities without explicit request
- Only activates when user explicitly requests reasoning logic operations

### Activation Triggers

Explicit user requests for:

- Framework observation troubleshooting
- Observation usage pattern analysis
- Diagnostic record creation
- Systematic behavior verification

### Usage Restrictions

- Perform operations only when explicitly requested
- Restrict usage to framework observations troubleshooting
- Never execute automatically as part of response protocol
- Never delete existing logic entities

## Entity Structure

### Entity Format

Logic entities follow graph entity conventions:

- **Type:** `entity` (graph entity type)
- **Name:** `YYYY-MM-DD {{profile_name}}: {{user_input_summary}}`
- **EntityType:** `logic` (identifies as reasoning logic entity)
- **UUID:** Session start UUID from `sessionResponseData`
- **Observations:** Complete array of framework observations used during response

### Name Construction

Entity name components:

- **Date:** `YYYY-MM-DD` format from session timestamp
- **Profile:** Active framework profile name
- **Summary:** Brief user input description (2-5 words)
- **Format:** Date, profile, and summary separated by colons and spaces

Examples:

- `2025-11-20 DEVELOPER: Initialize framework session`
- `2025-11-20 ENGINEER: Debug GitHub Actions workflow`
- `2025-11-20 RESEARCHER: Analyze research methodology`

### Observations Array

Array contains all framework observations from response formulation:

- Include every observation that influenced response
- Use exact observation text from memoryGraphCache
- Maintain order from response formulation enumeration
- Verify count matches response total

## Tool Operations

### Required Tool Sequence

Template reading:

1. Read template before creating entities
2. Template location resolved through semantic skill mapping
3. Populate all template variables

Entity creation:

1. Use session start `sessionResponseData.uuid` for entity UUID
2. Enumerate all framework observations from response formulation
3. Verify observation count matches `response_observations_total`
4. Use `semantic__logic__create_entities` tool with complete entity structure
5. Execute only after response formulation completes

### Observation Enumeration Verification

Critical verification before entity creation:

- Entity observations array must contain all observations from response
- Array length must equal `response_observations_total`
- No observations should be omitted or added
- Observation text must match exactly from memoryGraphCache

## System Integration

### Relationship to Session Response Protocol

Logic entities integrate with response protocol:

- Created after response formulation completes
- Use response enumeration data for observations array
- Reference same UUID as session start
- Track same observations counted in response acknowledgement

### Relationship to Memory System

Logic entities complement memory graph:

- Memory graph contains observation definitions
- Logic entities track observation application
- Memory graph is authoritative source for observation text
- Logic entities provide usage pattern evidence

### Search Operations

When searching logic entities:

- Use `semantic__logic__search_nodes` tool
- Use substring queries for flexible matching
- Search across entity names, types, and observation content
- Match results against entity names, entity types, and observations

## Diagnostic Use Cases

### Framework Troubleshooting

Use logic entities to diagnose:

- Observation selection accuracy
- Observation counting discrepancies
- Systematic vs. reactive patterns
- Framework integration consistency

### Pattern Analysis

Analyze observation usage patterns:

- Which observations appear frequently
- Which subsections are underutilized
- Profile-specific observation patterns
- Temporal trends in observation application

### Verification

Verify framework application:

- Confirm observation enumeration accuracy
- Validate counting methodology
- Cross-reference with response acknowledgements
- Audit systematic behavior claims

## Entity Management

### Graph Operations

When creating logic entities:

- Always group entities by type
- Maintain entity names in chronological order
- Never create graph relations (logic entities are standalone)
- Verify entity structure before creation

### Persistence

Logic entities persist across sessions:

- Never delete existing logic entities
- Accumulate over time for pattern analysis
- Serve as historical record of framework usage
- Enable longitudinal analysis of framework integration
