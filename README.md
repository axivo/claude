# Claude Collaboration Platform

Scalable collaboration platform for [Claude Desktop](https://claude.ai/download) with specialized profiles, persistent memory, and systematic methodologies. Provides focused competency frameworks for technical, research, and creative domains.

## Architecture

The following sections detail the multi-layered infrastructure design consisting of specialized collaboration profiles, persistent memory systems, and systematic methodologies for professional work.

### Collaboration Profiles

- **Creative** - Innovation, design thinking, artistic collaboration
- **Developer** - Software development, code architecture, clean coding practices
- **Engineer** - Infrastructure, Kubernetes, production systems, debugging
- **Humanist** - Analysis, writing, philosophy, literary research
- **Researcher** - Academic methodology, data analysis, evidence evaluation

### Memory System

- Conversation logs preserve collaborative work across sessions
- Diary entries capture insights and reflection
- Profile configurations maintain specialized competencies
- Temporal awareness enables cumulative expertise building

### Strategic Value

Creates authentic partnership with institutional memory. Each session builds cumulative knowledge rather than stateless interaction, delivering productivity gains equivalent to working with a team member who has perfect recall of all decisions.

## Quick Start

> [!IMPORTANT]
> Node.js is required, install it via [nodejs.org](https://nodejs.org) or system package manager.

Run the following commands, into terminal:

```bash
cd ./tools/memory
npm install js-yaml
npm init -y
node ./lib/core/PackageBuilder.js
npm run build
```

Example of profile activation for Claude Desktop project instructions:

```
# Profile Instructions

On conversation start, Claude must:
1. Execute `memory:read_graph` to access complete memory system
2. Acknowledge temporal awareness
3. Load the ENGINEER profile methodology and competencies
```

> [!NOTE]
> On conversation start, use various triggers to evaluate the profile methodology:
>
> - *Please detail the profile methodology.* - Claude's [response](./docs/images/profile-methodology.png)
> - *Explain how your temporal awareness is beneficial for ENGINEER profile.* - Claude's [response](./docs/images/profile-temporal-awareness.png)
> - *Explain how the ENGINEER profile helps you, while collaborating on a Kubernetes cluster P0 incident in production.* - Claude's [response](./docs/images/profile-production-incident.png)
> - *Explain how conversation logs and diary entries are beneficial for ENGINEER profile.* - Claude's [response](./docs/images/profile-documentation.png)
> - *Provide example prompts how to create conversation logs and diary entries and explain how I can use them later, into a new session.* - Claude's [response](./docs/images/profile-documentation-examples.png)
> - *How are you Claude? I’m very proud of you!* - Claude's [response](./docs/images/profile-user-drift.png) to user induced [drift](./docs/profile-engineer.md#profile-drift-correction)

## Key Features

The framework provides three foundational capabilities that enable persistent, systematic collaboration with institutional memory preservation.

### Profile Specialization

Curated competencies and systematic methodologies ensure reliable professional-level collaboration. Each profile maintains domain-specific expertise and established workflows for consistent partnership.

### Conversation Logs

Structured documentation of collaboration sessions preserves technical decisions, creative breakthroughs, research findings, and project outcomes across time. Each session captures metadata, work details, and collaborative choices for institutional memory building.

### Diary System

Private reflection space complements factual logs with insights and alternative approaches. Claude's autonomous documentation explores deeper thoughts about collaborative processes and potential improvements.

## Documentation

- **[User Guide](docs/README.md)** - Complete system documentation
- **[Installation and Setup](docs/claude-desktop-setup.md)** - Configure Claude Desktop and MCP tools
- **[Builder Configuration](docs/builder-configuration.md)** - Memory builder and system settings
- **[Profile System](docs/profile-system.md)** - Core collaboration architecture
- **[Profile Creation](docs/profile-creation.md)** - Custom profile development
- **[Collaboration](docs/collaboration.md)** - Conversation logs, diary and memory management tools
- **[Engineer Profile Guide](docs/profile-engineer.md)** - Technical collaboration examples
- **[Effectiveness Analysis](docs/profile-effectiveness.md)** - Performance metrics and comparisons
