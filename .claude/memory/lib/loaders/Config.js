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
const yaml = require('js-yaml');
const MemoryBuilderError = require('../core/Error');

/**
 * Configuration loader for MemoryBuilder
 * 
 * Handles loading and validation for the builder.yaml configuration file.
 * Provides auto-detection of profile files and comprehensive validation of configuration sections.
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
   * Auto-detects YAML profile files in directory
   * 
   * @private
   * @param {string} profilesDir - Directory to scan for profiles
   * @returns {Array<string>} Array of detected profile filenames
   * @throws {MemoryBuilderError} When directory scanning fails
   */
  #autoDetectProfiles(profilesDir) {
    if (!fs.existsSync(profilesDir)) {
      return [];
    }
    try {
      return fs.readdirSync(profilesDir)
        .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
        .sort();
    } catch (error) {
      throw new MemoryBuilderError(`Failed to scan profiles directory: ${error.message}`, 'ERR_CONFIG_SCAN');
    }
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
    if (!config.build.outputPath || typeof config.build.outputPath !== 'string') {
      throw new MemoryBuilderError('Missing or invalid "build.outputPath" in configuration', 'ERR_CONFIG_INVALID');
    }
    if (!Array.isArray(config.build.profiles)) {
      throw new MemoryBuilderError('Missing or invalid "build.profiles" array in configuration', 'ERR_CONFIG_INVALID');
    }
    if (!config.build.autoDetectProfiles && config.build.profiles.length === 0) {
      throw new MemoryBuilderError('No profiles specified and autoDetectProfiles is disabled', 'ERR_CONFIG_INVALID');
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
    if (config.build.autoDetectProfiles) {
      config.build.profiles = this.#autoDetectProfiles(config.build.profilesPath.domain);
    }
    return config;
  }
}

module.exports = ConfigLoader;
