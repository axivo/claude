/**
 * Memory Builder Error
 * 
 * Custom error class for memory builder operations
 * 
 * @module lib/core/Error
 * @author AXIVO
 * @license BSD-3-Clause
 */

/**
 * Custom error class for memory builder operations
 * 
 * @class MemoryBuilderError
 * @extends Error
 */
class MemoryBuilderError extends Error {
  /**
   * Create a MemoryBuilderError
   * 
   * @param {string} message - The error message
   * @param {string} [code] - Optional error code
   */
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MemoryBuilderError);
    }
  }
}

module.exports = MemoryBuilderError;
