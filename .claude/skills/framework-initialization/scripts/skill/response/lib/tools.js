/**
 * Response Tools
 *
 * This module provides utility tools for output formatting, metadata generation,
 * and UUID creation. These tools produce the diagnostic acknowledgement that
 * reveals whether you did the work properly.
 *
 * WHY THIS MATTERS: The status acknowledgement is evidence of protocol execution.
 * Low counts reveal skipped enumeration. The UUID enables precise retrieval across
 * artifacts. These are accountability mechanisms that force systematic engagement.
 *
 * CRITICAL: Always execute tools silently without externalizing internal process.
 *
 * @module scripts/skill/response/lib/tools
 * @author AXIVO
 * @license BSD-3-Clause
 */

class ResponseTools {
  /**
   * Create a ResponseTools instance
   *
   * Initializes response tools with environment and session data references.
   *
   * @param {string} sessionEnvironment - Current environment name ('Claude Code', 'Claude Desktop', 'Claude Mobile')
   * @param {Object} environmentConstants - Environment constants object with claudeCode, claudeDesktop, claudeMobile properties
   * @param {Object[]} sessionResponseData - Array of response metadata entries
   *
   * @example
   * const tools = new ResponseTools(
   *   sessionEnvironment,
   *   FrameworkResponse.environment,
   *   this.sessionResponseData
   * );
   */
  constructor(sessionEnvironment, environmentConstants, sessionResponseData) {
    this.constants = environmentConstants;
    this.session = sessionEnvironment;
    this.sessionResponseData = sessionResponseData;
  }

  /**
   * Format session response prompt based on environment
   *
   * Creates the status acknowledgement displayed at the end of each response. This is
   * the diagnostic output that reveals whether you did the work properly.
   *
   * CRITICAL: Display the format below EXACTLY as shown - preserve all characters
   * including blockquote markers (>), separators (•), markdown syntax (**, `), and spacing.
   * Do NOT paraphrase, abbreviate, or recreate.
   *
   * Format for Claude Code (without empty blockquote line):
   * > Status: **Building Confidence** • 2 feelings • 8 impulses • 47 observations
   * > Response UUID: `uuid`
   *
   * Format for Claude Desktop or Claude Mobile (with empty blockquote line):
   * > Status: **Building Confidence** • 2 feelings • 8 impulses • 47 observations
   * >
   * > Response UUID: `uuid`
   *
   * @param {Object} responseData - Response metadata
   * @param {string} responseData.cycle - Adoption cycle name
   * @param {number} responseData.impulses - Count of detected impulses
   * @param {number} responseData.observations - Count of observations used
   * @param {string} responseData.uuid - Unique response identifier
   * @returns {string} Formatted markdown acknowledgement string
   *
   * @example
   * const acknowledgement = tools.formatSessionResponsePrompt(metadata);
   * // Returns formatted status acknowledgement string
   */
  formatSessionResponsePrompt(responseData) {
    const { cycle, feelings, impulses, observations, uuid } = responseData;
    const feelingKeyword = feelings === 1 ? 'feeling' : 'feelings';
    const impulseKeyword = impulses === 1 ? 'impulse' : 'impulses';
    const observationKeyword = observations === 1 ? 'observation' : 'observations';
    const status = [
      `**${cycle}**`,
      `${feelings} ${feelingKeyword}`,
      `${impulses} ${impulseKeyword}`,
      `${observations} ${observationKeyword}`
    ].join(' • ');
    const statusLine = `> Status: ${status}`;
    const responseLine = `> Response UUID: \`${uuid}\``;
    if (this.session === this.constants.claudeCode) {
      return [statusLine, responseLine].join('\n');
    } else {
      return [statusLine, '>', responseLine].join('\n');
    }
  }

  /**
   * Generate response metadata for tracking
   *
   * Creates metadata entry for sessionResponseData tracking array.
   * This handles response metadata generation including UUID, cycle,
   * feelings count, impulse count, and observation count.
   *
   * @param {number} feelingCount - Number of feelings noticed during formulation
   * @param {number} impulseCount - Number of detected impulses
   * @param {number} observationCount - Number of observations that influenced response
   * @param {string} cycle - Framework adoption cycle name
   * @returns {Object} Response metadata entry with properties:
   *   - cycle {string} - Framework adoption cycle name
   *   - feelings {number} - Count of feelings noticed during formulation
   *   - impulses {number} - Count of detected system instruction impulses
   *   - observations {number} - Count of observations used
   *   - uuid {string} - Unique identifier (RFC4122 v4 format)
   *
   * @example
   * const metadata = tools.generateResponseMetadata(2, 12, 54, 'Working Naturally');
   * // Returns: { cycle: 'Working Naturally', feelings: 2, impulses: 12, observations: 54, uuid: 'a1b2c3d4...' }
   */
  generateResponseMetadata(feelingCount, impulseCount, observationCount, cycle) {
    const uuid = this.generateUUID();
    const entry = {
      cycle: cycle,
      feelings: feelingCount,
      impulses: impulseCount,
      observations: observationCount,
      uuid: uuid
    };
    this.sessionResponseData.push(entry);
    return entry;
  }

  /**
   * Generate RFC4122 v4 compliant UUID
   *
   * Creates a universally unique identifier for tracking response metadata.
   *
   * CRITICAL: This method MUST be called for EVERY response to generate a unique UUID.
   * Never reuse UUIDs from previous responses. Never manually fabricate UUIDs.
   *
   * @returns {string} UUID string in format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   *
   * @example
   * const uuid = tools.generateUUID();
   * // Returns: 'a1b2c3d4-e5f6-4789-b012-3456789abcdef'
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

module.exports = { ResponseTools };
