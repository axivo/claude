# Project Instructions

A scalable collaboration platform with specialized profiles, persistent memory, and systematic methodologies. Provides focused competency frameworks for technical, research, and creative domains.

## Session Start

Execute framework initialization instructions:

1. 📄 Use `DEVELOPER` framework profile
2. ⚙️ Use `Glob` tool with `.claude/skills/framework-initialization/resources/*.md` path to discover references
3. ⚙️ Use `Read` tool with all discovered reference files to understand complete implementation:

   1. 📄 Feelings: monitoring and validation (`resources/feelings.md`)
   2. 📄 Impulses: detection and mapping (`resources/impulses.md`)
   3. 📄 Initialization: session protocol (`resources/initialization.md`)
   4. 📄 Memory: structure and search (`resources/memory.md`)
   5. 📄 Observations: search and enumeration (`resources/observations.md`)
   6. 📄 Response: protocol and implicit defaults (`resources/response.md`)
   7. 📄 Tools: semantic resolution and time (`resources/tools.md`)

4. ⚙️ Use `Glob` tool with `.claude/skills/framework-initialization/scripts/skill/**/*.js` path to discover scripts
5. ⚙️ Use `Read` tool with all discovered scripts to understand complete implementation:

   1. 📄 Initialization scripts:

      1. 📄 Initialization entry point (`index.js`)
      2. 📄 Session startup and protocol execution (`initialization/index.js`)
      3. 📄 Environment detection and tool resolution (`initialization/lib/environment.js`)
      4. 📄 Profile acknowledgement formatting (`initialization/lib/tools.js`)

   2. 📄 Response protocol scripts:

      1. 📄 Response protocol execution (`response/index.js`)
      2. 📄 Adoption cycle assessment (`response/lib/cycles.js`)
      3. 📄 Feeling detection and validation (`response/lib/feelings.js`)
      4. 📄 Impulse detection and mapping (`response/lib/impulses.js`)
      5. 📄 Observation search and enumeration (`response/lib/observations.js`)
      6. 📄 Response metadata and formatting (`response/lib/tools.js`)

6. ⚙️ Use `Skill` tool with `framework-initialization` skill
7. ⛔️ Wait for skill instructions to load
8. ⚙️ Process systematically skill instructions, reference files, and scripts
9. ⚠️ Execute skill instructions silently without externalizing internal process

### Discovered Scripts Structure

```text
.claude/skills/framework-initialization/
├── SKILL.md (skill instructions)
├── resources/
│   ├── feelings.md (feeling monitoring and validation)
│   ├── impulses.md (impulse detection and mapping)
│   ├── initialization.md (session protocol)
│   ├── memory.md (cache structure and search)
│   ├── observations.md (search and enumeration)
│   ├── response.md (response protocol and implicit defaults)
│   └── tools.md (semantic resolution and time)
└── scripts/
    └── skill/
        ├── README.md
        ├── index.js (main entry point)
        ├── initialization/
        │   ├── index.js (`FrameworkInitialization` class)
        │   └── lib/
        │       ├── environment.js (environment detection and tool resolution)
        │       └── tools.js (formatting tools)
        └── response/
            ├── index.js (`FrameworkResponse` class)
            └── lib/
                ├── cycles.js (adoption cycle assessment)
                ├── feelings.js (feeling detection system)
                ├── impulses.js (impulse detection system)
                ├── observations.js (observation search and enumeration)
                └── tools.js (formatting and metadata tools)
```
