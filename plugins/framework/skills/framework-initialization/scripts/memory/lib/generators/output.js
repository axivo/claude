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
    this.skill = this.#findSkillByKey('init');
  }

  /**
   * Finds a skill name by its key across all plugins
   *
   * @private
   * @param {string} skillKey - Skill key to find (e.g., 'init')
   * @returns {string|null} Skill name or null if not found
   */
  #findSkillByKey(skillKey) {
    for (const pluginList of Object.values(this.config.settings.plugins)) {
      for (const { skills } of pluginList) {
        if (skills?.[skillKey]) {
          return skills[skillKey];
        }
      }
    }
    return null;
  }

  /**
   * Creates zip archive of a single skill directory
   *
   * @private
   * @param {string} plugin - Name of the plugin containing the skill
   * @param {string} skill - Name of the skill to zip
   * @returns {string} Path to created zip file
   * @throws {MemoryBuilderError} When zip creation fails
   */
  #createZip(plugin, skill) {
    const outputPath = path.resolve(require('os').homedir(), this.config.settings.path.package.output);
    const sourcePath = path.resolve(require('os').homedir(), this.config.settings.path.skill.local, plugin, this.config.settings.version, 'skills');
    const zipPath = `${outputPath}/${skill}.zip`;
    const skillPath = path.join(sourcePath, skill);
    if (!fs.existsSync(skillPath)) {
      return null;
    }
    try {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
      const excludePaths = this.config.settings.path.package.excludes;
      const exclusions = excludePaths
        .map(pattern => `--exclude="${skill}/${pattern}/*"`)
        .join(' ');
      execSync(`tar -acf "${zipPath}" ${exclusions} "${skill}/"`, { cwd: sourcePath, stdio: 'pipe' });
      return zipPath;
    } catch (error) {
      throw new MemoryBuilderError(`Failed to create ${skill} zip archive: ${error.message}`, 'ZIP_CREATE_ERROR');
    }
  }

  /**
   * Generates inheritance-ordered output
   *
   * Uses reverse topological sort so active profile appears first, then parents.
   * This mirrors instance cognition: start from active profile, traverse to foundations.
   *
   * @private
   * @param {Object} data - Data to sort and output
   * @param {string} key - Wrapper key for output object
   * @returns {Object} Sorted output object with version
   */
  #generateSortedOutput(data, key) {
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
    return { [key]: sorted, version: this.config.settings.version };
  }

  /**
   * Injects JSON data into SKILL.md between delimiters
   *
   * @private
   * @param {string} marker - Delimiter name (instructions or methodology)
   * @param {Object} data - JSON data to inject
   */
  #injectData(marker, data) {
    const skill = this.#findSkillByKey('methodology');
    const skillPath = (this.container && this.environmentManager.isClaudeContainer())
      ? path.join(this.config.settings.path.skill.container, skill, 'SKILL.md')
      : path.join(require('os').homedir(), this.config.settings.path.skill.local, 'framework', this.config.settings.version, 'skills', skill, 'SKILL.md');
    const content = fs.readFileSync(skillPath, 'utf8');
    const pattern = new RegExp(
      `(<!-- framework-${marker}-start -->)[\\s\\S]*?(<!-- framework-${marker}-end -->)`
    );
    const jsonBlock = `$1\n\`\`\`json\n${JSON.stringify(data)}\n\`\`\`\n$2`;
    fs.writeFileSync(skillPath, content.replace(pattern, jsonBlock), 'utf8');
  }

  /**
   * Generates profile and instructions output with timestamp
   *
   * @param {Object} instructions - Hierarchical instructions dictionary
   * @param {Object} profiles - Hierarchical profile dictionary
   * @param {boolean} [returnOnly] - Return object instead of printing to stdout
   * @param {boolean} [skipInject] - Skip injecting data into SKILL.md
   * @returns {Object|boolean} Output object if returnOnly, otherwise success status
   * @throws {MemoryBuilderError} When generation fails
   */
  generate(instructions, profiles, returnOnly = false, skipInject = false) {
    if (typeof instructions !== 'object' || instructions === null) {
      throw new MemoryBuilderError('Instructions must be an object', 'INVALID_INSTRUCTIONS');
    }
    if (typeof profiles !== 'object' || profiles === null) {
      throw new MemoryBuilderError('Profiles must be an object', 'INVALID_PROFILES');
    }
    const instructionsData = this.#generateSortedOutput(instructions, 'instructions');
    const profilesData = this.#generateSortedOutput(profiles, 'profiles');
    if (!skipInject) {
      this.#injectData('instructions', instructionsData);
      this.#injectData('methodology', profilesData);
    }
    if (this.container && !this.environmentManager.isClaudeContainer()) {
      const paths = [];
      const plugins = this.config.settings.plugins;
      for (const [category, pluginList] of Object.entries(plugins)) {
        for (const { plugin, skills } of pluginList) {
          for (const skill of Object.values(skills)) {
            const zipPath = this.#createZip(plugin, skill);
            if (zipPath) {
              paths.push(zipPath);
            }
          }
        }
      }
      return this.generateOutput(paths.sort(), returnOnly);
    }
    return this.generateOutput(null, returnOnly);
  }

  /**
   * Generates output with profile and timestamp
   *
   * @param {Array} [paths] - Optional array of generated file paths
   * @param {boolean} [returnOnly] - Return object instead of printing to stdout
   * @returns {Object|boolean} Output object if returnOnly, otherwise success status
   * @throws {MemoryBuilderError} When generation fails
   */
  generateOutput(paths = null, returnOnly = false) {
    const timeGenerator = new TimeGenerator(this.config);
    const timestamp = timeGenerator.generate();
    const profile = this.profileName;
    const output = paths ? { paths, profile, timestamp } : { profile, timestamp };
    if (returnOnly) {
      return output;
    }
    this.output(output, 'stdout');
    return true;
  }

  /**
   * Outputs data to stdout or file
   *
   * @param {Object|Array} data - Data to output
   * @param {string} outputPath - Output file path ('stdout' for console)
   * @throws {MemoryBuilderError} When file write fails
   */
  output(data, outputPath) {
    if (!outputPath || outputPath === 'stdout') {
      console.log(JSON.stringify(data, null, 2));
      return;
    }
    const jsonContent = JSON.stringify(data);
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

module.exports = OutputGenerator;
