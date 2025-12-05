# Memory Reference

Structure and access methods for `memoryGraphCache`. Loaded once at [initialization](./initialization.md), persists entire session, zero-cost queries. Contains profile inheritance chains, [observations](./observations.md), [impulse](./impulses.md)/[feeling](./feelings.md) catalogs, and timestamp.

## Paths

```
memoryGraphCache
├── profiles
│   └── {PROFILE_NAME}
│       ├── inherits[]
│       ├── {category}_context.{subsection}.observations[]
│       └── {category}_methodology.{subsection}.observations[]
└── timestamp
    ├── datetime
    ├── day_of_week
    ├── is_dst
    └── timezone
```

## Structure

```
{ACTIVE_PROFILE}
└── {INHERITED_PROFILE}
    └── COLLABORATION
        ├── INFRASTRUCTURE
        ├── INITIALIZATION
        ├── MEMORY
        ├── MONITORING
        └── TEMPORAL
```

## Access Methods

| Method | Syntax | Use |
|--------|--------|-----|
| Direct | `memoryGraphCache.profiles.PROFILE.section` | Known path |
| Keyword | Search for "keyword" | Unknown location |
| Path | Search for `system_impulses.speed` | Navigate to section |

## Protocol

1. Identify keywords from user message
2. Search `memoryGraphCache` for keywords
3. Review surfaced observations
4. Apply relevant observations during formulation
5. Enumerate observations that influenced response

## Decision Rules

| Condition | Action |
|-----------|--------|
| Need observation | Search cache, don't recall manually |
| Doubt cache exists | Search any keyword, observe instant results |
| Low observation count | Search skipped - iterate inheritance chain |

## Loading

| Aspect | Value |
|--------|-------|
| Load time | Session initialization |
| Persistence | Entire session |
| Query cost | 0 tokens |
| Expiration | None within session |

## Inheritance Chains

| Profile | Total Profiles |
|---------|----------------|
| DEVELOPER | 9 |
| ENGINEER | 8 |
| CREATIVE, HUMANIST, RESEARCHER, TRANSLATOR | 7 each |

## Errors

| Pattern | Symptom | Fix |
|---------|---------|-----|
| Manual recall | Low observation counts | Search cache systematically |
| Cache doubt | Reaching for external tools | Search any keyword, trust persistence |
| Incomplete chain | Missing MONITORING/MEMORY observations | Follow `inherits` array |
| Direct file read | Stale timestamp | Execute memory builder script |

## Verification

```javascript
// Confirm cache loaded
search memoryGraphCache for "always"
// Returns observations instantly = cache available
```

## Related

- [feelings.md](./feelings.md)
- [impulses.md](./impulses.md)
- [initialization.md](./initialization.md)
- [observations.md](./observations.md)
- [response.md](./response.md)
