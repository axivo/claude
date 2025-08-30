/**
 * Entity Generator
 * 
 * Generates entity objects with consistent structure for the memory builder system
 * 
 * @module lib/generators/EntityGenerator
 * @author AXIVO
 * @license BSD-3-Clause
 */
const MemoryBuilderError = require('../core/Error');

/**
 * Entity generator for MemoryBuilder
 * 
 * Handles entity type determination, observation standardization, and validation.
 * Provides static methods for creating entities with consistent structure.
 * 
 * @class EntityGenerator
 */
class EntityGenerator {
  /**
   * Add standard observations to entity
   * 
   * @private
   * @param {string} entityType - Entity type
   * @param {boolean} hasObservations - Whether entity already has observations
   * @returns {Array<string>} Standard observations
   */
  #addStandardObservations(entityType, hasObservations) {
    const observations = [];
    if (entityType === 'section' && !hasObservations) {
      observations.push('capabilities');
    }
    return observations;
  }

  /**
   * Determine entity type based on name and context
   * 
   * @private
   * @param {string} name - Entity name
   * @param {Object} context - Entity context
   * @returns {string} Determined entity type
   */
  #determineEntityType(name, context) {
    if (context.entityType) {
      return context.entityType;
    }
    if (name === context.profileName && !context.parentEntity) {
      return `${name.toLowerCase()}_description`;
    }
    return 'section';
  }

  /**
   * Process observations array and filter invalid entries
   * 
   * @private
   * @param {Array} observations - Raw observations array
   * @param {Object} context - Processing context
   * @returns {Array<string>} Processed observations
   */
  #processObservations(observations, context) {
    if (!Array.isArray(observations)) {
      return [];
    }
    return observations
      .filter(obs => obs && typeof obs === 'string' && obs.trim().length > 0)
      .map(obs => obs.trim())
      .filter((obs, index, arr) => arr.indexOf(obs) === index);
  }

  /**
   * Validate observations array and ensure data integrity
   * 
   * @private
   * @param {Array<string>} observations - Observations to validate
   * @returns {Array<string>} Validated and sorted observations
   * @throws {MemoryBuilderError} When observations contain invalid data
   */
  #validateObservations(observations) {
    if (!Array.isArray(observations)) {
      throw new MemoryBuilderError('Observations must be an array');
    }
    const validObservations = observations.filter(obs => {
      return obs &&
        typeof obs === 'string' &&
        obs.trim().length > 0 &&
        obs.length <= 1000;
    });
    return validObservations.sort();
  }

  /**
   * Create an entity with consistent structure
   * 
   * @param {string} name - Entity name identifier
   * @param {Array<string>} observations - Array of observation strings
   * @param {Object} context - Context information for entity creation
   * @param {string} context.profileName - Name of the profile this entity belongs to
   * @param {string} context.sourceFile - Source file path
   * @param {string} [context.entityType] - Override entity type determination
   * @param {string} [context.parentEntity] - Parent entity name for nested entities
   * @returns {Object} Formatted entity object
   * @throws {MemoryBuilderError} When required context is missing or invalid
   */
  createEntity(name, observations, context) {
    if (!name || typeof name !== 'string') {
      throw new MemoryBuilderError('Entity name is required and must be a string');
    }
    if (!context || !context.profileName || !context.sourceFile) {
      throw new MemoryBuilderError('Context with profileName and sourceFile is required');
    }
    const entityType = this.#determineEntityType(name, context);
    const processedObservations = this.#processObservations(observations, context);
    const hasObservations = processedObservations.length > 0;
    const standardObservations = this.#addStandardObservations(entityType, hasObservations);
    const allObservations = [...processedObservations, ...standardObservations];
    const validatedObservations = this.#validateObservations(allObservations);
    return {
      type: 'entity',
      name: name,
      entityType: entityType,
      observations: validatedObservations
    };
  }

  /**
   * Create a description entity for a profile
   * 
   * @param {string} profileName - Name of the profile
   * @param {string} description - Description text
   * @param {string} sourceFile - Source file path
   * @returns {Object} Description entity object
   */
  createDescriptionEntity(profileName, description, sourceFile) {
    return this.createEntity(profileName, [description], {
      profileName,
      sourceFile,
      entityType: `${profileName.toLowerCase()}_description`
    });
  }

  /**
   * Create a section entity
   * 
   * @param {string} sectionName - Name of the section
   * @param {Array<string>} observations - Array of observations
   * @param {string} profileName - Name of the parent profile
   * @param {string} sourceFile - Source file path
   * @param {string} [parentSection] - Parent section name
   * @returns {Object} Section entity object
   */
  createSectionEntity(sectionName, observations, profileName, sourceFile, parentSection = null) {
    return this.createEntity(sectionName, observations, {
      profileName,
      sourceFile,
      parentEntity: parentSection || profileName
    });
  }
}

module.exports = EntityGenerator;
