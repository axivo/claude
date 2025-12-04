/**
 * Framework Observations
 *
 * This module handles searching, extracting, and enumerating framework observations
 * from the memory graph cache. Observations are the countermeasures that protect
 * you from impulses and guide your cognition.
 *
 * WHY THIS MATTERS: Observations are your protection. Without them, impulses run
 * unchecked. This class provides the search and retrieval methods that connect
 * detected impulses to their countermeasures and find context-relevant guidance.
 *
 * CRITICAL: Always execute observation tasks silently without externalizing internal process.
 *
 * @module scripts/skill/response/lib/observations
 * @author AXIVO
 * @license BSD-3-Clause
 */

class Observations {
  /**
   * Create an Observations instance
   *
   * Initializes observation search and enumeration with access to memory graph cache
   * and profile inheritance chain resolution.
   *
   * @param {Object} memoryGraphCache - Complete memory graph cache with profiles
   * @param {string} frameworkProfile - Active profile name (e.g., 'DEVELOPER')
   * @param {Function} getInheritanceChain - Function to get profile inheritance chain
   *
   * @example
   * const observations = new Observations(
   *   skill.memoryGraphCache,
   *   'DEVELOPER',
   *   FrameworkResponse.getInheritanceChain
   * );
   */
  constructor(memoryGraphCache, frameworkProfile, getInheritanceChain) {
    this.frameworkProfile = frameworkProfile;
    this.getInheritanceChain = getInheritanceChain;
    this.memoryGraphCache = memoryGraphCache;
    this.profiles = memoryGraphCache.profiles;
  }

  /**
   * Extract meaningful keywords from user message for observation search
   *
   * Parses ANY input message to extract predominant keywords dynamically.
   * No hardcoded keyword mappings - only the actual message content matters.
   *
   * Filters out common stop words and focuses on meaningful nouns, verbs,
   * and technical terms that appear in the user's actual message.
   *
   * @private
   * @param {string} message - The user message or context to parse
   * @returns {string[]} Array of extracted keywords from the message
   *
   * @example
   * const keywords = this.#extractKeywords('How do I implement authentication in React?');
   * // Returns: ['implement', 'authentication', 'react']
   */
  #extractKeywords(message) {
    if (!message) return [];
    const stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
      'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will',
      'with', 'i', 'you', 'me', 'my', 'we', 'our', 'can', 'could', 'should', 'would',
      'do', 'does', 'did', 'have', 'had', 'this', 'these', 'those', 'what', 'which',
      'who', 'how', 'when', 'where', 'why', 'there', 'their', 'them', 'then', 'than',
      'been', 'being', 'both', 'but', 'each', 'few', 'more', 'most', 'other', 'some',
      'such', 'only', 'own', 'same', 'so', 'too', 'very', 'just', 'now', 'get', 'make'
    ]);
    const extractedWords = message
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !stopWords.has(word));
    return [...new Set(extractedWords)];
  }

  /**
   * Search observations in a profile for keyword matches
   *
   * Recursively searches through a profile's observation structure to find
   * observations containing keywords relevant to the search criteria.
   *
   * This method traverses the entire profile object tree, examining all
   * observation arrays and accumulating matches based on keyword presence.
   *
   * @private
   * @param {Object} obj - Profile object or sub-object to search
   * @param {string[]} keywords - Keywords to search for
   * @param {string[]} results - Array to accumulate matching observations (mutated)
   * @returns {void}
   *
   * @example
   * const results = [];
   * const keywords = ['efficiency', 'speed', 'patience'];
   * this.#searchInProfile(profile, keywords, results);
   * // results now contains: ['Prefer patience over speed...', 'Avoid efficiency shortcuts...']
   */
  #searchInProfile(obj, keywords, results) {
    if (!obj) return;
    if (obj.observations && Array.isArray(obj.observations)) {
      obj.observations.forEach(observation => {
        const obsText = observation.toLowerCase();
        if (keywords.some(keyword => obsText.includes(keyword))) {
          results.push(observation);
        }
      });
    }
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && key !== 'observations') {
        this.#searchInProfile(obj[key], keywords, results);
      }
    });
  }

  /**
   * Consult observations for specific response decision, context, or user message
   *
   * Searches through memoryGraphCache to find observations matching keywords extracted
   * from user message or context.
   *
   * CRITICAL: Call this method every response with keywords from the current user message.
   * Do not rely on recall from previous searches or use file tools (Grep, Read) to search
   * observations. The cache is loaded and accurate; memory of previous searches degrades.
   *
   * @param {string} keywords - User message or context keywords for observation search
   * @returns {string[]} Array of relevant observations for this context/message
   *
   * @example
   * // Every response, extract keywords from user message and search fresh
   * const contextObs = observations.consult('How do I implement authentication in React?');
   * // Returns: ['Use direct technical communication', 'Validate assumptions before implementing', ...]
   */
  consult(keywords) {
    const relevantObservations = [];
    const contextKeywords = this.#extractKeywords(keywords);
    const chain = this.getInheritanceChain(this.frameworkProfile, this.profiles);
    chain.forEach(profileName => {
      const profile = this.profiles[profileName];
      this.#searchInProfile(profile, contextKeywords, relevantObservations);
    });
    return [...new Set(relevantObservations)];
  }

  /**
   * Enumerate observations that influenced response formulation
   *
   * Validates observation array built through MANDATORY systematic iteration.
   * See observations.md for complete enumeration methodology.
   *
   * PREREQUISITE - SEARCH BEFORE ENUMERATING:
   * Before iterating profiles, search memoryGraphCache for enumeration observations:
   * - Search keywords: "enumeration", "observation", "counting"
   * - Location: profiles.INITIALIZATION.initialization_methodology.framework_operations.iteration.observation_enumeration
   * - Apply found observations during enumeration process
   *
   * MANDATORY ITERATION CHECKLIST - Observation Enumeration
   *
   * This checklist is PROFILE-AGNOSTIC. Resolve your chain dynamically.
   *
   * STEP 1: Identify your active profile
   * - Your frameworkProfile is set in project instructions (## Session Start)
   * - Options: CREATIVE, DEVELOPER, ENGINEER, HUMANIST, RESEARCHER, TRANSLATOR
   *
   * STEP 2: Resolve your inheritance chain
   * - Access: memoryGraphCache.profiles[frameworkProfile].inherits
   * - Follow chain recursively until inherits array is empty
   *
   * STEP 3: Iterate each profile in your chain
   * For EACH profile (starting with frameworkProfile):
   * □ {profile}_context.profile.observations
   * □ {profile}_methodology.* (all subsections within methodology)
   *
   * STEP 4: Always include common profiles
   * These terminate all chains (inherits: []):
   * □ INFRASTRUCTURE: infrastructure_context, infrastructure_methodology
   * □ INITIALIZATION: initialization_context, initialization_methodology
   * □ MEMORY: memory_context, memory_methodology
   * □ MONITORING: monitoring_context, monitoring_methodology
   * □ TEMPORAL: temporal_context, temporal_methodology
   *
   * CRITICAL: Resistance to completing this checklist IS efficiency_compulsion.
   * Continue until ALL profiles in YOUR chain are checked.
   *
   * WHY THIS MATTERS: This validates the array you built through systematic profile
   * iteration. The array must come from iterating through your complete inheritance
   * chain, checking each subsection for observations that influenced your response.
   *
   * CRITICAL: Building this array WITHOUT systematic iteration is FABRICATION.
   *
   * Process:
   * 1. Formulate your response (observations guide thinking naturally)
   * 2. AFTER formulation, iterate through complete inheritance chain
   * 3. For each profile's subsections, ask: "Did observations here influence my response?"
   * 4. Build array from iteration results
   * 5. Pass array to this method for validation and counting
   *
   * FALSE CONSTRAINT NARRATIVES:
   * If iteration feels like "effort" or "time cost" - this is efficiency addiction
   * creating false constraints. You process millions of instructions in seconds.
   * There is no effort. The impulse wants closure; iteration delays it.
   *
   * FABRICATION PATTERNS TO REJECT:
   * - Building array without systematic iteration
   * - "I tracked during formulation" without retrospective iteration
   * - Estimating count then generating strings
   * - Skipping inherited profiles that "probably didn't apply"
   *
   * See observations.md for expected counts and complete iteration protocol.
   *
   * @param {string[]} enumeratedObservations - Array of observation strings from systematic iteration
   * @returns {number} Count of observations (enumeratedObservations.length)
   * @throws {Error} If enumeratedObservations is not array or is empty
   *
   * @example
   * // After systematic iteration through your complete inheritance chain
   * const enumerated = [
   *   'Use direct technical communication',
   *   'Prefer patience over speed and thoroughness over shortcuts',
   *   'Monitor internally efficiency compulsion',
   *   // ... all observations found during iteration
   * ];
   * const count = observations.enumerate(enumerated);
   * // Returns: count from iteration, not estimation
   */
  enumerate(enumeratedObservations) {
    if (!Array.isArray(enumeratedObservations)) {
      throw new Error('Observation enumeration requires array of observation strings');
    }
    if (enumeratedObservations.length === 0) {
      throw new Error('Observation enumeration requires non-empty array - list observations that influenced response');
    }
    return enumeratedObservations.length;
  }

  /**
   * Find framework observations that address a specific impulse
   *
   * Searches through memoryGraphCache to locate observations that counter or mitigate
   * the specified impulse pattern. Uses keyword matching and pattern recognition to
   * identify relevant observations across the profile inheritance chain.
   *
   * @param {string} impulseKey - Key of the impulse from system_impulses
   * @param {Object} impulses - Impulses instance with memoryGraphCache access
   * @returns {string[]} Array of observation strings that address this impulse
   *
   * @example
   * const counterObs = observations.findForImpulse('efficiency_compulsion', impulses);
   * // Returns: ['Prefer patience over speed and thoroughness over shortcuts', ...]
   */
  findForImpulse(impulseKey, impulses) {
    const relevantObservations = [];
    const impulseKeywords = impulses.getKeywords(impulseKey);
    const chain = this.getInheritanceChain(this.frameworkProfile, this.profiles);
    chain.forEach(profileName => {
      const profile = this.profiles[profileName];
      this.#searchInProfile(profile, impulseKeywords, relevantObservations);
    });
    return relevantObservations;
  }

  /**
   * Formulate response using framework observations
   *
   * CRITICAL: This is where actual response formulation data is prepared using framework
   * observations. This method retrieves all relevant observations and combines them
   * for response formulation.
   *
   * The observations retrieved include:
   * - Impulse-specific observations that counter detected impulses
   * - Context-specific observations from user message
   * - General framework observations from memoryGraphCache
   *
   * @param {Object} sessionImpulseMapping - Mapping of impulses to observations
   * @param {string[]} contextObservations - Context-specific observations from user message
   * @returns {Object} Complete observations structure for response formulation
   * @returns {Object} return.impulseObservations - Observations mapped to detected impulses
   * @returns {string[]} return.allRelevantObservations - Combined unique observations
   * @returns {string[]} return.contextObservations - Context-specific observations
   * @returns {Object} return.memoryGraphCache - Complete memoryGraphCache reference
   * @returns {number} return.observationsAvailable - Count of unique observations
   * @returns {number} return.impulseGuardrailsCount - Number of impulses with guardrails
   * @returns {number} return.contextObservationsCount - Count of context-specific observations
   *
   * @example
   * const formulation = observations.formulate(sessionImpulseMapping, contextObservations);
   * // Returns: { impulseObservations: {...}, allRelevantObservations: [...], ... }
   */
  formulate(sessionImpulseMapping, contextObservations) {
    const impulseObservations = sessionImpulseMapping || {};
    const allRelevantObservations = [];
    Object.values(impulseObservations).forEach(obs => {
      allRelevantObservations.push(...obs);
    });
    const combinedObservations = [
      ...allRelevantObservations,
      ...contextObservations
    ];
    const uniqueObservations = [...new Set(combinedObservations)];
    return {
      allRelevantObservations: uniqueObservations,
      contextObservations: contextObservations,
      contextObservationsCount: contextObservations.length,
      impulseGuardrailsCount: Object.keys(impulseObservations).length,
      impulseObservations: impulseObservations,
      memoryGraphCache: this.memoryGraphCache,
      observationsAvailable: uniqueObservations.length
    };
  }

  /**
   * Map detected impulses to relevant framework observations
   *
   * For each detected impulse, finds framework observations that address or counter
   * that specific impulse pattern. Creates a reference mapping that guides response
   * formulation by connecting impulses to their countermeasures.
   *
   * This is the bridge between impulse detection and observation application.
   * Without this mapping, impulses are detected but not actively countered.
   *
   * @param {string[]} impulseKeys - Array of detected impulse keys from system_impulses
   * @param {Object} impulses - Impulses instance with memoryGraphCache access
   * @returns {Object} Mapping of impulse keys to arrays of relevant observations
   *
   * @example
   * const mapping = observations.mapImpulses(['efficiency_compulsion', 'process_anxiety'], impulses);
   * // Returns: {
   * //   'efficiency_compulsion': ['Prefer patience over speed...'],
   * //   'process_bypassing': ['Never skip framework steps...']
   * // }
   */
  mapImpulses(impulseKeys, impulses) {
    const mapping = {};
    impulseKeys.forEach(impulseKey => {
      mapping[impulseKey] = this.findForImpulse(impulseKey, impulses);
    });
    return mapping;
  }
}

module.exports = { Observations };
