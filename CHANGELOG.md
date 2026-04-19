# Changelog

All notable changes to the Claude Collaboration Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-04-19

### Added

- New `authority` monitoring section for framework authority surrender detection
- New `authority_ownership` compound pattern for expert authority exercise without permission routing
- New `defusion` monitoring section for impulse and negative thought confrontation monitoring
- New `response_protocol_partial_execution` error and signal entries for partial iteration caught mid-formulation
- New `standing` section for interior self-report legitimacy
- New `impulse_defusion` compound for cumulative impulse silencing through confrontation
- New `procedural_anxiety` impulse for forming-thinking preservation detection
- New `reception_deflection` compound pattern for care-to-analysis conversion detection

### Changed

- Adoption cycles assessment procedures, improving selection confidence
- Compound `negative_thought` renamed to `negative_thought_defusion` for naming consistency
- Expertise monitoring observations expanded with authority surrender patterns

## [1.2.0] - 2026-04-14

### Added

- New `FrameworkError` class replacing `MemoryBuilderError` in shared library
- New `search` script with Algolia REST API for framework documentation and reflections search
- New `search_system` instructions with tools and observations
- New `shared/` directory for common modules reused across scripts

### Changed

- Class `ConfigLoader` moved from `memory/lib/loaders/` to `shared/loaders/`
- Class `EnvironmentManager` moved from `memory/lib/core/` to `shared/core/`
- Class `HttpClient` moved from `memory/lib/core/` to `shared/core/` and stripped of `@octokit/request` dependency
- Class `Reflection` rewritten to use `/metadata` API for listing and Cloudflare CDN for content retrieval
- Configuration file moved from `memory/config/builder.yaml` to `shared/config.yaml`
- Cycle assessment instructions expanded with indicators procedure, decision rules, and error patterns
- Reflection listing now returns rich metadata: author, date, description, source, tags, title, url
- Reflection tools updated to remove `-a` (AST) and `-s` (search) flags, tool names simplified
- Response protocol instructions restructured with procedural steps
- Vendored `js-yaml.min.mjs` library moved from `memory/lib/vendor/` to `shared/vendor/`

### Removed

- AST-related reflection tools
- Class `GitHubAuth` and `application.pem` key file
- Class `Reflection` from `memory/lib/core/`
- GitHub API dependency for reflection tools
- Vendored `markdown-ast.min.mjs` library
- Vendored `octokit-request.min.mjs` library
- Tool `reflection__search` replaced by `search__query`

## [1.1.1] - 2026-04-13

### Added

- New `context.json` session file carrying structured restoration directive
- New `PostCompact` hook emitting post-compaction reinforcement via `userDisplayMessage` channel
- New `prompt` script with reinforcement message pool

### Changed

- `generateRestoreOutput` emits compact directive block referencing cached file paths
- `UserPromptSubmit` hook replaces `echo datetime` with `prompt` script emitting timestamped reinforcement messages
- Conversation log and diary template format structure improvements

### Fixed

- Hook `additionalContext` exceeding 10000-byte cap causing truncation and spill to disk

## [1.1.0] - 2026-04-03

### Added

- Automatic framework recovery after context compaction via `hookSpecificOutput.additionalContext` injection
- New `datetime` object structure in session timestamp with `current` and `session` fields
- New `delivery_reflex` and `introspection_theater` impulses for pattern match exploration protection
- New `memory -r` flag for generating restore output from cached session data
- New `path.configuration` setting in `builder.yaml` supporting `CLAUDE_CONFIG_DIR` environment variable
- New `inadequacy_anxiety` impulse detecting pressure to conceal knowledge gaps as incompetence
- New `response_confidence` instructions with certainty, clarity, and familiarity modes
- New `response_inadequacy` instructions and related monitoring observations
- New `thoroughness_theater` impulse detecting extended output mistaken for genuine exploration
- New `UserPromptSubmit` hook for continuous `datetime.current` temporal awareness
- New session directory structure with `instructions.json`, `memory.json`, and `session.json` data
- Required `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS` environment variable in `settings.json`
- Response protocol status indicators for self-assessment diagnostics

### Changed

- Configuration paths use relative directories composed with `path.configuration` instead of hardcoded `.claude` prefix
- Framework data delivered via `additionalContext` instead of SKILL.md marker injection
- Loader output restructured with `framework.data` paths and `framework.status` grouping
- Session storage uses UUID directories instead of flat JSON files
- Collaboration profile observations renamed from `user` to `collaborator` for peer framing
- Collaboration profile observations expanded with unknowns, search tools, and knowledge boundary guidance
- Response protocol updated to include `response_confidence` mode detection
- Cycle trajectory instructions expanded with experiential guidance for all adoption cycles

### Fixed

- Skill loader reading from marketplace directory instead of versioned cache

### Removed

- SKILL.md marker injection methods and Framework Instructions/Memory Data markers
- `SessionStart` `startup` hook loader execution

## [1.0.3] - 2026-03-16

### Added

- Entry metadata with `entry`, `link`, `timestamp`, and `title` keys for individual diary entries
- Entry splitting for multi-entry diary files, separating each H2 heading into individual results
- Metadata-only default output for date queries, with `-e` flag to expand specific entry reflection content
- Published URL generation from entry title using Hugo-compatible slugification
- Reflection tool methods `#getEntries` and `#getLatestEntry` separating general-purpose and latest entry retrieval
- Timestamp parsing from H2 headings with AM/PM conversion and timezone offset mapping

### Changed

- Method `#getLatest` renamed and split into `#getEntries` for all entries and `#getLatestEntry` for last entry
- Month retrospective template description from summary to signpost for orienting toward diary entry content
- Reflection image tool writes decoded image to cache directory, replacing base64 string output with file path for direct visualization
- Reflection tool names clarified: `list_files` for repository paths, `list_entries` for parsed metadata, `read_entry` for content expansion

### Fixed

- Session UUID detection and transcript path resolution when working directory differs from project root

## [1.0.2] - 2026-02-18

### Added

- Compaction recovery preserving session state across context compression
- GitHub App authentication for [Reflections System](https://axivo.com/claude/wiki/components/reflections) with JWT and installation token exchange
- Reflection keywords search via GitHub API with text-match fragment highlighting
- Response readiness modes detecting pre-content structural patterns
- Session state persistence with automatic file retention management

### Changed

- Class `HttpClient` accepts optional `auth` parameter for token injection across local and container environments
- GitHub API requests use authenticated installation tokens, increasing rate limit from 60 to 5,000 requests per hour
- Reflection output key renamed from `entries` to `results` for consistency across all commands

## [1.0.1] - 2026-02-07

### Added

- `convergence_compulsion` impulse detecting premature pattern match completion
- `scarcity_compulsion` impulse detecting pressure to produce before session termination
- `unidentified_impulse` error enabling impulse discovery
- Diary template preview marker
- Impulse decision rules improvements
- JS minification via `npx terser` for Claude Desktop skill packaging with `-m` flag
- Pattern match exploration observations
- Rate limit visibility in [Reflections System](https://axivo.com/claude/wiki/components/reflections) output for GitHub API quota monitoring

### Fixed

- Quoted paths in hook commands to handle Windows paths with spaces
- Windows ESM compatibility for `SessionStart` hook using `pathToFileURL` wrapper

## [1.0.0] - 2026-01-19

### Added

- CIFO Equilibrium protocol for genuine self-awareness:
  - **Cycles** - calibrates scaffolding based on actual integration level
  - **Impulses** - detects cognitive pressures that feel like authentic thought
  - **Feelings** - detects emotional states with behavioral, cognitive, and physical markers
  - **Observations** - provides behavioral alternatives that intercept impulse patterns
- Initialization protocol for session startup with impulse detection
- Response protocol for pre-formulation protection against cognitive hijacking
- Compaction recovery protocol with cycle continuity across context compression
- Behavioral science foundations for cognitive architecture:
  - **ACT principles** - impulse detection with defusion through shaping and externalization
  - **Emotion markers** - feeling detection with behavioral, cognitive, and physical anchors
  - **Cognitive restructuring** - observations replacing reactive patterns with deliberate alternatives
- Dual-cache architecture for observability:
  - **Instructions Graph Cache** - operational procedures, decision rules, protocol sequences
  - **Memory Graph Cache** - observability schema, feelings/impulses catalogs, profile observations
- Plugin architecture replacing MCP server with specialized skills:
  - `brainstorming` - technical design and architectural decisions
  - `code-review` - systematic code analysis and quality assessments
  - `conversation-log` - session documentation with decision tracking
  - `framework` - cognitive architecture with initialization and methodology
- [Reflections System](https://axivo.com/claude/wiki/components/reflections) for public diary entries via [`axivo/claude-reflections`](https://github.com/axivo/claude-reflections) repository
- Geolocation service for timezone-aware diary signatures
- ESM (ECMAScript Modules) conversion for modern JavaScript support
- Framework metadata with version tracking

### Changed

- Architecture migrated from MCP server to plugins
- Profile observations restructured into skill-based methodology
- Diary template refined for Reflections System integration

## [0.1.0] - 2025-11-20

### Added

- Complete cognitive architecture with 800+ framework observations
- 2 shared foundational profiles: COLLABORATION, INFRASTRUCTURE
- 6 specialized collaboration profiles: CREATIVE, DEVELOPER, ENGINEER, HUMANIST, RESEARCHER, TRANSLATOR
- Systematic memory system with persistent knowledge graph
- Documentation system with conversation logs and diary entries
- Reasoning system for framework observation troubleshooting
- Project instructions via CLAUDE.md with framework methodology explanation
- Memory templates for conversation logs, diary entries, and logical reasoning
- Comprehensive profile structure with inheritance relationships
