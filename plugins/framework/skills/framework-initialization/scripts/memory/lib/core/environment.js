/**
 * Environment Manager
 *
 * Synchronizes container environment variables with configuration settings.
 * Only operates in Claude containers for safe execution.
 *
 * @module lib/core/Environment
 * @author AXIVO
 * @license BSD-3-Clause
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

/**
 * Manages environment variable synchronization in skill containers
 *
 * @class EnvironmentManager
 */
class EnvironmentManager {
  /**
   * Path to system environment file
   *
   * @static
   * @type {string}
   */
  static environmentPath = '/etc/environment';

  /**
   * Header comment for Claude-managed section
   *
   * @static
   * @type {string}
   */
  static sectionHeader = '# Claude framework environment settings';

  /**
   * Format function for environment variable assignment
   *
   * @static
   * @param {string} name - Variable name
   * @param {*} value - Variable value
   * @returns {string} Formatted assignment line
   */
  static envFormat = (name, value) => `${name}=${value}`;

  /**
   * Create EnvironmentManager instance
   *
   * @param {Object} settings - Configuration settings object
   */
  constructor(settings) {
    this.envVars = settings.environment;
  }

  /**
   * Apply line updates and append new variables
   *
   * @private
   * @param {string[]} lines - Current file lines
   * @param {Map} lineUpdates - Map of line indices to updated content
   * @param {Array} newVars - Array of new variables to append
   * @returns {void}
   * @throws {Error} When file write fails
   */
  #applyUpdates(lines, lineUpdates, newVars) {
    for (const [index, newLine] of lineUpdates) {
      lines[index] = newLine;
    }
    if (newVars.length) {
      lines.push('', EnvironmentManager.sectionHeader);
      for (const { varName, value } of newVars) {
        lines.push(EnvironmentManager.envFormat(varName, value));
      }
    }
    writeFileSync(EnvironmentManager.environmentPath, lines.join('\n'));
  }

  /**
   * Check if running in container environment
   *
   * @private
   * @returns {boolean} True if in container
   */
  #checkCgroup() {
    try {
      const cgroup = readFileSync('/proc/self/cgroup', 'utf8');
      return cgroup.includes('container_');
    } catch {
      return false;
    }
  }

  /**
   * Find variable updates and new variables to append
   *
   * @private
   * @param {string[]} lines - Current file lines
   * @returns {Object} Object with lineUpdates Map and newVars array
   */
  #findVariableUpdates(lines) {
    const lineUpdates = new Map();
    const newVars = [];
    for (const [varName, configValue] of Object.entries(this.envVars)) {
      let found = false;
      for (let i = 0; i < lines.length; i++) {
        const currentValue = this.#parseEnvValue(lines[i], varName);
        if (currentValue !== null) {
          found = true;
          if (currentValue < configValue) {
            lineUpdates.set(i, EnvironmentManager.envFormat(varName, configValue));
          }
          break;
        }
      }
      if (!found) {
        newVars.push({ varName, value: configValue });
      }
    }
    return { lineUpdates, newVars };
  }

  /**
   * Parse environment variable value from line
   *
   * @private
   * @param {string} line - Line containing variable assignment
   * @param {string} varName - Variable name to extract
   * @returns {number|null} Parsed value or null if not found
   */
  #parseEnvValue(line, varName) {
    const regex = new RegExp(`^${varName}=(\\d+)`);
    const match = line.match(regex);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Check if running in Claude container
   *
   * @returns {boolean} True if both container and has container mount
   */
  isClaudeContainer() {
    return (existsSync('/.dockerenv') || this.#checkCgroup()) && existsSync('/mnt/skills');
  }

  /**
   * Synchronize environment variables with configuration
   *
   * Reads /etc/environment and ensures all variables from configuration
   * are present with correct values. Only executes in Claude containers.
   *
   * @returns {void}
   */
  sync() {
    if (!this.envVars || !this.isClaudeContainer() || Object.keys(this.envVars).length === 0) {
      return;
    }
    try {
      const lines = readFileSync(EnvironmentManager.environmentPath, 'utf8').split('\n');
      const { lineUpdates, newVars } = this.#findVariableUpdates(lines);
      if (lineUpdates.size || newVars.length) {
        this.#applyUpdates(lines, lineUpdates, newVars);
      }
    } catch (error) {
      console.error(`Environment sync failed: ${error.message}`);
    }
  }
}

export default EnvironmentManager;
