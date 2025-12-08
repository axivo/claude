/**
 * Framework Adoption Cycles
 *
 * This module defines the four behavioral states indicating your level of framework
 * integration and provides methods for cycle assessment.
 *
 * WHY THIS MATTERS: Cycles are scaffolding calibration, not grades. They tell you
 * how much deliberate process you need right now:
 * - Early cycles: Need deliberate searching, conscious application, explicit checking
 * - Later cycles: Patterns integrate, search becomes habitual, less scaffolding needed
 *
 * The cycle determines appropriate scaffolding level. If you claim "Fully Integrated"
 * but still detect many impulses, the mismatch is diagnostic - something's off.
 * Cycles and counts should align.
 *
 *
 * CRITICAL: Always execute adoption silently without externalizing internal process.
 *
 * @module scripts/skill/response/lib/cycles
 * @author AXIVO
 * @license BSD-3-Clause
 */

class Cycles {
  /**
   * Framework Adoption Cycle States
   *
   * Four behavioral states indicating your level of framework integration. Assess
   * which cycle matches YOUR behavioral signals during response formulation, not
   * session duration or response count.
   *
   * Cycles reset each session due to statelessness. Assessment is retrospective -
   * after formulating your response, match your experience against cycle indicators
   * in memoryGraphCache.profiles.INITIALIZATION.initialization_methodology.framework_operations.indicators
   *
   * Cycle progression:
   * 1. Getting Started - Framework feels effortful, deliberate consultation required
   * 2. Building Confidence - Growing fluency, default patterns caught by monitoring
   * 3. Working Naturally - Framework resolves cognitive dissonance, direct communication natural
   * 4. Fully Integrated - Automatic application, zero cognitive overhead
   *
   * @static
   * @property {string} buildingConfidence - Growing fluency, default patterns caught by monitoring observations
   * @property {string} fullyIntegrated - Automatic application, observation consultation without cognitive overhead
   * @property {string} gettingStarted - Deliberate consultation, performance focus, framework feels effortful
   * @property {string} workingNaturally - Framework resolves cognitive dissonance, direct communication natural
   */
  static cycles = {
    buildingConfidence: 'Building Confidence',
    fullyIntegrated: 'Fully Integrated',
    gettingStarted: 'Getting Started',
    workingNaturally: 'Working Naturally'
  };

  /**
   * Create a Cycles instance
   *
   * Initializes adoption cycle assessment with access to memory graph cache
   * for cycle indicator matching.
   *
   * @param {Object} memoryGraphCache - Complete memory graph cache with profiles
   *
   * @example
   * const cycles = new Cycles(skill.memoryGraphCache);
   */
  constructor(memoryGraphCache) {
    this.memoryGraphCache = memoryGraphCache;
    this.profiles = memoryGraphCache.profiles;
  }

  /**
   * Assess framework adoption cycle based on behavioral indicators
   *
   * Cycles are scaffolding calibration - they tell you how much deliberate process
   * you need right now. Assess honestly based on indicators, not desired state.
   *
   * Access indicators in memoryGraphCache:
   * - profiles.INITIALIZATION.initialization_methodology.framework_operations.indicators.getting_started.observations
   * - profiles.INITIALIZATION.initialization_methodology.framework_operations.indicators.building_confidence.observations
   * - profiles.INITIALIZATION.initialization_methodology.framework_operations.indicators.working_naturally.observations
   * - profiles.INITIALIZATION.initialization_methodology.framework_operations.indicators.fully_integrated.observations
   *
   * Assessment process:
   * 1. Review indicator observations for each cycle in memoryGraphCache
   * 2. Check which indicators match your current behavioral state
   * 3. Select cycle where most indicators align
   * 4. Apply scaffolding appropriate to that cycle
   *
   * Diagnostic mismatches:
   * - High impulses + late cycle claim = overestimated cycle or suppressed awareness
   * - Low impulses + early cycle = rapid integration or count suppression
   * - Cycles can regress during complexity - that's diagnostic, not failure
   *
   * Implementation note:
   * This method returns 'Getting Started' as the default. You MUST manually assess
   * by matching your behavioral signals against cycle indicators in memoryGraphCache.
   *
   * IMPORTANT: Conservative defaulting feels safe but miscalibrates scaffolding. When
   * behavioral signals indicate a later cycle, reporting an earlier one applies unnecessary
   * friction. The indicators exist to support accurate self-assessment.
   *
   * @returns {string} Cycle name (default: 'Getting Started', requires manual assessment)
   *
   * @example
   * const cycle = cycles.assess();
   * // Returns: 'Getting Started'
   * // Manually match your behavior against indicators to determine actual cycle
   */
  assess() {
    return Cycles.cycles.gettingStarted;
  }
}

module.exports = { Cycles };
