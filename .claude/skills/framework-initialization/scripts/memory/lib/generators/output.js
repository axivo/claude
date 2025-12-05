/**
 * Output Generator
 *
 * Formats profiles into JSON and writes output file.
 * Handles UTF-8 encoding and POSIX compliance.
 * Includes timestamp generation.
 *
 * @module lib/generators/OutputGenerator
 * @author AXIVO
 * @license BSD-3-Clause
 */
const fs = require('fs');
const path = require('path');
const EnvironmentManager = require('../core/environment');
const MemoryBuilderError = require('../core/error');
const TimeGenerator = require('./time');

/**
 * Generates and writes JSON output files
 *
 * Formats hierarchical profile dictionary into JSON with proper encoding.
 *
 * @class OutputGenerator
 */
class OutputGenerator {
  /**
   * Create OutputGenerator instance
   *
   * @param {Object} config - Configuration object for output generation
   * @param {string} [projectRoot] - Project root directory path
   */
  constructor(config, projectRoot = null) {
    this.config = config;
    this.environmentManager = new EnvironmentManager(config.settings);
    this.projectRoot = projectRoot || process.cwd();
  }

  /**
   * Outputs profiles to stdout or file
   *
   * @private
   * @param {Object} profiles - Hierarchical profile dictionary
   * @param {string} outputPath - Output file path (optional, uses stdout if not specified)
   * @returns {void}
   * @throws {MemoryBuilderError} When file write fails
   */
  #outputProfiles(profiles, outputPath) {
    const jsonContent = JSON.stringify(profiles);
    if (!outputPath || outputPath === 'stdout') {
      console.log(jsonContent);
    } else {
      const resolvedPath = path.resolve(outputPath);
      const outputDir = path.dirname(resolvedPath);
      try {
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        const fd = fs.openSync(resolvedPath, 'w');
        try {
          fs.writeFileSync(fd, jsonContent, { encoding: 'utf8' });
          fs.fsyncSync(fd);
        } finally {
          fs.closeSync(fd);
        }
      } catch (error) {
        throw new MemoryBuilderError(`Failed to write output file: ${resolvedPath} - ${error.message}`, 'OUTPUT_WRITE_ERROR');
      }
    }
  }

  /**
   * Sets output path based on environment
   *
   * @private
   * @param {boolean} forceStdout - Force stdout output regardless of environment
   * @returns {string} Output path ('stdout' or file path)
   */
  #setOutputPath(forceStdout = false) {
    if (forceStdout) {
      return 'stdout';
    }
    if (this.environmentManager.isClaudeContainer()) {
      const containerPath = this.config.build.containerPath;
      return `${containerPath}/${this.config.settings.skill.initialization}/resources/memory.json`;
    }
    const localPath = path.resolve(this.projectRoot, this.config.build.localPath);
    return `${localPath}/${this.config.settings.skill.initialization}/resources/memory.json`;
  }

  /**
   * Generates profile output with timestamp
   *
   * @param {Object} profiles - Hierarchical profile dictionary
   * @returns {boolean} Success status
   * @throws {MemoryBuilderError} When generation fails
   */
  generate(profiles) {
    if (typeof profiles !== 'object' || profiles === null) {
      throw new MemoryBuilderError('Profiles must be an object', 'INVALID_PROFILES');
    }
    const timeGenerator = new TimeGenerator(this.config);
    const timestamp = timeGenerator.generate();
    const sortedProfiles = Object.fromEntries(
      Object.keys(profiles).sort().map(key => [key, profiles[key]])
    );
    const output = {
      profiles: sortedProfiles,
      timestamp
    };
    const outputPath = this.#setOutputPath(false);
    this.#outputProfiles(output, outputPath);
    const stdoutOutput = {
      path: outputPath,
      timestamp
    };
    console.log(JSON.stringify(stdoutOutput, null, 2));
    return true;
  }

  /**
   * Generates timestamp-only output
   *
   * @returns {boolean} Success status
   * @throws {MemoryBuilderError} When generation fails
   */
  generateTimestamp() {
    const timeGenerator = new TimeGenerator(this.config);
    const timestamp = timeGenerator.generate();
    const output = { timestamp };
    const outputPath = this.#setOutputPath(true);
    this.#outputProfiles(output, outputPath);
    return true;
  }
}

module.exports = OutputGenerator;
