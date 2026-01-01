/**
 * Content Processor
 *
 * Transforms YAML content into hierarchical JSON structure.
 * Maintains 1:1 mapping with YAML organization.
 * Resolves inheritance chains recursively.
 *
 * @module lib/processors/ContentProcessor
 * @author AXIVO
 * @license BSD-3-Clause
 */
import fs from 'fs';
import path from 'path';
import MemoryBuilderError from '../core/error.js';

/**
 * Processes YAML content into hierarchical JSON
 *
 * Loads YAML files and transforms them into clean hierarchical
 * structure matching YAML organization exactly. Handles path resolution
 * for both domain and common content. Resolves inheritance chains
 * recursively with circular dependency detection.
 *
 * @class ContentProcessor
 */
class ContentProcessor {
  /**
   * Create ContentProcessor instance
   *
   * @param {Object} config - Configuration object
   * @param {Object} fileLoader - FileLoader instance for YAML loading
   * @param {string} pathKey - Config key for paths ('profiles' or 'instructions')
   */
  constructor(config, fileLoader, pathKey = 'profiles') {
    this.config = config;
    this.fileLoader = fileLoader;
    this.pathKey = pathKey;
    this.processedContent = new Set();
    this.processingStack = [];
  }

  /**
   * Build profile recursively with inheritance chain
   *
   * @private
   * @param {string} profileName - Profile name to build
   * @param {Object} profiles - Accumulator for all profiles in chain
   * @returns {void}
   */
  #buildProfileRecursive(profileName, profiles) {
    if (this.processingStack.includes(profileName)) {
      const cycle = [...this.processingStack, profileName].join(' → ');
      throw new MemoryBuilderError(
        `Circular dependency detected: ${cycle}`,
        'CIRCULAR_DEPENDENCY'
      );
    }
    if (this.processedContent.has(profileName)) {
      return;
    }
    this.processingStack.push(profileName);
    const profilePath = this.#resolveContentPath(profileName);
    const yaml = this.fileLoader.load(profilePath);
    const profileKey = Object.keys(yaml)[0];
    const profileData = yaml[profileKey];
    const inherits = this.#extractInherits(profileData, profileKey);
    inherits.forEach(inheritedProfile => {
      this.#buildProfileRecursive(inheritedProfile, profiles);
    });
    profiles[profileKey] = {
      description: profileData.description,
      ...this.#buildSections(profileData)
    };
    if (inherits.length > 0) {
      profiles[profileKey].inherits = inherits;
    }
    this.processedContent.add(profileName);
    this.processingStack.pop();
  }

  /**
   * Build sections recursively maintaining YAML structure
   *
   * @private
   * @param {Object} data - YAML data object
   * @returns {Object} Hierarchical section structure
   */
  #buildSections(data) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'description' || key === 'relations') {
        continue;
      }
      if (Array.isArray(value)) {
        result[key] = value.map(item =>
          typeof item === 'string' ? this.#substituteVariables(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.#buildSections(value);
      } else {
        result[key] = typeof value === 'string' ? this.#substituteVariables(value) : value;
      }
    }
    return result;
  }

  /**
   * Substitute template variables in text
   *
   * @private
   * @param {string} text - Text containing template variables
   * @returns {string} Text with substituted values
   */
  #substituteVariables(text) {
    if (typeof text !== 'string') {
      return text;
    }
    let result = text;
    if (this.config.settings) {
      const settingsReplacements = this.#flattenSettings(this.config.settings, 'settings');
      for (const [placeholder, value] of Object.entries(settingsReplacements)) {
        result = result.replaceAll(placeholder, value);
      }
    }
    return result;
  }

  /**
   * Flatten nested settings object into placeholder map
   *
   * Creates Mustache-style {{key}} placeholders matching observation conventions.
   * Double braces provide visual distinction and align with industry template standards.
   * Recursively processes nested objects to create dot-notation paths.
   *
   * @private
   * @param {Object} obj - Settings object to flatten
   * @param {string} prefix - Current prefix path (e.g., 'settings')
   * @returns {Object} Map of placeholders to values (e.g., {'{{settings.path.tool}}': '/path/to/tool'})
   */
  #flattenSettings(obj, prefix) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const path = `${prefix}.${key}`;
      if (key === 'plugins' && typeof value === 'object') {
        for (const [, pluginList] of Object.entries(value)) {
          for (const { plugin, skills } of pluginList) {
            result[`{{settings.plugin.${plugin.name}.name}}`] = plugin.name;
            result[`{{settings.plugin.${plugin.name}.version}}`] = plugin.version;
            if (skills) {
              for (const [skillKey, skillValue] of Object.entries(skills)) {
                result[`{{settings.skill.${skillKey}}}`] = skillValue;
              }
            }
          }
        }
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, this.#flattenSettings(value, path));
      } else {
        result[`{{${path}}}`] = value;
      }
    }
    return result;
  }

  /**
   * Extract inherits array from profile relations
   *
   * @private
   * @param {Object} profileData - Profile YAML data
   * @param {string} profileName - Profile name for error messages
   * @returns {Array} Array of inherited profile names
   * @throws {MemoryBuilderError} When invalid relation type is found
   */
  #extractInherits(profileData, profileName) {
    if (!profileData.relations || !Array.isArray(profileData.relations)) {
      return [];
    }
    const validRelationTypes = this.config.settings.relations;
    profileData.relations.forEach(relation => {
      if (relation.type && !validRelationTypes.includes(relation.type)) {
        throw new MemoryBuilderError(
          `Invalid relation type '${relation.type}' in profile '${profileName}'. Valid types: ${validRelationTypes.join(', ')}`,
          'INVALID_RELATION_TYPE'
        );
      }
    });
    return profileData.relations
      .filter(relation => relation.type === 'inherits')
      .map(relation => relation.target);
  }

  /**
   * Resolve profile file path
   *
   * @private
   * @param {string} profileName - Profile name (e.g., "DEVELOPER")
   * @returns {string} Resolved file path
   * @throws {MemoryBuilderError} When profile not found
   */
  #resolveContentPath(profileName) {
    const paths = this.config.settings.path[this.pathKey];
    const domainPath = path.join(
      paths.domain,
      `${profileName.toLowerCase()}.yaml`
    );
    if (fs.existsSync(domainPath)) {
      return domainPath;
    }
    const commonPath = path.join(
      paths.common,
      `${profileName.toLowerCase()}.yaml`
    );
    if (fs.existsSync(commonPath)) {
      return commonPath;
    }
    throw new MemoryBuilderError(
      `Profile not found: ${profileName}`,
      'PROFILE_NOT_FOUND'
    );
  }

  /**
   * Build profile with hierarchical structure and inheritance chain
   *
   * @param {string} profileName - Profile name (e.g., "DEVELOPER")
   * @returns {Object} Hierarchical dictionary of profile and inherited profiles
   * @throws {MemoryBuilderError} When profile loading fails or circular dependency detected
   */
  build(profileName) {
    const profiles = {};
    this.processedContent.clear();
    this.processingStack = [];
    this.#buildProfileRecursive(profileName, profiles);
    return profiles;
  }
}

export default ContentProcessor;
