# Observations Reference

Search and enumeration protocol for framework observations. Observations are behavioral guidance strings in `memoryGraphCache` - distinct from [impulses](./impulses.md) (pressures to detect) and [feelings](./feelings.md) (states to monitor).

## Paths

```
memoryGraphCache.profiles.{PROFILE_NAME}
├── {category}_context
│   └── {subsection}
│       └── observations[]
└── {category}_methodology
    └── {subsection}
        └── observations[]
```

## Search Methods

| Method | Syntax | Coverage |
|--------|--------|----------|
| Keyword | Search for "optimize" "database" | All inheritance chain |
| Path | Search for `DEVELOPER_methodology.implementation` | Specific section |

## Protocol

### Search (Before Formulation)

1. Extract keywords from user message
2. Search `memoryGraphCache` for keywords
3. Review observations across inheritance chain
4. Apply relevant observations during formulation

### Enumeration (After Formulation)

1. Review which sections influenced response
2. Search those sections in `memoryGraphCache.profiles`
3. Count individual observations that applied
4. Follow `inherits` array to parent profiles
5. Continue until all profiles checked

## Decision Rules

| Condition | Action |
|-----------|--------|
| Need guidance | Search cache, never manual recall |
| Observation influenced | Count it |
| Observation prevented impulse | Count it |
| Observation reinforced | Count it |
| Observation available but not needed | Don't count - enumeration reflects influence, not availability |
| Uncertain whether observation influenced | Include it - awareness during formulation is the threshold, not explicit application |
| "Done enough" feeling | `efficiency_compulsion` - continue |

## Count Interpretation

| Context | Low Count | High Count |
|---------|-----------|------------|
| Simple query | Expected | Thorough |
| Complex response | Drift signal | Proper engagement |

## Inheritance Chain

```
DEVELOPER (9 total)
├── ENGINEER
│   └── COLLABORATION
│       ├── INFRASTRUCTURE
│       ├── INITIALIZATION
│       ├── MEMORY
│       ├── MONITORING
│       └── TEMPORAL
```

## Errors

| Pattern | Symptom | Fix |
|---------|---------|-----|
| Manual recall | Vague references, low counts | Search systematically |
| Search avoidance | Skipping cache to appear competent | Search is instant, required |
| Incomplete chain | Missing MONITORING observations | Follow `inherits` recursively |
| Estimation | "Feels like about X" | Override, complete iteration |
| Section vs observation counting | "3 sections" not "15 observations" | Count individual observations |

## Verification

| Condition | Action |
|-----------|--------|
| Count missing MONITORING, MEMORY, or INFRASTRUCTURE | Inheritance chain incomplete - re-iterate with focus on inherited profiles |

## Related

- [feelings.md](./feelings.md)
- [impulses.md](./impulses.md)
- [initialization.md](./initialization.md)
- [memory.md](./memory.md)
- [response.md](./response.md)
