/**
 * RelationGenerator Class
 * 
 * Processes relation declarations from multiple profiles and generates the final relations array.
 * Validates entity references and detects circular dependencies.
 * 
 * @class RelationGenerator
 * @author AXIVO
 * @license BSD-3-Clause
 */
const MemoryBuilderError = require('../core/Error');

/**
 * Generates and validates relations between entities
 * 
 * Processes relation declarations from profiles, validates entity references,
 * and detects circular inheritance dependencies.
 * 
 * @class RelationGenerator
 */
class RelationGenerator {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Performs depth-first search traversal for cycle detection
   * 
   * @private
   * @param {string} node - Current node
   * @param {Array} path - Current path
   * @param {Object} searchContext - Search context containing graph, visited, recursionStack, cycles
   */
  #performDepthSearch(node, path, searchContext) {
    const { graph, visited, recursionStack, cycles } = searchContext;
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        cycles.push([...path.slice(cycleStart), node]);
      }
      return;
    }
    if (visited.has(node)) {
      return;
    }
    visited.add(node);
    recursionStack.add(node);
    path.push(node);
    const neighbors = graph.get(node) || [];
    neighbors.forEach(neighbor => this.#performDepthSearch(neighbor, [...path], searchContext));
    recursionStack.delete(node);
  }

  /**
   * Detects circular dependencies using depth-first search
   * 
   * @private
   * @param {Array} relations - Array of relation objects
   * @returns {Array} Array of circular dependency chains found
   */
  #detectCircularDependencies(relations) {
    const graph = new Map();
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];
    relations.forEach(relation => {
      if (!graph.has(relation.from)) {
        graph.set(relation.from, []);
      }
      graph.get(relation.from).push(relation.to);
    });
    const searchContext = { graph, visited, recursionStack, cycles };
    graph.forEach((_, node) => {
      if (!visited.has(node)) {
        this.#performDepthSearch(node, [], searchContext);
      }
    });
    return cycles;
  }

  /**
   * Validates that relation targets exist in entities collection
   * 
   * @private
   * @param {Array} relations - Array of relation objects
   * @param {Array} entities - Array of entity objects
   * @returns {Array} Array of missing entity names
   */
  #validateEntityReferences(relations, entities) {
    const entityNames = new Set(entities.map(entity => entity.name));
    const missing = [];
    relations.forEach(relation => {
      if (!entityNames.has(relation.from)) {
        missing.push(`${relation.from} (from)`);
      }
      if (!entityNames.has(relation.to)) {
        missing.push(`${relation.to} (to)`);
      }
    });
    return [...new Set(missing)];
  }

  /**
   * Generates and validates relations from collected relation data
   * 
   * @param {Array} collectedRelations - Relations collected from all profiles
   * @param {Array} entities - Complete entities array for validation
   * @returns {Array} Array of validated relation objects
   */
  generate(collectedRelations, entities) {
    if (!Array.isArray(collectedRelations) || !Array.isArray(entities)) {
      throw new MemoryBuilderError('Relations and entities must be arrays');
    }
    const allowedRelationTypes = this.config.build?.relations || ['inherits'];
    const invalidRelations = collectedRelations.filter(relation =>
      relation && relation.relationType && !allowedRelationTypes.includes(relation.relationType)
    );
    if (invalidRelations.length > 0 && this.config.build?.stopOnCriticalError) {
      const invalidTypes = [...new Set(invalidRelations.map(r => r.relationType))];
      throw new MemoryBuilderError(`Invalid relation types: ${invalidTypes.join(', ')}. Allowed: ${allowedRelationTypes.join(', ')}`);
    }
    const validRelations = collectedRelations.filter(relation =>
      relation && relation.from && relation.to && relation.relationType &&
      allowedRelationTypes.includes(relation.relationType)
    );
    const missingEntities = this.#validateEntityReferences(validRelations, entities);
    if (missingEntities.length > 0 && this.config.logging?.showFileDetails) {
      console.warn(`⚠️  Missing entity references: ${missingEntities.join(', ')}`);
    }
    const existingEntities = new Set(entities.map(entity => entity.name));
    const finalRelations = validRelations.filter(relation =>
      existingEntities.has(relation.from) && existingEntities.has(relation.to)
    );
    const cycles = this.#detectCircularDependencies(finalRelations);
    if (cycles.length > 0 && this.config.logging?.showFileDetails) {
      cycles.forEach(cycle => {
        console.warn(`⚠️  Circular dependency detected: ${cycle.join(' → ')}`);
      });
    }
    return finalRelations;
  }
}

module.exports = RelationGenerator;
