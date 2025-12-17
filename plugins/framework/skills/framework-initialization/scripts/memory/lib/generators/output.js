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
   * @param {boolean} [container] - Running in container or container mode requested
   * @param {string} [profileName] - Profile name for output
   * @param {string} [projectRoot] - Project root directory path
   */
  constructor(config, container = false, profileName = null, projectRoot = null) {
    this.config = config;
    this.container = container;
    this.environmentManager = new EnvironmentManager(config.settings);
    this.profileName = profileName || config.settings.profile;
    this.projectRoot = projectRoot || process.cwd();
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
    const outputPath = path.resolve(require('os').homedir(), this.config.build.path.package.output);
    const sourcePath = path.resolve(require('os').homedir(), this.config.build.path.skill.local, this.config.build.version, 'skills');
    const zipPath = `${outputPath}/${skillName}.zip`;
    const skillPath = path.join(sourcePath, skillName);
    if (!fs.existsSync(skillPath)) {
      return null;
    }
    try {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
      const excludePaths = this.config.build.path.package.excludes;
      const exclusions = excludePaths
        .map(pattern => `--exclude="${skillName}/${pattern}/*"`)
        .join(' ');
      execSync(`tar -acf "${zipPath}" ${exclusions} "${skillName}/"`, { cwd: sourcePath, stdio: 'pipe' });
      return zipPath;
    } catch (error) {
      throw new MemoryBuilderError(`Failed to create ${skillName} zip archive: ${error.message}`, 'ZIP_CREATE_ERROR');
    }
  }

  /**
   * Generates inheritance-ordered output and writes to file
   *
   * Uses reverse topological sort so active profile appears first, then parents.
   * This mirrors instance cognition: start from active profile, traverse to foundations.
   *
   * @private
   * @param {Object} data - Data to sort and output
   * @param {string} key - Wrapper key for output object
   * @param {string} filename - Output filename
   * @returns {string} Output path
   */
  #generateSortedOutput(data, key, filename) {
    const keys = Object.keys(data);
    const visited = new Set();
    const result = [];
    const visit = (k) => {
      if (visited.has(k)) return;
      visited.add(k);
      const inherits = data[k]?.inherits;
      if (Array.isArray(inherits)) {
        inherits.filter(p => keys.includes(p)).forEach(visit);
      }
      result.push(k);
    };
    keys.forEach(visit);
    const sorted = Object.fromEntries(result.reverse().map(k => [k, data[k]]));
    const output = { [key]: sorted, version: this.config.build.version };
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
   * @param {string} filename - Output filename (e.g., 'instructions.json' or 'memory.json')
   * @param {boolean} forceStdout - Force stdout output regardless of environment
   * @returns {string} Output path ('stdout' or file path)
   */
  #setOutputPath(filename, forceStdout = false) {
    if (forceStdout) {
      return 'stdout';
    }
    const skill = this.config.build.skill.initialization;
    if (this.container && !this.environmentManager.isClaudeContainer()) {
      const homePath = path.resolve(require('os').homedir(), this.config.build.path.package.output);
      return `${homePath}/${filename}`;
    }
    const localPath = path.resolve(this.projectRoot, this.config.build.path.skill.local, this.config.build.version, 'skills');
    if (this.container) {
      const containerPath = this.config.build.path.skill.container;
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
    const paths = [];
    paths.push(this.#generateSortedOutput(instructions, 'instructions', 'instructions.json'));
    paths.push(this.#generateSortedOutput(profiles, 'profiles', 'memory.json'));
    if (this.container && !this.environmentManager.isClaudeContainer()) {
      const skills = this.config.build.skill;
      const homePath = path.resolve(require('os').homedir(), this.config.build.path.skill.local);
      const resourcesPath = path.join(homePath, this.config.build.version, 'skills', skills.initialization, 'resources');
      fs.rmSync(path.join(resourcesPath, 'instructions.json'), { force: true });
      fs.rmSync(path.join(resourcesPath, 'memory.json'), { force: true });
      for (const key of Object.keys(skills)) {
        const zipPath = this.#createZip(skills[key]);
        if (zipPath) {
          paths.push(zipPath);
        }
      }
    }
    return this.generateOutput(paths.sort());
  }

  /**
   * Generates output with profile and timestamp
   *
   * @param {Array} [paths] - Optional array of generated file paths
   * @returns {boolean} Success status
   * @throws {MemoryBuilderError} When generation fails
   */
  generateOutput(paths = null) {
    const timeGenerator = new TimeGenerator(this.config);
    const timestamp = timeGenerator.generate();
    const profile = this.profileName;
    const output = paths ? { paths, profile, timestamp } : { profile, timestamp };
    const outputPath = this.#setOutputPath(null, true);
    this.#outputProfiles(output, outputPath);
    return true;
  }
}

module.exports = OutputGenerator;
