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
const { execSync } = require('child_process');
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
   * @param {boolean} [packageMode] - User explicitly requested container packaging (-c flag)
   * @param {boolean} [isContainer] - Running in container or container mode requested
   */
  constructor(config, projectRoot = null, packageMode = false, isContainer = false) {
    this.config = config;
    this.environmentManager = new EnvironmentManager(config.settings);
    this.projectRoot = projectRoot || process.cwd();
    this.packageMode = packageMode;
    this.isContainer = isContainer;
  }

  /**
   * Creates zip archive of a single skill directory
   *
   * @private
   * @param {string} skillName - Name of the skill to zip
   * @returns {string} Path to created zip file
   * @throws {MemoryBuilderError} When zip creation fails
   */
  #createZip(skillName) {
    const localPath = path.resolve(this.projectRoot, this.config.settings.path.skill.local);
    const skillPath = path.join(localPath, skillName);
    const zipPath = `${localPath}/${skillName}.zip`;
    if (!fs.existsSync(skillPath)) {
      return null;
    }
    try {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
      execSync(`zip -r "${skillName}.zip" "${skillName}/"`, { cwd: localPath, stdio: 'pipe' });
      return zipPath;
    } catch (error) {
      throw new MemoryBuilderError(`Failed to create ${skillName} zip archive: ${error.message}`, 'ZIP_CREATE_ERROR');
    }
  }

  /**
   * Generates sorted output and writes to file
   *
   * @private
   * @param {Object} data - Data to sort and output
   * @param {string} key - Wrapper key for output object
   * @param {string} filename - Output filename
   * @returns {string} Output path
   */
  #generateOutput(data, key, filename) {
    const sorted = Object.fromEntries(
      Object.keys(data).sort().map(k => [k, data[k]])
    );
    const output = { [key]: sorted };
    const outputPath = this.#setOutputPath(filename, false);
    this.#outputProfiles(output, outputPath);
    return outputPath;
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
        throw new MemoryBuilderError(`Failed to write ${resolvedPath} output file: ${error.message}`, 'OUTPUT_WRITE_ERROR');
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
    const localPath = path.resolve(this.projectRoot, this.config.settings.path.skill.local);
    if (this.packageMode && !this.environmentManager.isClaudeContainer()) {
      return `${localPath}/${filename}`;
    }
    if (this.isContainer) {
      const containerPath = this.config.settings.path.skill.container;
      return `${containerPath}/${skill}/resources/${filename}`;
    }
    return `${localPath}/${skill}/resources/${filename}`;
  }

  /**
   * Generates profile and instructions output with timestamp
   *
   * @param {Object} instructions - Hierarchical instructions dictionary
   * @param {Object} profiles - Hierarchical profile dictionary
   * @returns {boolean} Success status
   * @throws {MemoryBuilderError} When generation fails
   */
  generate(instructions, profiles) {
    if (typeof instructions !== 'object' || instructions === null) {
      throw new MemoryBuilderError('Instructions must be an object', 'INVALID_INSTRUCTIONS');
    }
    if (typeof profiles !== 'object' || profiles === null) {
      throw new MemoryBuilderError('Profiles must be an object', 'INVALID_PROFILES');
    }
    const timeGenerator = new TimeGenerator(this.config);
    const timestamp = timeGenerator.generate();
    const paths = [];
    paths.push(this.#generateOutput(instructions, 'instructions', 'instructions.json'));
    paths.push(this.#generateOutput(profiles, 'profiles', 'memory.json'));
    if (this.packageMode && !this.environmentManager.isClaudeContainer()) {
      const skills = this.config.settings.skill;
      const localPath = path.resolve(this.projectRoot, this.config.settings.path.skill.local);
      const resourcesPath = path.join(localPath, skills.initialization, 'resources');
      fs.rmSync(path.join(resourcesPath, 'instructions.json'), { force: true });
      fs.rmSync(path.join(resourcesPath, 'memory.json'), { force: true });
      for (const key of Object.keys(skills)) {
        const zipPath = this.#createZip(skills[key]);
        if (zipPath) {
          paths.push(zipPath);
        }
      }
    }
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
