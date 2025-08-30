/**
 * Output Generator
 * 
 * Formats entities and relations into JSONL format and writes output file.
 * Handles UTF-8 encoding, POSIX compliance, and build statistics.
 * 
 * @module lib/generators/OutputGenerator
 * @author AXIVO
 * @license BSD-3-Clause
 */
const fs = require('fs');
const path = require('path');
const MemoryBuilderError = require('../core/Error');

/**
 * Generates and writes JSONL output files
 * 
 * Formats entities and relations into JSONL format with proper encoding.
 * Includes build statistics logging and POSIX compliance.
 * 
 * @class OutputGenerator
 */
class OutputGenerator {
  /**
   * Create OutputGenerator instance
   * 
   * @param {Object} config - Configuration object for output generation
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Formats entities and relations into JSONL content
   * 
   * @private
   * @param {Array} entities - Array of entity objects
   * @param {Array} relations - Array of relation objects
   * @returns {string} JSONL formatted content with Unix line endings
   */
  #formatJsonlContent(entities, relations) {
    const lines = [];
    entities.forEach(entity => {
      const jsonObject = {
        type: 'entity',
        name: entity.name,
        entityType: entity.entityType,
        observations: entity.observations
      };
      lines.push(JSON.stringify(jsonObject));
    });
    relations.forEach(relation => {
      const jsonObject = {
        type: 'relation',
        from: relation.from,
        to: relation.to,
        relationType: relation.relationType
      };
      lines.push(JSON.stringify(jsonObject));
    });
    return lines.join('\n') + '\n';
  }

  /**
   * Writes content to output file with proper encoding
   * 
   * @private
   * @param {string} content - JSONL content to write
   * @param {string} outputPath - Output file path
   * @throws {MemoryBuilderError} When file write operation fails
   */
  #writeOutputFile(content, outputPath) {
    const resolvedPath = path.resolve(outputPath);
    const outputDir = path.dirname(resolvedPath);
    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(resolvedPath, content, { encoding: 'utf8' });
    } catch (error) {
      throw new MemoryBuilderError(`Failed to write output file: ${resolvedPath} - ${error.message}`);
    }
  }

  /**
   * Generates JSONL output file from entities and relations
   * 
   * @param {Array} entities - Array of entity objects to output
   * @param {Array} relations - Array of relation objects to output
   * @returns {boolean} Success status
   * @throws {MemoryBuilderError} When generation or file writing fails
   */
  generate(entities, relations) {
    if (!Array.isArray(entities) || !Array.isArray(relations)) {
      throw new MemoryBuilderError('Entities and relations must be arrays');
    }
    if (!this.config.build?.outputPath) {
      throw new MemoryBuilderError('Output path not specified in configuration');
    }
    const content = this.#formatJsonlContent(entities, relations);
    this.#writeOutputFile(content, this.config.build.outputPath);
    return true;
  }
}

module.exports = OutputGenerator;
