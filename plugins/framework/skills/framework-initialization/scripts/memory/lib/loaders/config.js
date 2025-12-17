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
   * Validates required configuration fields
   *
   * @private
   * @param {Object} config - Configuration to validate
   * @throws {MemoryBuilderError} When required fields are missing or invalid
   */
  #validateConfig(config) {
    if (!config.build) {
      throw new MemoryBuilderError('Missing required "build" section in configuration', 'ERR_CONFIG_INVALID');
    }
    if (!config.build.path || !config.build.path.profiles || !config.build.path.profiles.domain || !config.build.path.profiles.common) {
      throw new MemoryBuilderError('Missing or invalid "build.path.profiles" in configuration', 'ERR_CONFIG_INVALID');
    }
    if (!config.build.path.instructions || !config.build.path.instructions.domain || !config.build.path.instructions.common) {
      throw new MemoryBuilderError('Missing or invalid "build.path.instructions" in configuration', 'ERR_CONFIG_INVALID');
    }
    if (process.env.FRAMEWORK_PACKAGE_OUTPUT) {
      config.build.path.package.output = process.env.FRAMEWORK_PACKAGE_OUTPUT;
    }
    if (!config.settings) {
      throw new MemoryBuilderError('Missing required "settings" section in configuration', 'ERR_CONFIG_INVALID');
    }
    if (process.env.FRAMEWORK_CONVERSATIONS) {
      config.settings.path.documentation.conversations = process.env.FRAMEWORK_CONVERSATIONS;
    }
    if (process.env.FRAMEWORK_DIARY) {
      config.settings.path.documentation.diary = process.env.FRAMEWORK_DIARY;
    }
    if (process.env.FRAMEWORK_PROFILE) {
      config.settings.profile = process.env.FRAMEWORK_PROFILE;
    }
    if (process.env.FRAMEWORK_TIMEZONE) {
      config.settings.timezone = process.env.FRAMEWORK_TIMEZONE;
    }
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
