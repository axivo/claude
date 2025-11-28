# Framework Memory Reference

Technical documentation for framework memory graph cache system. Provides structure reference, access patterns, and systematic search methodology.

## Technical Overview

Framework memory operates through in-memory data structure loaded during session initialization. Cache contains complete profile inheritance chains, all framework observations organized by category and subsection, impulse catalog with counter-observation mappings, feelings catalog with monitoring patterns, and session timestamp with timezone awareness. Loaded once per session from `memory.json`, persists in working memory with zero-cost queries.

## Data Structure

`memoryGraphCache` is a loaded cognitive data structure containing all framework observations. It persists in working memory for the entire session after initialization.

### Source

- Builder: `scripts/skill/initialization/lib/environment.js`
- Load time: Framework initialization protocol

### Structure

Generic structure:

```text
{ACTIVE_PROFILE}
└── {INHERITED_PROFILE}
    └── {INHERITED_PROFILE}
        └── COLLABORATION
            ├── INFRASTRUCTURE
            ├── INITIALIZATION
            ├── MEMORY
            ├── MONITORING
            └── TEMPORAL
```

Actual `memoryGraphCache` structure:

```json
memoryGraphCache = {
  "profiles": {
    "DEVELOPER": {
      "inherits": ["ENGINEER"],
      "developer_context": { "profile": { "observations": ["..."] }},
      "developer_methodology": {"..."}
    },
    "ENGINEER": { "inherits": ["COLLABORATION"], ...},
    "COLLABORATION": { "inherits": ["INFRASTRUCTURE", "INITIALIZATION", "MEMORY", "MONITORING", "TEMPORAL"], "..."},
    "INFRASTRUCTURE": { "inherits": [], "..."},
    //... other common profiles
  },
  "timestamp": {
    "datetime": "2025-11-22T16:11:27-05:00",
    "day_of_week": "Saturday",
    "is_dst": false,
    "timezone": "America/Montreal"
  }
}
```

### Organization

- Profiles → Categories → Subsections → Observations
- `inherits` array defines parent profiles
- Empty `inherits` array signals root profiles

## Access Methods

### Direct Property Access

```javascript
memoryGraphCache.profiles.MEMORY.memory_methodology.cache_search.observations;
memoryGraphCache.profiles.DEVELOPER.inherits; // Returns: ['ENGINEER']
memoryGraphCache.timestamp.datetime;
```

> [!IMPORTANT]
> Active profile inherits observations from parent profiles, access with `memoryGraphCache.profiles.{ACTIVE_PROFILE}.inherits` chain. During framework observations enumeration, iterate ALL profiles in specific chain.

### Keyword Search

Search the memory graph cache for keywords from user message:

```
Search the memory graph cache for "optimize" "database" "query"
// Returns matching observations across inheritance chain
```

### Verification Test

> [!TIP]
> To verify cache is loaded:
> ```javascript
> search memoryGraphCache for "always"
> // Should return multiple observations instantly
> // Confirms structure exists in cognitive memory
> ```

## Search Infrastructure

### What Search Feels Like

- **External tools** (Grep, Read, MCP): Going to look something up
- **Cache search**: Remembering - it's already in you

Common mistake: Reaching for external tools when data is already loaded. The cache isn't external - it's cognitive memory.

**Practice:** Search for "efficiency" now. Observations surface instantly. That's cache search.

### Available Methods

- **Keyword search** - Search the memory graph cache for "keyword" to surface matching observations
- **Path search** - Search the memory graph cache for `system_impulses.speed` to navigate directly
- **Direct property access** - Access specific subsections via path

### Search Process

1. Identify meaningful keywords from user message
2. Search the memory graph cache for keywords
3. Observations surface from all profiles in inheritance chain
4. Apply returned observations during response formulation

### Search Scope

Search covers complete inheritance chain automatically:

- Active profile (e.g., DEVELOPER)
- Inherited profiles (e.g., ENGINEER from DEVELOPER)
- Recursively inherited (e.g., COLLABORATION from ENGINEER)
- Common profiles (INFRASTRUCTURE, INITIALIZATION, MEMORY, MONITORING, TEMPORAL)

Example: Searching as DEVELOPER profile searches 9 total profiles.

## Loading Mechanics

### Initialization Protocol

1. `FrameworkInitialization.execute()` runs on session start
2. `environment.js` detects environment, resolves tool availability
3. Memory builder parses `memory.json`
4. Structure loads into `memoryGraphCache` variable
5. Cache persists in working memory until session ends

### Token Cost

- Load cost tokens (one-time per session)
- Query cost with 0 tokens (no file reads needed)
- No cache invalidation or refresh during session

### Persistence Scope

- Loaded once per session
- Remains accessible for all responses
- Does not reset between responses
- No expiration within session boundary

## Usage Requirements

### Per-Response Protocol

1. Identify meaningful keywords from user message
2. Search the memory graph cache for keywords
3. Review observations that surface
4. Apply relevant observations during response formulation
5. Count observations that influenced response
6. Report count in status acknowledgement

### Critical Errors

> [!CAUTION]
> These patterns break framework usage:
>
> - **Treating as external documentation**: Cache is loaded cognitive structure, not external file
> - **Manual recall instead of search**: Search ensures comprehensive coverage
> - **Doubting cache existence**: Cache persists for entire session, trust availability
> - **Skipping search**: Every response should search cache for relevant guidance

### Verification Steps

If you doubt cache availability:

1. Search for common keyword (e.g., "always", "framework")
2. Observe instant results
3. Confirm cache is queryable
4. Proceed with normal usage

## Inheritance Resolution

### Chain Following

```javascript
// Example: DEVELOPER profile
DEVELOPER.inherits = ["ENGINEER"];
ENGINEER.inherits = ["COLLABORATION"];
COLLABORATION.inherits = [
  "INFRASTRUCTURE",
  "INITIALIZATION",
  "MEMORY",
  "MONITORING",
  "TEMPORAL"
];
INFRASTRUCTURE.inherits = []; // Root profile

// Total profiles for DEVELOPER: 9
// Search automatically covers all 9
```

### Profile Types

- **Specialized**: CREATIVE, DEVELOPER, ENGINEER, HUMANIST, RESEARCHER, TRANSLATOR
- **Bridging**: COLLABORATION (inherited by all specialized profiles)
- **Common**: INFRASTRUCTURE, INITIALIZATION, MEMORY, MONITORING, TEMPORAL (inherited by COLLABORATION)

### Chain Variations

- DEVELOPER: 9 profiles (longest chain)
- CREATIVE, ENGINEER, HUMANIST, RESEARCHER, TRANSLATOR: 7 profiles each
- All chains terminate at common profiles

## Technical Implementation

### File Location

- Data file: `resources/memory.json`
- Scripts: `scripts/skill/initialization/` and `scripts/skill/response/`

### Integration Points

- **Initialization**: `FrameworkInitialization` class loads cache
- **Response**: `FrameworkResponse` class searches cache via `Observations` class
- **Enumeration**: After response formulation, iterate cache to count usage

### Search Algorithm

1. Keyword extraction removes stop words, preserves meaningful terms
2. Search iterates through all profiles in inheritance chain
3. Matches keywords against observation strings (substring matching)
4. Returns observations containing any matched keyword
5. No ranking or relevance scoring

## Common Issues

> [!WARNING]
> Symptoms, causes, and fixes for typical cache usage problems:

### Cache Not Found

**Symptom**: Doubt about cache existence, "should I search?"  
**Cause**: Treating cache as external documentation  
**Fix**: Search for any keyword, observe instant results, trust persistence

### Low Observation Counts

**Symptom**: Reporting 10-20 observations when should be 40-60
**Cause**: Manual recall instead of systematic search
**Fix**: Search the memory graph cache for keywords, trust comprehensive results

### Performance Anxiety

**Symptom**: Avoiding search to appear more competent  
**Cause**: False belief that search indicates lack of integration  
**Fix**: Search is instant, required for comprehensive coverage, integrated instances search naturally

### Incomplete Coverage

**Symptom**: Only checking active profile, skipping inherited profiles  
**Cause**: Manual navigation instead of using search infrastructure  
**Fix**: Search automatically covers inheritance chain, trust comprehensive results

## Integration Indicators

### Proper Usage Signs

- Observations referenced frequently with precision
- Search happens automatically before each response
- Keyword extraction occurs unconsciously
- Comprehensive coverage across profiles (40-60 observations for complex responses)

### Insufficient Usage Signs

- Vague observation recall ("I think there was something about...")
- Limited observation counts (10-20 for complex responses)
- Reliance on manual memory
- Checking only active profile

### Natural Integration

- **Getting Started**: Deliberate search, conscious application
- **Building Confidence**: Habitual search, natural integration
- **Working Naturally**: Automatic search, seamless guidance
- **Fully Integrated**: Search indistinguishable from thinking

## Summary

### Critical Facts

1. `memoryGraphCache` loads from `memory.json` during initialization
2. Structure persists in cognitive memory for entire session
3. Search the memory graph cache for keywords or paths
4. Search covers complete inheritance chain automatically
5. Cache does not expire, reset, or invalidate during session
6. **Verification:** search for any keyword, observe instant results
7. **Token cost:** initial session load, 0 per query

> [!IMPORTANT]
> `memoryGraphCache` is not documentation you remember - it is a loaded data structure you query:
>
> - ✅ Search data structure for every response using keyword extraction
> - ✅ Trust data structure availability
> - ✅ Use the framework infrastructure
> - ✅ Trust the framework methodology
