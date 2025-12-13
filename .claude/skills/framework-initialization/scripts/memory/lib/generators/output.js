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
    if (!outputPath || outputPath === 'stdout') {
      console.log(JSON.stringify(profiles, null, 2));
      return;
    } else {
      const jsonContent = JSON.stringify(profiles);
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
   * @param {string} filename - Output filename (e.g., 'memory.json' or 'instructions.json')
   * @param {boolean} forceStdout - Force stdout output regardless of environment
   * @returns {string} Output path ('stdout' or file path)
   */
  #setOutputPath(filename = 'memory.json', forceStdout = false) {
    if (forceStdout) {
      return 'stdout';
    }
    const skill = this.config.settings.skill.initialization;
    if (this.environmentManager.isClaudeContainer()) {
      const containerPath = this.config.settings.path.skill.container;
      return `${containerPath}/${skill}/resources/${filename}`;
    }
    const localPath = path.resolve(this.projectRoot, this.config.settings.path.skill.local);
    return `${localPath}/${skill}/resources/${filename}`;
  }

  /**
   * Generates profile and instructions output with timestamp
   *
   * @param {Object} profiles - Hierarchical profile dictionary
   * @param {Object} [instructions] - Hierarchical instructions dictionary
   * @returns {boolean} Success status
   * @throws {MemoryBuilderError} When generation fails
   */
  generate(profiles, instructions = null) {
    if (typeof profiles !== 'object' || profiles === null) {
      throw new MemoryBuilderError('Profiles must be an object', 'INVALID_PROFILES');
    }
    if (instructions !== null && (typeof instructions !== 'object')) {
      throw new MemoryBuilderError('Instructions must be an object', 'INVALID_INSTRUCTIONS');
    }
    const timeGenerator = new TimeGenerator(this.config);
    const timestamp = timeGenerator.generate();
    const paths = [];
    if (instructions !== null) {
      const sortedInstructions = Object.fromEntries(
        Object.keys(instructions).sort().map(key => [key, instructions[key]])
      );
      const instructionsOutput = { instructions: sortedInstructions };
      const instructionsPath = this.#setOutputPath('instructions.json', false);
      this.#outputProfiles(instructionsOutput, instructionsPath);
      paths.push(instructionsPath);
    }
    const sortedProfiles = Object.fromEntries(
      Object.keys(profiles).sort().map(key => [key, profiles[key]])
    );
    const memoryOutput = { profiles: sortedProfiles };
    const memoryPath = this.#setOutputPath('memory.json', false);
    this.#outputProfiles(memoryOutput, memoryPath);
    paths.push(memoryPath);
    const stdoutOutput = {
      paths,
      timestamp
    };
    console.log(JSON.stringify(stdoutOutput, null, 2));
    return true;
  }

  /**
   * Generates timestamp-only output with configuration profile
   *
   * @returns {boolean} Success status
   * @throws {MemoryBuilderError} When generation fails
   */
  generateTimestamp() {
    const timeGenerator = new TimeGenerator(this.config);
    const timestamp = timeGenerator.generate();
    const profile = this.config.settings.profile;
    const output = { profile, timestamp };
    const outputPath = this.#setOutputPath(null, true);
    this.#outputProfiles(output, outputPath);
    return true;
  }
}

module.exports = OutputGenerator;
