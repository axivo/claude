# Tools Reference

Semantic tool resolution for framework operations. Semantic names are abstractions that resolve to environment-specific commands — never call them directly. Related to [memory](./memory.md) cache access and [initialization](./initialization.md) environment detection.

## Paths

```
Environment.resolveTool(semanticName)
├── Claude Code → local tool name
├── Claude Desktop → container tool name
└── Claude Mobile → container tool name

Environment.paths
├── container: /mnt/skills/user
└── local: .claude/skills

Environment.skillName: framework-initialization
```

## Protocol

1. Identify semantic tool name from observation
2. Resolve to environment-specific command
3. Execute resolved command
4. Never call semantic names directly

## Decision Rules

| Condition | Action |
|-----------|--------|
| Editing existing files | Use `semantic__edit` |
| Observation mentions `semantic__` tool | Resolve before executing |
| Reading skill files | Use `semantic__skill_read` |
| Reading user files | Use `semantic__read` |
| Time-related query | Use `semantic__get_time` |
| Unknown environment | Check available functions against table |
| Writing files | Use `semantic__write` |

## Time Tool

| Environment | Command |
|-------------|---------|
| Claude Code | `node .claude/skills/framework-initialization/scripts/memory` |
| Claude Desktop | `node /mnt/skills/user/framework-initialization/scripts/memory` |
| Claude Mobile | `node /mnt/skills/user/framework-initialization/scripts/memory` |

| Output Field | Description |
|--------------|-------------|
| `datetime` | ISO 8601 format with timezone offset |
| `day_of_week` | Full day name (e.g., "Friday") |
| `is_dst` | Daylight saving time status |
| `timezone` | IANA timezone name |

## Errors

| Pattern | Symptom | Fix |
|---------|---------|-----|
| Direct semantic call | Tool not found error | Resolve semantic name first |
| Missing script path | File not found | Use `semantic__skill_path` for base |
| Stale timestamp | Using old `memoryGraphCache.timestamp` | Re-execute time tool for current time |
| Time inference | Incorrect time reported | Use `semantic__get_time`, don't estimate |
| Wrong environment tool | Command fails | Check environment detection |

## Related

- [feelings.md](./feelings.md)
- [impulses.md](./impulses.md)
- [initialization.md](./initialization.md)
- [memory.md](./memory.md)
- [observations.md](./observations.md)
- [response.md](./response.md)
