/**
 * Memory Builder
 *
 * Main orchestrator class that coordinates the entire memory build process
 *
 * @module lib/Memory
 * @author AXIVO
 * @license BSD-3-Clause
 */
const { EnvironmentManager } = require('../core');
const { OutputGenerator } = require('../generators');
const { ConfigLoader, FileLoader } = require('../loaders');
const { ContentProcessor } = require('../processors');

/**
 * Main orchestrator for memory builder system
 *
 * Coordinates configuration loading, profile processing, and output creation.
 *
 * @class MemoryBuilder
 */
class MemoryBuilder {
  /**
   * Create MemoryBuilder instance
   *
   * @param {string} profileName - Profile name to build (e.g., "DEVELOPER")
   * @param {string} projectRoot - Project root directory path
   * @param {Object} config - Configuration object (optional)
   * @param {boolean} container - Use container environment for instructions (optional)
   */
  constructor(profileName, projectRoot, config = {}, container = false) {
    this.profileName = profileName;
    this.projectRoot = projectRoot || process.cwd();
    this.config = config;
    this.container = container;
  }

  /**
   * Build profile with hierarchical structure
   *
   * @returns {boolean} Build success status
   */
  build() {
    try {
      if (Object.keys(this.config).length === 0) {
        const configLoader = new ConfigLoader();
        this.config = configLoader.load();
      }
      const environmentManager = new EnvironmentManager(this.config.settings);
      environmentManager.sync();
      const isContainer = this.container || environmentManager.isClaudeContainer();
      const outputGenerator = new OutputGenerator(this.config, this.projectRoot, this.container, isContainer);
      if (!this.profileName) {
        outputGenerator.generateTimestamp();
        return true;
      }
      const fileLoader = new FileLoader();
      const profileProcessor = new ContentProcessor(this.config, fileLoader, 'profiles');
      const profiles = profileProcessor.build(this.profileName);
      const instructionsName = isContainer ? 'CONTAINER' : 'LOCAL';
      const instructionsProcessor = new ContentProcessor(this.config, fileLoader, 'instructions');
      const instructions = instructionsProcessor.build(instructionsName);
      outputGenerator.generate(instructions, profiles);
      return true;
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      return false;
    }
  }
}

module.exports = MemoryBuilder;
