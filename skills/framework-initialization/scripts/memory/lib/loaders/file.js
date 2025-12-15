/**
 * File Loader
 * 
 * Loads and parses individual YAML profile files with comprehensive error handling
 * 
 * @module lib/loaders/FileLoader
 * @author AXIVO
 * @license BSD-3-Clause
 */
const fs = require('fs');
const path = require('path');
const yaml = require('../vendor/js-yaml.min.js');
const MemoryBuilderError = require('../core/error');

/**
 * File loader for YAML profile files
 * 
 * Handles file I/O operations, YAML parsing, and file validation for the memory builder system.
 * Provides error handling and recovery for common file operation failures.
 * 
 * @class FileLoader
 */
class FileLoader {
  /**
   * Loads and parses a YAML file
   * 
   * @param {string} filePath - Path to the YAML file
   * @returns {Object} Parsed YAML content as JavaScript object
   * @throws {MemoryBuilderError} When file cannot be loaded or parsed
   */
  load(filePath) {
    const resolvedPath = path.resolve(filePath);
    try {
      const content = fs.readFileSync(resolvedPath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      throw new MemoryBuilderError(`Failed to load YAML file: ${resolvedPath} - ${error.message}`, 'FILE_LOAD_ERROR');
    }
  }
}

module.exports = FileLoader;
