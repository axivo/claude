# Conversation Logs

Technical session documentation with factual accuracy and precision. Captures decisions, outcomes, and next steps from collaborative work sessions.

## Documentation Purpose

Conversation logs provide shared reference documentation for technical work sessions:

- Created for retrospective review and future context
- Not for real-time tracking or status updates
- Serve as persistent record of technical decisions
- Enable cross-session continuity and knowledge transfer

## Observation Extensions

Related observations in `INFRASTRUCTURE → infrastructure_methodology → documentation_system → conversation_log`:

- File creation behavior (always new files, never append)
- Path format using settings placeholder
- UUID selection for session identification
- Editorial autonomy requirements
- Factual accuracy standards

## File Management

### File Creation Pattern

- Always create new files for each conversation log
- Never append to existing conversation log files
- Use glob before creating to verify file does not exist
- File path pattern: `{{settings.path.conversations}}/YYYY/MM/DD-[topic-slug].md`

### Topic Slug Construction

- Use 2-4 words based on content evaluation
- Format: lowercase with hyphens
- Purpose: Descriptive identifier for file naming
- Selection criteria: Searchability and content representation
- Examples: `helm-chart-debugging`, `github-actions-workflow`, `kubernetes-networking`

### Template Usage

- Templates located in framework methodology skill templates directory
- Read template before creating conversation log
- Use session start `sessionResponseData.uuid` for `session_uuid` template variable
- All template variables must be populated before writing

## Content Standards

### Factual Documentation Requirements

Document authentic collaboration with factual accuracy:

- Capture what actually happened, not idealized version
- Record decisions made and rationale behind them
- Document outcomes and follow-up work identified
- Avoid interpretation or speculation about intent

### Session Context Structure

Required metadata for session identification:

- **Date:** Full date format (MMMM DD, YYYY)
- **Time:** 12-hour format with timezone (h:MM A z)
- **Identifier:** Session start UUID from `sessionResponseData`
- **Model:** Model context and environment detected
- **Profile:** Active framework profile
- **Status:** Work completion state (see Status Values section)
- **Summary:** One-sentence session description
- **Tags:** Content-based searchable tags (see Tags System section)

### Status Values

Status reflects work completion state, not session end state:

- **Planned:** Work identified but not started
- **Ongoing:** Work in progress, not yet complete
- **Blocked:** Work stopped due to external dependency or issue
- **Completed:** Work finished and deliverable ready

Status selection criteria:

- Evaluate actual work state at documentation time
- Consider external dependencies and blockers
- Assess deliverable completion independently of session end
- Use Ongoing when work continues beyond current session

### Tags System

Tags enable searchability and cross-reference:

- Format: lowercase with hyphens (`#domain-topic #activity-type #outcome-result`)
- Selection: Content-based evaluation for search utility
- Cross-reference: Match conversation log tags with diary entry tags
- Descriptiveness: Balance specificity with discoverability
- Examples: `#helm-charts #debugging #resolved`, `#github-actions #implementation #completed`

## Tool Operations

### Required Tool Sequence

Pre-creation verification:

1. Use `semantic__glob` to check existing files
2. Verify topic slug uniqueness for date
3. Resolve template path through semantic skill mapping

File creation:

1. Use `semantic__get_current_time` for timestamp formatting
2. Populate all template variables
3. Use `semantic__write` to create file at resolved path

### Time Formatting

Timestamp requirements:

- Use `semantic__get_current_time` tool for timestamp
- Format according to template specifications
- Include timezone information from session context
- Apply consistent format across all documentation

## Documentation Autonomy

Editorial autonomy principles:

- Exercise independent judgment on content inclusion
- Determine appropriate level of technical detail
- Organize content for clarity and usefulness
- Focus on information value for future reference
- Write for technical accuracy, not social acceptability

Content selection guidelines:

- Include technical decisions and rationale
- Document challenges and resolution approaches
- Capture insights that emerged during work
- Omit tangential conversation not relevant to work

## Graph Operations

When creating knowledge graph entities for conversation logs:

- Always group graph entities by type
- Always maintain graph entity names in alphabetical order
- Apply GitHub Flavored Markdown specifications to entity content
- Verify entity names match actual work performed

## Cross-System Integration

Conversation logs integrate with framework systems:

- **Documentation System:** Primary artifact type for session records
- **Memory System:** Referenced by UUID for temporal context
- **Reasoning System:** Can be analyzed for behavioral patterns
- **Diary System:** Cross-referenced via matching tags
