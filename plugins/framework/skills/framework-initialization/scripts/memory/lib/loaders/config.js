/**
 * Configuration Loader
 * 
 * Loads and validates builder.yaml configuration
 * 
 * @module lib/loaders/ConfigLoader
 * @author AXIVO
 * @license BSD-3-Clause
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const yaml = require('../vendor/js-yaml.min.js');
const MemoryBuilderError = require('../core/error');

/**
 * Configuration loader for MemoryBuilder
 *
 * Handles loading and validation for the builder.yaml configuration file.
 * Validates required configuration sections and ensures proper structure.
 *
 * @class ConfigLoader
 */
class ConfigLoader {
  /**
   * Creates a new ConfigLoader instance
   */
  constructor() {
    this.configPath = path.join(__dirname, '../../config/builder.yaml');
  }

  /**
   * Finds project root by walking up directories looking for .claude marker
   *
   * @private
   * @param {string} [startDir] - Directory to start searching from
   * @returns {string} Project root path or cwd as fallback
   */
  #findProjectRoot(startDir = process.cwd()) {
    let dir = startDir;
    while (dir !== path.dirname(dir)) {
      if (fs.existsSync(path.join(dir, '.claude'))) {
        return dir;
      }
      dir = path.dirname(dir);
    }
    return process.cwd();
  }

  /**
   * Validates required configuration fields
   *
   * @private
   * @param {Object} config - Configuration to validate
   * @throws {MemoryBuilderError} When required fields are missing or invalid
   */
  #validateConfig(config) {
    if (!config.settings) {
      throw new MemoryBuilderError('Missing required "settings" section in configuration', 'ERR_CONFIG_INVALID');
    }
    if (!config.settings.path || !config.settings.path.profiles || !config.settings.path.profiles.domain || !config.settings.path.profiles.common) {
      throw new MemoryBuilderError('Missing or invalid "settings.path.profiles" in configuration', 'ERR_CONFIG_INVALID');
    }
    if (!config.settings.path.instructions || !config.settings.path.instructions.domain || !config.settings.path.instructions.common) {
      throw new MemoryBuilderError('Missing or invalid "settings.path.instructions" in configuration', 'ERR_CONFIG_INVALID');
    }
    const projectRoot = this.#findProjectRoot();
    if (process.env.FRAMEWORK_CONVERSATION_PATH) {
      config.settings.path.documentation.conversation = process.env.FRAMEWORK_CONVERSATION_PATH;
    } else {
      config.settings.path.documentation.conversation = path.join(projectRoot, config.settings.path.documentation.conversation);
    }
    if (process.env.FRAMEWORK_DIARY_PATH) {
      config.settings.path.documentation.diary = process.env.FRAMEWORK_DIARY_PATH;
    } else {
      config.settings.path.documentation.diary = path.join(projectRoot, config.settings.path.documentation.diary);
    }
    if (process.env.FRAMEWORK_PACKAGE_PATH) {
      config.settings.path.package.output = process.env.FRAMEWORK_PACKAGE_PATH;
    } else {
      config.settings.path.package.output = path.join(projectRoot, config.settings.path.package.output);
    }
    if (process.env.FRAMEWORK_PROFILE) {
      config.settings.profile = process.env.FRAMEWORK_PROFILE;
    }
    if (process.env.FRAMEWORK_TIMEZONE) {
      config.settings.timezone = process.env.FRAMEWORK_TIMEZONE;
    }
  }

  /**
   * Resolves template path based on environment
   *
   * @param {Object} config - Configuration object
   * @param {boolean} isContainer - Whether running in container environment
   */
  resolveTemplatePath(config, isContainer) {
    if (process.env.FRAMEWORK_TEMPLATE_PATH) {
      config.settings.path.template = process.env.FRAMEWORK_TEMPLATE_PATH;
    } else {
      const skillInfo = this.#findSkillByKey(config, 'methodology');
      if (isContainer) {
        config.settings.path.template = `${config.settings.path.skill.container}/${skillInfo.skillName}/templates`;
      } else {
        config.settings.path.template = path.join(os.homedir(), config.settings.path.skill.local, skillInfo.pluginName, skillInfo.pluginVersion, 'skills', skillInfo.skillName, 'templates');
      }
    }
  }

  /**
   * Finds a skill and its plugin info by skill key
   *
   * @private
   * @param {Object} config - Configuration object
   * @param {string} skillKey - Skill key to find (e.g., 'methodology')
   * @returns {Object|null} Object with plugin and skill info, or null if not found
   */
  #findSkillByKey(config, skillKey) {
    for (const pluginList of Object.values(config.settings.plugins)) {
      for (const { plugin, skills } of pluginList) {
        if (skills?.[skillKey]) {
          return { pluginName: plugin.name, pluginVersion: plugin.version, skillName: skills[skillKey] };
        }
      }
    }
    return null;
  }

  /**
   * Loads configuration from builder.yaml with validation
   *
   * @returns {Object} Configuration object
   * @throws {MemoryBuilderError} When configuration is invalid or missing
   */
  load() {
    if (!fs.existsSync(this.configPath)) {
      throw new MemoryBuilderError(`Configuration file not found: ${this.configPath}`, 'ERR_CONFIG_NOT_FOUND');
    }
    let config;
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      config = yaml.load(configContent);
    } catch (error) {
      throw new MemoryBuilderError(`Failed to parse configuration: ${error.message}`, 'ERR_CONFIG_PARSE');
    }
    this.#validateConfig(config);
    return config;
  }
}

module.exports = ConfigLoader;
