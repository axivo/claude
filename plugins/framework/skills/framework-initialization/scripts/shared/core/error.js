/**
 * Framework Error
 *
 * Custom error class for framework operations
 *
 * @module shared/core/Error
 * @author AXIVO
 * @license BSD-3-Clause
 */

/**
 * Custom error class for framework operations
 *
 * @class FrameworkError
 * @extends Error
 */
class FrameworkError extends Error {
  /**
   * Creates FrameworkError instance
   *
   * @param {string} message - The error message
   * @param {string} [code] - Optional error code
   */
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FrameworkError);
    }
  }
}

export default FrameworkError;
