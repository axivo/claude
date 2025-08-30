/**
 * ProfileProcessor Class
 * 
 * Processes individual profiles from YAML data and generates entities and relations arrays.
 * Handles empty or invalid profile data gracefully and implements recursive section processing.
 * 
 * @class ProfileProcessor
 * @author AXIVO
 * @license BSD-3-Clause
 */
const MemoryBuilderError = require('../core/Error');
const { EntityGenerator } = require('../generators');

/**
 * Processes individual profiles from YAML data into entities and relations
 * 
 * Handles profile inheritance, path substitution, and recursive section processing.
 * Generates entities with proper source attribution and standard observations.
 * 
 * @class ProfileProcessor
 */
class ProfileProcessor {
  constructor(config = {}) {
    this.metadataFields = new Set(['description', 'relations']);
    this.entityGenerator = new EntityGenerator();
    this.config = config;
  }

  /**
   * Categorize object properties into observations and subsections
   * 
   * @private
   * @param {Object} sectionData - Section data to categorize
   * @returns {Object} Object with observations and subSections arrays
   */
  #categorizeProperties(sectionData) {
    const observations = [];
    const subSections = {};
    for (const [key, value] of Object.entries(sectionData)) {
      if (key === 'observations' && Array.isArray(value)) {
        const filteredObservations = this.#processObservations(value);
        if (filteredObservations.length > 0) {
          observations.push(...filteredObservations);
        }
      } else if (Array.isArray(value)) {
        const filteredObservations = this.#processObservations(value);
        if (filteredObservations.length > 0) {
          subSections[key] = filteredObservations;
        }
      } else if (typeof value === 'object' && value !== null) {
        subSections[key] = value;
      } else if (value !== null && value !== undefined && value !== '') {
        const processedValue = this.#substitutePaths(value);
        observations.push(processedValue);
      }
    }
    return { observations, subSections };
  }

  /**
   * Create description entity from profile data
   * 
   * @private
   * @param {Object} profileData - Profile data containing description
   * @param {string} profileName - Name of the profile
   * @param {string} sourceFile - Source filename
   * @returns {Object|null} Description entity or null if no description
   */
  #createDescriptionEntity(profileData, profileName, sourceFile) {
    if (!profileData.description) {
      return null;
    }
    const description = this.#substitutePaths(profileData.description);
    return this.entityGenerator.createDescriptionEntity(
      profileName,
      description,
      sourceFile
    );
  }

  /**
   * Create section entity with source logic
   * 
   * @private
   * @param {string} sectionName - Name of the section
   * @param {Array} observations - Array of observations
   * @param {Object} context - Processing context
   * @returns {Object} Section entity
   */
  #createSectionEntity(sectionName, observations, context) {
    const sourceToUse = context.nestingLevel >= 2 ? context.profileName : context.sourceFile;
    return this.entityGenerator.createSectionEntity(
      sectionName,
      observations,
      context.profileName,
      sourceToUse,
      context.parentSection
    );
  }

  /**
   * Extract profile data from YAML structure
   * 
   * @private
   * @param {string} profileName - Name of the profile
   * @param {Object} yamlData - Parsed YAML configuration data
   * @returns {Object|null} Profile data or null if invalid
   */
  #extractProfileData(profileName, yamlData) {
    if (!yamlData || typeof yamlData !== 'object') {
      return null;
    }
    const profileData = yamlData[profileName] || yamlData;
    if (!profileData || typeof profileData !== 'object') {
      return null;
    }
    return profileData;
  }

  /**
   * Process leaf section (direct array)
   * 
   * @private
   * @param {string} sectionName - Name of the section
   * @param {Array} sectionData - Array data to process
   * @param {Object} context - Processing context
   * @returns {Array} Array with single entity or empty array
   */
  #processLeafSection(sectionName, sectionData, context) {
    const observations = this.#processObservations(sectionData);
    if (observations.length === 0) {
      return [];
    }
    const entity = this.#createSectionEntity(sectionName, observations, context);
    return [entity];
  }

  /**
   * Process observations with path substitution
   * 
   * @private
   * @param {Array} observations - Array of observation strings
   * @returns {Array} Processed observations with path substitution
   */
  #processObservations(observations) {
    if (!Array.isArray(observations)) {
      return [];
    }
    return observations
      .filter(item => item !== null && item !== undefined && item !== '')
      .map(item => this.#substitutePaths(item));
  }

  /**
   * Process relations from profile data
   * 
   * @private
   * @param {Object} profileData - Profile data containing relations
   * @param {string} profileName - Name of the profile
   * @returns {Array} Array of processed relations
   * @throws {MemoryBuilderError} When invalid relation type is found
   */
  #processRelations(profileData, profileName) {
    const relations = [];
    const validRelationTypes = this.config.build?.relations || ['inherits'];
    if (profileData.relations && Array.isArray(profileData.relations)) {
      profileData.relations.forEach(relation => {
        if (relation.target && relation.type) {
          if (!validRelationTypes.includes(relation.type)) {
            throw new MemoryBuilderError(`Invalid relation type '${relation.type}' in profile '${profileName}'. Valid types: ${validRelationTypes.join(', ')}`);
          }
          relations.push({
            from: profileName,
            to: relation.target,
            relationType: relation.type
          });
        }
      });
    }
    return relations;
  }

  /**
   * Process a section recursively to extract entities
   * 
   * @private
   * @param {Object} sectionInfo - Section information
   * @param {string} sectionInfo.sectionName - Name of the section
   * @param {*} sectionInfo.sectionData - Section data to process
   * @param {Object} processingContext - Processing environment
   * @param {string} processingContext.profileName - Parent profile name
   * @param {string} processingContext.sourceFile - Source filename
   * @param {Object} [hierarchyContext] - Hierarchy navigation context
   * @param {string} [hierarchyContext.parentSection] - Parent section name
   * @param {number} [hierarchyContext.nestingLevel] - Current nesting level
   * @returns {Array} Array of generated entities
   */
  #processSectionRecursively(sectionInfo, processingContext, hierarchyContext = {}) {
    const { sectionName, sectionData } = sectionInfo;
    const { profileName, sourceFile } = processingContext;
    const { parentSection = null, nestingLevel = 0 } = hierarchyContext;
    if (!sectionData || (typeof sectionData !== 'object' && !Array.isArray(sectionData))) {
      return [];
    }
    const context = {
      sectionName,
      profileName,
      sourceFile,
      parentSection,
      nestingLevel
    };
    if (Array.isArray(sectionData)) {
      return this.#processLeafSection(sectionName, sectionData, context);
    }
    const { observations, subSections } = this.#categorizeProperties(sectionData);
    const entities = [];
    if (observations.length > 0 || Object.keys(subSections).length > 0) {
      const entity = this.#createSectionEntity(sectionName, observations, context);
      entities.push(entity);
    }
    const subEntities = this.#processSubSections(subSections, processingContext, hierarchyContext, sectionName);
    entities.push(...subEntities);
    return entities;
  }

  /**
   * Process sections from profile data
   * 
   * @private
   * @param {Object} profileData - Profile data containing sections
   * @param {string} profileName - Name of the profile
   * @param {string} sourceFile - Source filename
   * @returns {Array} Array of section entities
   */
  #processSections(profileData, profileName, sourceFile) {
    const entities = [];
    const processingContext = { profileName, sourceFile };
    for (const [sectionName, sectionData] of Object.entries(profileData)) {
      if (this.metadataFields.has(sectionName)) {
        continue;
      }
      const sectionEntities = this.#processSectionRecursively(
        { sectionName, sectionData },
        processingContext
      );
      entities.push(...sectionEntities);
    }
    return entities;
  }

  /**
   * Process subsections recursively
   * 
   * @private
   * @param {Object} subSections - Object containing subsections to process
   * @param {Object} processingContext - Processing environment
   * @param {Object} hierarchyContext - Current hierarchy context
   * @param {string} currentSectionName - Current section name for parent tracking
   * @returns {Array} Array of entities from subsections
   */
  #processSubSections(subSections, processingContext, hierarchyContext, currentSectionName) {
    const entities = [];
    for (const [subSectionName, subSectionData] of Object.entries(subSections)) {
      const subEntities = this.#processSectionRecursively(
        { sectionName: subSectionName, sectionData: subSectionData },
        processingContext,
        {
          parentSection: hierarchyContext.parentSection || currentSectionName,
          nestingLevel: (hierarchyContext.nestingLevel || 0) + 1
        }
      );
      entities.push(...subEntities);
    }
    return entities;
  }

  /**
   * Perform path variable substitution
   * 
   * @private
   * @param {string} text - Text containing path variables
   * @returns {string} Text with substituted paths
   */
  #substitutePaths(text) {
    if (typeof text !== 'string' || !this.config.path) {
      return text;
    }
    let result = text;
    for (const [key, value] of Object.entries(this.config.path)) {
      const placeholder = `{path.${key}}`;
      if (result.includes(placeholder)) {
        result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      }
    }
    return result;
  }

  /**
   * Process a profile and return entities and relations
   * 
   * @param {string} profileName - Name of the profile
   * @param {Object} yamlData - Parsed YAML data
   * @param {string} sourceFile - Source filename
   * @returns {Object} Object containing entities and relations arrays
   * @throws {MemoryBuilderError} When profile processing fails
   */
  process(profileName, yamlData, sourceFile) {
    try {
      const profileData = this.#extractProfileData(profileName, yamlData);
      if (!profileData) {
        return { entities: [], relations: [] };
      }
      const entities = [];
      const relations = this.#processRelations(profileData, profileName);
      const descriptionEntity = this.#createDescriptionEntity(profileData, profileName, sourceFile);
      if (descriptionEntity) {
        entities.push(descriptionEntity);
      }
      const sectionEntities = this.#processSections(profileData, profileName, sourceFile);
      entities.push(...sectionEntities);
      return { entities, relations };
    } catch (error) {
      if (error instanceof MemoryBuilderError) {
        throw error;
      }
      throw new MemoryBuilderError(`Failed to process profile ${profileName}: ${error.message}`);
    }
  }
}

module.exports = ProfileProcessor;
