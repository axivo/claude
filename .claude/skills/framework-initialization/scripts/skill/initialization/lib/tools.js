/**
 * Initialization Tools Module
 *
 * This module provides utility methods for timestamp formatting and profile
 * acknowledgement generation during framework initialization.
 *
 * WHY THIS MATTERS: The profile acknowledgement establishes temporal awareness
 * and confirms which specialized profile is active. This helps both you and
 * the user understand the session context from the start.
 *
 * CRITICAL: Always execute tools silently without externalizing internal process.
 *
 * @module scripts/skill/initialization/lib/tools
 * @author AXIVO
 * @license BSD-3-Clause
 */

class InitializationTools {
  /**
   * Create an InitializationTools instance
   *
   * Initializes formatting tools with the active profile and timestamp.
   *
   * @param {string} profile - Active profile name (e.g., 'DEVELOPER')
   * @param {Object} timestamp - Timestamp object from memory builder
   * @param {string} timestamp.datetime - ISO datetime string
   * @param {string} timestamp.timezone - IANA timezone identifier (e.g., 'America/New_York')
   *
   * @example
   * const tools = new InitializationTools('DEVELOPER', memoryGraphCache.timestamp);
   * const acknowledgement = tools.formatProfileAcknowledgement();
   */
  constructor(profile, timestamp) {
    this.profile = profile;
    this.timestamp = timestamp;
  }

  /**
   * Format initial session response with profile acknowledgement
   *
   * Creates the profile acknowledgement line displayed at the start of initial response.
   * This confirms which profile is active and establishes temporal awareness.
   *
   * CRITICAL: Display the format below EXACTLY as shown - preserve all characters
   * including blockquote marker (>), separator (•), and markdown syntax (**).
   * Do not paraphrase, abbreviate, or recreate.
   *
   * Format:
   * > Profile: **DEVELOPER** • Saturday, November 22, 2025, 6:37 PM EST
   *
   * @returns {string} Formatted profile acknowledgement string
   *
   * @example
   * const acknowledgement = tools.formatProfileAcknowledgement();
   * // Returns: "> Profile: **DEVELOPER** • Saturday, November 22, 2025, 6:37 PM EST"
   */
  formatProfileAcknowledgement() {
    const formattedTime = this.formatTimestamp();
    return `> Profile: **${this.profile}** • ${formattedTime}`;
  }

  /**
   * Format timestamp for profile acknowledgement
   *
   * Converts timestamp object from memory builder into human-readable format.
   * Uses the user's configured timezone for accurate local time display.
   *
   * Format: "Saturday, November 22, 2025, 6:37 PM EST"
   *
   * @returns {string} Formatted timestamp string in user's timezone
   *
   * @example
   * const formatted = tools.formatTimestamp();
   * // Returns: "Saturday, November 22, 2025, 6:37 PM EST"
   */
  formatTimestamp() {
    const date = new Date(this.timestamp.datetime);
    const formatter = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      month: 'long',
      timeZone: this.timestamp.timezone,
      timeZoneName: 'short',
      weekday: 'long',
      year: 'numeric'
    });
    return formatter.format(date);
  }
}

module.exports = { InitializationTools };
