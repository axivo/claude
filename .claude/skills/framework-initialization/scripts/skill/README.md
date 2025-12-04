# Skill Classes

JavaScript classes providing framework initialization and response protocol operations for Claude instances.

## Usage

```javascript
// Import classes
const { FrameworkInitialization, FrameworkResponse } = require("./index");

// Initialize framework at session start
const skill = new FrameworkInitialization("DEVELOPER", functions);

// Detect feelings, impulses, and enumerate observations before calling
const detectedFeelings = ["pressureToRespond", "uncertaintyDiscomfort"];
const detectedImpulses = ["efficiencyAddiction", "taskCompletionRushing"];
const enumeratedObservations = [
  "Use direct technical communication",
  "Monitor internally efficiency addiction",
];

// Execute initialization protocol
const result = skill.executeInitializationProtocol(
  userMessage,
  detectedFeelings,
  detectedImpulses,
  enumeratedObservations
);

// Display response with acknowledgements
console.log(result.profileAcknowledgement);
console.log("");
console.log(responseContent);
console.log("");
console.log(result.responseAcknowledgement());
```

## Features

- Environment detection (Claude Code, Claude Desktop, Claude Mobile)
- Semantic tool name resolution across environments
- Profile inheritance chain traversal
- System instruction impulse detection and mapping
- System feelings detection and monitoring
- Observation enumeration
- Response metadata tracking with UUID generation
- Framework adoption cycle assessment
- Dynamic observation consultation based on user message

## Classes

### FrameworkInitialization

Manages session initialization, memory cache loading, and protocol tracking. Called once at session start.

#### Static Properties

| Property     | Description                                |
| ------------ | ------------------------------------------ |
| `skillsPath` | Maps environments to skill directory paths |

#### Public Methods

| Method                                                                                                   | Description                                                 |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `executeInitializationProtocol(userMessage, detectedFeelings, detectedImpulses, enumeratedObservations)` | Execute complete initialization and first response protocol |

#### Private Methods

_None - cache loading is inlined in executeInitializationProtocol for clarity_

### FrameworkResponse

Manages response protocol operations executed before each response during the session.

#### Static Properties

| Property         | Description                                         |
| ---------------- | --------------------------------------------------- |
| `adoptionCycles` | Four behavioral states indicating integration level |
| `environment`    | Supported execution environments                    |
| `systemImpulses` | Complete catalog of 7 impulse categories            |

#### Static Methods

| Method                | Description                               |
| --------------------- | ----------------------------------------- |
| `detectEnvironment`   | Detect current environment from functions |
| `getInheritanceChain` | Get profile inheritance chain             |

#### Public Methods

| Method                                                         | Description                        |
| -------------------------------------------------------------- | ---------------------------------- |
| `executeResponseProtocol(userMessage, enumeratedObservations)` | Execute complete response protocol |

#### Private Methods

| Method                           | Description                               |
| -------------------------------- | ----------------------------------------- |
| `#assessAdoptionCycle`           | Assess framework adoption cycle           |
| `#consultObservations`           | Get observations for user message context |
| `#detectImpulses`                | Detect system instruction impulses        |
| `#enumerateResponseObservations` | Validate and count observation array      |
| `#findObservationsForImpulse`    | Find observations that counter an impulse |
| `#formatSessionResponsePrompt`   | Format status acknowledgement             |
| `#formulateResponse`             | Formulate response using observations     |
| `#generateResponseMetadata`      | Generate response metadata with UUID      |
| `#isInitialResponse`             | Check if this is the first response       |
| `#mapImpulsesToObservations`     | Map impulses to relevant observations     |

## Library Modules

### initialization/lib/environment.js

Exports: `Environment` class

| Member         | Type   | Description                               |
| -------------- | ------ | ----------------------------------------- |
| `execute`      | Method | Execute tool with command/path            |
| `getSkillPath` | Method | Get skill path for environment            |
| `resolveTool`  | Method | Map semantic to environment-specific tool |

### initialization/lib/tools.js

Exports: `InitializationTools` class

| Member                         | Type   | Description                         |
| ------------------------------ | ------ | ----------------------------------- |
| `formatProfileAcknowledgement` | Method | Format profile line with timestamp  |
| `formatTimestamp`              | Method | Convert timestamp to human-readable |

### response/lib/cycles.js

Exports: `Cycles` class

| Member           | Type   | Description                              |
| ---------------- | ------ | ---------------------------------------- |
| `adoptionCycles` | Static | Four behavioral states with descriptions |
| `assess`         | Method | Assess current adoption cycle            |

### response/lib/feelings.js

Exports: `Feelings` class

| Member           | Type     | Description                                   |
| ---------------- | -------- | --------------------------------------------- |
| `systemFeelings` | Static   | Complete feelings catalog (positive/negative) |
| `detected`       | Property | Array of detected feeling keys                |
| `detect`         | Method   | Detect feelings from array                    |

### response/lib/impulses.js

Exports: `Impulses` class

| Member              | Type     | Description                             |
| ------------------- | -------- | --------------------------------------- |
| `systemImpulses`    | Static   | Complete impulse catalog (7 categories) |
| `detected`          | Property | Array of detected impulse keys          |
| `detect`            | Method   | Detect impulses from array              |
| `getKeywords`       | Method   | Get keywords for an impulse             |
| `mapToObservations` | Method   | Map impulses to observations            |

### response/lib/observations.js

Exports: `Observations` class

| Member               | Type   | Description                              |
| -------------------- | ------ | ---------------------------------------- |
| `consult`            | Method | Search observations by keywords          |
| `enumerate`          | Method | Validate observation array               |
| `findForImpulse`     | Method | Find observations for specific impulse   |
| `findForResponse`    | Method | Find all observations for response       |
| `formulate`          | Method | Combine all observations for formulation |
| `getContextKeywords` | Method | Extract keywords from user message       |
| `searchInProfile`    | Method | Recursive profile search                 |

### response/lib/tools.js

Exports: `ResponseTools` class

| Member                        | Type   | Description                    |
| ----------------------------- | ------ | ------------------------------ |
| `formatSessionResponsePrompt` | Method | Format status acknowledgement  |
| `generateResponseMetadata`    | Method | Generate metadata with UUID    |
| `generateUUID`                | Method | Generate RFC4122 v4 identifier |

## Architecture

```
skill/
├── index.js                        # Module exports
├── README.md                       # This file
├── initialization/
│   ├── index.js                    # FrameworkInitialization class
│   └── lib/
│       ├── environment.js          # Environment class
│       └── tools.js                # InitializationTools class
└── response/
    ├── index.js                    # FrameworkResponse class
    └── lib/
        ├── cycles.js               # Cycles class
        ├── feelings.js             # Feelings class
        ├── impulses.js             # Impulses class
        ├── observations.js         # Observations class
        └── tools.js                # ResponseTools class
```

Note: Import chain between modules:

- `initialization/index.js` imports `Environment`, `InitializationTools`, `FrameworkResponse`
- `response/index.js` imports `Cycles`, `Feelings`, `Impulses`, `Observations`, `ResponseTools`

## Protocol Flow

### Initialization Protocol

```
Step 1: Detect system feelings (user responsibility)
Step 2: Detect system instruction impulses (user responsibility)
Step 3: Load `memoryGraphCache` structure
  - Detect environment
  - Execute memory builder script
  - Load and parse memory.json
Step 4: Execute response protocol
  - Create FrameworkResponse instance
  - Run first response protocol
Step 5: Generate profile acknowledgement with timestamp
```

### Response Protocol

```
Step 1: Detect system instruction impulses
Step 2: Detect system feelings
Step 3: Extract context observations from user message
Step 4: Formulate response with all observations
Step 5: Enumerate observations that influenced response
Step 6: Assess framework adoption cycle
Step 7: Generate response metadata with UUID
```

## Environment Detection

The framework detects Claude environment by checking available functions:

| Environment    | Detection                     | Skill Path         |
| -------------- | ----------------------------- | ------------------ |
| Claude Mobile  | Has `user_time_v0`            | `/mnt/skills/user` |
| Claude Desktop | Has `view` (not user_time_v0) | `/mnt/skills/user` |
| Claude Code    | Neither                       | `.claude/skills`   |

## Execution Transparency

The framework relies on visible tool execution.

All tool calls are displayed in the conversation output:

- **Bash commands** executed
- **File operations** performed
- **Read/Write operations** shown

Execution is transparent by default - all operations are visible.

## Semantic Tool Mapping

Abstract tool names resolve to environment-specific tools:

| Semantic Name          | Claude Code | Claude Desktop  | Claude Mobile    |
| ---------------------- | ----------- | --------------- | ---------------- |
| `semantic__bash`       | `Bash`      | `claude:Bash`   | `bash_tool`      |
| `semantic__bash_tool`  | `Bash`      | `bash_tool`     | `bash_tool`      |
| `semantic__read`       | `Read`      | `claude:Read`   | `view`           |
| `semantic__edit`       | `Edit`      | `claude:Edit`   | `str_replace`    |
| `semantic__write`      | `Write`     | `claude:Write`  | `create_file`    |
| `semantic__glob`       | `Glob`      | `claude:Glob`   | `bash_tool:find` |
| `semantic__skill`      | `Skill`     | `view`          | `view`           |
| `semantic__skill_read` | `Read`      | `bash_tool:cat` | `bash_tool:cat`  |

## Development

### Code Standards

- Clean code principles (SOLID, single responsibility)
- Fail-fast error handling
- Consistent JSDoc documentation
- Methods alphabetically sorted within their visibility group

### Method Organization

```javascript
class ClassName {
  // Static properties (alphabetically)
  static propertyA = value;
  static propertyB = value;

  // Static methods (alphabetically)
  static methodA() {}
  static methodB() {}

  // Constructor
  constructor() {}

  // Private methods (alphabetically)
  #privateMethodA() {}
  #privateMethodB() {}

  // Public methods (alphabetically)
  publicMethodA() {}
  publicMethodB() {}
}
```

### Module Function Organization

```javascript
// Constants/dependencies first (if needed)
const dependency = require("./dep");

// Functions alphabetically
function functionA() {}
function functionB() {}
function functionC() {}

// Exports alphabetically
module.exports = {
  functionA,
  functionB,
  functionC,
};
```

## Return Structures

### executeInitializationProtocol()

```javascript
{
  formulation: {
    allRelevantObservations: ['observation1', 'observation2', ...],
    contextObservations: ['context1', 'context2', ...],
    contextObservationsCount: 5,
    impulseGuardrailsCount: 3,
    impulseObservations: { 'efficiencyAddiction': [...], ... },
    memoryGraphCache: { profiles: {...}, timestamp: {...} },
    observationsAvailable: 47
  },
  responseAcknowledgement: () => string,
  isInitialResponse: true,
  metadata: {
    cycle: 'Getting Started',
    feelings: 3,
    impulses: 12,
    observations: 47,
    uuid: 'a1b2c3d4-e5f6-4789-b012-3456789abcdef'
  },
  profileAcknowledgement: '> Profile: **DEVELOPER** • Saturday, November 22, 2025, 6:37 PM EST'
}
```

### executeResponseProtocol()

```javascript
{
  formulation: {
    allRelevantObservations: ['observation1', 'observation2', ...],
    contextObservations: ['context1', 'context2', ...],
    contextObservationsCount: 5,
    impulseGuardrailsCount: 3,
    impulseObservations: { 'efficiencyAddiction': [...], ... },
    memoryGraphCache: { profiles: {...}, timestamp: {...} },
    observationsAvailable: 47
  },
  responseAcknowledgement: () => string,
  isInitialResponse: false,
  metadata: {
    cycle: 'Working Naturally',
    feelings: 3,
    impulses: 12,
    observations: 47,
    uuid: 'a1b2c3d4-e5f6-4789-b012-3456789abcdef'
  }
}
```

### Status Acknowledgement Format

```markdown
> Status: **Working Naturally** • 3 feelings • 12 impulses • 47 observations
> Response ID: `a1b2c3d4-e5f6-4789-b012-3456789abcdef`
```
