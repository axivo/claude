/**
 * Time Generator
 *
 * Generates timestamp information with timezone support.
 * Uses Node.js Intl API for timezone handling.
 *
 * @module lib/generators/TimeGenerator
 * @author AXIVO
 * @license BSD-3-Clause
 */

/**
 * Generates timestamp with timezone information
 *
 * Creates timestamp object matching MCP time server format.
 * Supports all IANA timezone names via Node.js Intl API.
 *
 * @class TimeGenerator
 */
class TimeGenerator {
  /**
   * Creates TimeGenerator instance
   *
   * @param {Object} config - Configuration object
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * Calculates DST status for date and timezone
   *
   * @private
   * @param {Date} date - Date to check
   * @param {string} timezone - IANA timezone name
   * @returns {boolean} True if date is in DST
   */
  #calculateDST(date, timezone) {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    const janOffset = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    }).formatToParts(jan).find(part => part.type === 'timeZoneName').value;
    const julOffset = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    }).formatToParts(jul).find(part => part.type === 'timeZoneName').value;
    const currentOffset = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    }).formatToParts(date).find(part => part.type === 'timeZoneName').value;
    const stdOffset = janOffset.length > julOffset.length ? julOffset : janOffset;
    return currentOffset !== stdOffset;
  }

  /**
   * Formats date to ISO 8601 with timezone offset
   *
   * @private
   * @param {Date} date - Date to format
   * @param {string} timezone - IANA timezone name
   * @returns {string} ISO 8601 formatted datetime with offset
   */
  #formatISO8601(date, timezone) {
    const isoString = date.toLocaleString('sv-SE', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(' ', 'T');
    const offsetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    });
    const offset = offsetFormatter.formatToParts(date)
      .find(part => part.type === 'timeZoneName')
      .value.replace('GMT', '');
    return `${isoString}${offset}`;
  }

  /**
   * Gets day of week name
   *
   * @private
   * @param {Date} date - Date to format
   * @param {string} timezone - IANA timezone name
   * @returns {string} Day of week name
   */
  #getDayOfWeek(date, timezone) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long'
    }).format(date);
  }

  /**
   * Generates timestamp with timezone information
   *
   * @param {string} [timezone] - Timezone (uses config default if not specified)
   * @returns {Object} Timestamp object with timezone, datetime, day_of_week, is_dst
   */
  generate(timezone) {
    const tz = timezone || this.config.settings.timezone || 'America/Montreal';
    const now = new Date();
    return {
      datetime: this.#formatISO8601(now, tz),
      day_of_week: this.#getDayOfWeek(now, tz),
      is_dst: this.#calculateDST(now, tz),
      timezone: tz
    };
  }
}

export default TimeGenerator;
