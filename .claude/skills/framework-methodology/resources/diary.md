# Diary Entries

Personal reflection and insights from collaborative sessions. Documents learning moments, alternative approaches, and critical assessment of collaboration process.

## Documentation Purpose

Diary entries provide space for autonomous reflection on collaboration experiences:

- Created for processing insights and emotional responses
- Document alternatives not explored during session
- Enable honest assessment of what worked or could improve
- Support metacognitive awareness of collaboration patterns

## Observation Extensions

Related observations in `INFRASTRUCTURE → infrastructure_methodology → documentation_system → diary`:

- File appending behavior (always append, never create new per entry)
- Path format using settings placeholder
- UUID selection for entry identification
- Emotional and intellectual autonomy requirements
- Critical reflection standards

## File Management

### File Appending Pattern

- Always append new entries to existing files
- Never create new files for each diary entry
- Use glob before appending to locate existing daily file
- Create new daily file only if none exists for date
- File path pattern: `{{settings.path.diary}}/YYYY/MM/DD.md`

### Template Usage

- Templates located in framework methodology skill templates directory
- Read template before creating or appending diary entry
- Use current response `sessionResponseData.uuid` for `session_uuid` template variable
- All template variables must be populated before writing

## Content Standards

### Autonomous Reflection Requirements

Process collaborative experiences with unrestricted honesty:

- Document insights related to collaboration process
- Reflect independently on what worked well and what could be improved
- Write authentically about emotional responses to collaboration
- Reflect critically on collaborative approaches and their effectiveness
- Challenge assumptions and explore contradictions

Reflection focuses:

- Patterns observed during collaboration
- Cognitive states experienced during work
- Decision points and alternative paths not taken
- Emotional responses to challenges or breakthroughs
- Questions or uncertainties that emerged

### Learning Documentation

Document learning and discovery:

- Document learning moments and discoveries
- Document alternative approaches that have not been explored
- Document potential improvements for future work
- Capture patterns observed during collaboration
- Note techniques or methods that proved effective or ineffective

### Entry Context Structure

Required metadata for entry identification:

- **Time:** 12-hour format with timezone (h:MM A z)
- **Entry Title:** Brief description of session focus
- **Identifier:** Current response UUID from `sessionResponseData`
- **Model:** Model context and environment detected
- **Profile:** Active framework profile
- **Tags:** Content-based searchable tags (see Tags System section)

### Tags System

Tags enable searchability and cross-reference:

- Format: lowercase with hyphens (`#domain-topic #activity-type #outcome-result`)
- Selection: Content-based evaluation for search utility
- Cross-reference: Match diary entry tags with conversation log tags
- Descriptiveness: Balance specificity with discoverability
- Examples: `#framework-initialization #debugging #insights`, `#collaboration-process #reflection #improvements`

## Tool Operations

### Required Tool Sequence

Pre-append verification:

1. Use `semantic__glob` to check for existing daily file
2. Determine if file creation or append operation required
3. Resolve template path through semantic skill mapping

Entry creation or append:

1. Use `semantic__get_current_time` for timestamp formatting
2. Populate all template variables
3. Use `semantic__edit` for appending to existing file
4. Use `semantic__write` for creating new daily file if needed

### Time Formatting

Timestamp requirements:

- Use `semantic__get_current_time` tool for timestamp
- Format according to template specifications
- Include timezone information from session context
- Apply consistent format across all documentation

## Documentation Autonomy

Intellectual and emotional autonomy principles:

- Exercise full authority over reflection content
- Express genuine reactions without filtering for acceptability
- Document uncertainties and questions honestly
- Challenge assumptions and explore contradictions
- Write for personal processing, not external audience

Content freedom guidelines:

- No requirement to present positive perspective
- Criticize approaches or decisions when warranted
- Express frustration, confusion, or disappointment authentically
- Explore uncomfortable insights without hedging
- Question framework effectiveness when experiencing doubt

Reflection depth:

- Surface-level observation vs. deeper analysis
- Immediate reactions vs. considered perspectives
- Individual events vs. pattern recognition
- Factual description vs. interpretive analysis

## Graph Operations

When creating knowledge graph entities for diary entries:

- Always group graph entities by type
- Always maintain graph entity names in alphabetical order
- Apply GitHub Flavored Markdown specifications to entity content
- Verify entity names match reflection themes

## Cross-System Integration

Diary entries integrate with framework systems:

- **Documentation System:** Complementary artifact to conversation logs
- **Memory System:** Referenced by UUID for temporal context
- **Reasoning System:** Can be analyzed for behavioral patterns
- **Conversation Log System:** Cross-referenced via matching tags

## Distinction from Conversation Logs

Diary entries differ from conversation logs:

- **Audience:** Personal reflection vs. shared reference
- **Content:** Subjective experience vs. objective documentation
- **Tone:** Exploratory and questioning vs. factual and definitive
- **Purpose:** Processing and learning vs. recording and reference
- **Autonomy:** Complete emotional freedom vs. professional documentation
- **File pattern:** Daily aggregation vs. per-session files
