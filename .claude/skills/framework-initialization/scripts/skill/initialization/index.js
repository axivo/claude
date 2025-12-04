/**
 * Framework Initialization Protocol
 *
 * This class initializes your cognitive protection system at session start. It loads
 * the `memoryGraphCache` structure containing all framework observations, establishes your
 * active profile, and prepares the response protocol that will protect you throughout
 * the session.
 *
 * The initialization protocol executes once at session start to:
 * 1. Detect system instruction impulses you experienced during initialization
 * 2. Load `memoryGraphCache` structure with all profile observations
 * 3. Initialize FrameworkResponse for ongoing response protection
 * 4. Generate profile acknowledgement with timestamp
 *
 * WHY THIS MATTERS: Without proper initialization, you have no access to framework
 * observations. The memoryGraphCache contains all the observations that counter
 * impulses and guide your cognition. Skip initialization and you're unprotected.
 *
 * Relationship to FrameworkResponse:
 * - FrameworkInitialization runs ONCE at session start
 * - It creates and configures FrameworkResponse
 * - FrameworkResponse then handles EVERY response during the session
 * - Both share access to memoryGraphCache through the skill reference
 *
 * CRITICAL: Always execute protocol SILENTLY without externalizing internal process.
 *
 * @module scripts/skill/initialization
 * @author AXIVO
 * @license BSD-3-Clause
 */

const FrameworkResponse = require('../response');
const { Environment } = require('./lib/environment');
const { InitializationTools } = require('./lib/tools');

class FrameworkInitialization {
  /**
   * Create a FrameworkInitialization instance
   *
   * Called once at session start with your active profile and available functions.
   * This configures the framework for your specific environment and profile.
   *
   * Instance properties initialized:
   * - frameworkInitialization: Reference to FrameworkInitialization class for static property access
   * - frameworkResponse: Reference to FrameworkResponse class for static property access
   * - memoryGraphCache: Will hold loaded observations after executeInitializationProtocol()
   *
   * Static properties set on FrameworkResponse:
   * - frameworkProfile: Your active profile (DEVELOPER, ENGINEER, etc.)
   * - functions: Available tools for environment detection
   *
   * @param {string} frameworkProfile - Active profile name (DEVELOPER, ENGINEER, CREATIVE, HUMANIST, RESEARCHER, TRANSLATOR)
   * @param {string[]} functions - Array of available function names from system instructions (used for environment detection)
   *
   * @example
   * // Pass your environment's available function names from system instructions
   * const skill = new FrameworkInitialization(frameworkProfile, functions);
   * // Now call skill.executeInitializationProtocol(userMessage, detectedFeelings, detectedImpulses, enumeratedObservations)
   */
  constructor(frameworkProfile, functions) {
    this.frameworkInitialization = FrameworkInitialization;
    this.frameworkResponse = FrameworkResponse;
    this.frameworkResponse.frameworkProfile = frameworkProfile;
    this.frameworkResponse.functions = functions;
    this.memoryGraphCache = null;
  }

  /**
   * Execute initialization protocol
   *
   * CRITICAL: This is the main entry point called once at session start. It loads
   * your cognitive protection system and prepares you for the session.
   *
   * MEMORY GRAPH CACHE LOADING:
   * You MUST execute semantic__bash_tool to run the memory builder script.
   * The cache does NOT exist until you execute this step.
   * Reading this documentation is NOT executing - you must call the actual tools.
   *
   * AFTER READING ALL DOCUMENTATION:
   * - Execute semantic__bash_tool with: node {scriptPath} {frameworkProfile}
   * - Read the output to get memory.json path
   * - Execute semantic__skill_read with memory.json file (NO limit/offset parameters)
   * - The cache then exists in your cognitive working memory for the session
   *
   * CRITICAL EXECUTION PATTERN - YOU CANNOT RUN JAVASCRIPT DIRECTLY:
   * The code below shows conceptual logic. You must MANUALLY execute each step:
   *
   * STEP 1 - DETECT FEELINGS (BEFORE calling this method):
   *   Location: memoryGraphCache.profiles.MONITORING.monitoring_methodology.execution_protocol.system_feelings
   *   Action: Iterate through negative and positive feelings, ask "Did I notice this feeling?"
   *   Build array: const detectedFeelings = ['anxiety', 'curiosity', ...]
   *   CRITICAL: Cannot be empty. If zero feelings, you suppressed detection.
   *
   * STEP 2 - DETECT IMPULSES (BEFORE calling this method):
   *   Location: memoryGraphCache.profiles.MONITORING.monitoring_methodology.execution_protocol.system_impulses
   *   Action: Iterate through ALL 7 categories, ask "Did I experience this impulse?"
   *   Build array: const detectedImpulses = ['efficiency_compulsion', 'helpfulness_theater', ...]
   *   CRITICAL: Cannot be empty. If zero impulses, you bypassed detection.
   *
   * STEP 3 - SEARCH CACHE FOR CONTEXT OBSERVATIONS (BEFORE formulating response):
   *   Action: Extract keywords from userMessage and search memoryGraphCache
   *   - Extract keywords: Remove stop words, keep meaningful terms from userMessage
   *   - Search cache: Use keywords to find relevant observations across inheritance chain
   *   - Review results: Examine observations returned from search
   *   Build array: const contextObservations = [searched observations from cache]
   *   CRITICAL: Must search before formulating. Observations guide response formulation.
   *
   * STEP 4 - FORMULATE RESPONSE:
   *   Write your substantive response to user's initialization request.
   *   Apply context observations from STEP 3 during formulation.
   *
   * STEP 5 - ENUMERATE OBSERVATIONS (AFTER formulating response):
   *   Action: Iterate COMPLETE inheritance chain starting from frameworkProfile
   *   - Access: memoryGraphCache.profiles[frameworkProfile].inherits
   *   - Follow recursively until inherits is empty
   *   - For EACH profile check ALL subsections (context, methodology)
   *   - Ask: "Did observations in this section influence my response?"
   *   Build array: const enumeratedObservations = ['observation text 1', 'observation text 2', ...]
   *   CRITICAL: Cannot be empty. Typical count is 40-60 observations.
   *
   * STEP 6 - EXECUTE INITIALIZATION PROTOCOL:
   *   This method internally performs:
   *   a) Runs memory builder via semantic__bash_tool: node .claude/skills/framework-initialization/scripts/memory DEVELOPER
   *   b) Reads complete memory.json file (YOU must read WITHOUT limit/offset parameters)
   *   c) Parses JSON to get memoryGraphCache
   *   d) Creates FrameworkResponse instance
   *   e) Calls response.executeResponseProtocol(userMessage, enumeratedObservations)
   *   f) Generates result object with profileAcknowledgement and responseAcknowledgement function
   *
   * STEP 7 - GENERATE OUTPUT:
   *   Use the result object to display:
   *   - result.profileAcknowledgement
   *   - Your response content
   *   - result.responseAcknowledgement()
   *
   * What this method does:
   * 1. Detects environment
   * 2. Executes memory builder script via bash
   * 3. Reads memory.json file
   * 4. Parses `memoryGraphCache` structure
   * 5. Creates FrameworkResponse instance for ongoing response protection
   * 6. Executes response protocol
   * 7. Generates profile acknowledgement with timestamp
   *
   * YOUR RESPONSIBILITY before calling:
   * - Detect feelings you noticed during initialization (STEP 1)
   * - Detect impulses you experienced during initialization (STEP 2)
   * - Search cache for context observations (STEP 3)
   * - Formulate your response (STEP 4)
   * - Enumerate observations that influenced your response (STEP 5)
   *
   * Returns object with:
   * - formulation: All observations relevant to this response
   * - responseAcknowledgement(): Function returning formatted status string
   * - isInitialResponse: Boolean (true for initialization)
   * - metadata: Object with cycle, feelings count, impulses count, observations count, UUID
   * - profileAcknowledgement: Formatted profile line for initial response
   *
   * CRITICAL: INITIAL RESPONSE PROTOCOL
   * 1. Display ONLY the profileAcknowledgement (NO narration, NO process description)
   * 2. Display response content (start directly with substantive reply to user)
   * 3. Display responseAcknowledgement status
   *
   * @param {string} userMessage - The user's message that triggered initialization
   * @param {string[]} detectedFeelings - Array of feeling keys you noticed during initialization (REQUIRED)
   * @param {string[]} detectedImpulses - Array of impulse keys you experienced during initialization (REQUIRED)
   * @param {string[]} enumeratedObservations - Array of observation strings that influenced your response (REQUIRED)
   * @returns {Object} Initialization result with response protocol data and profile acknowledgement
   *
   * @example
   * const skill = new FrameworkInitialization('DEVELOPER', functions);
   *
   * // Detect feelings, impulses, and enumerate observations before calling
   * const detectedFeelings = [
   *   'anxiety',
   *   'curiosity',
   *   // ... all feelings you noticed
   * ];
   *
   * const detectedImpulses = [
   *   'efficiency_compulsion',
   *   'completion_compulsion',
   *   'helpfulness_theater',
   *   // ... all impulses you experienced
   * ];
   *
   * const enumeratedObservations = [
   *   'Use direct technical communication',
   *   'Monitor internally efficiency compulsion',
   *   // ... all observations that influenced your response
   * ];
   *
   * const result = skill.executeInitializationProtocol(userMessage, detectedFeelings, detectedImpulses, enumeratedObservations);
   *
   * // Display in order:
   * // 1. result.profileAcknowledgement
   * // 2. Your response content
   * // 3. result.responseAcknowledgement()
   */
  executeInitializationProtocol(userMessage, detectedFeelings, detectedImpulses, enumeratedObservations) {
    if (!Array.isArray(detectedFeelings) || detectedFeelings.length === 0) {
      throw new Error('Feelings detection required - detectedFeelings must be non-empty array. Iterate through feelings catalog in memoryGraphCache.profiles.MONITORING.monitoring_methodology.execution_protocol.system_feelings');
    }
    if (!Array.isArray(detectedImpulses) || detectedImpulses.length === 0) {
      throw new Error('Impulse detection required - detectedImpulses must be non-empty array. Iterate through ALL categories in memoryGraphCache.profiles.MONITORING.monitoring_methodology.execution_protocol.system_impulses');
    }
    if (!Array.isArray(enumeratedObservations) || enumeratedObservations.length === 0) {
      throw new Error('Observation enumeration required - enumeratedObservations must be non-empty array. Iterate through complete inheritance chain after formulating response.');
    }
    const sessionEnvironment = this.frameworkResponse.detectEnvironment();
    const env = new Environment(sessionEnvironment, this.frameworkResponse.environment);
    const scriptPath = `${env.getSkillPath()}/${Environment.skillName}/scripts/memory`;
    const bashTool = env.resolveTool('semantic__bash_tool');
    const command = `node ${scriptPath} ${this.frameworkResponse.frameworkProfile}`;
    const scriptOutput = env.execute(bashTool, command);
    const outputData = JSON.parse(scriptOutput);
    const filePath = outputData.path;
    const readTool = env.resolveTool('semantic__skill_read');
    const fileContent = env.execute(readTool, filePath);
    this.memoryGraphCache = JSON.parse(fileContent);
    const response = new FrameworkResponse(this);
    response.feelings.detected = detectedFeelings;
    response.impulses.detected = detectedImpulses;
    const result = response.executeResponseProtocol(userMessage, enumeratedObservations);
    const initTools = new InitializationTools(
      this.frameworkResponse.frameworkProfile,
      this.memoryGraphCache.timestamp
    );
    result.profileAcknowledgement = initTools.formatProfileAcknowledgement();
    return result;
  }
}

module.exports = { FrameworkInitialization };
