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
const { ProfileProcessor } = require('../processors');

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
   */
  constructor(profileName, projectRoot, config = {}) {
    this.profileName = profileName;
    this.projectRoot = projectRoot || process.cwd();
    this.config = config;
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
      const outputGenerator = new OutputGenerator(this.config, this.projectRoot);
      if (!this.profileName) {
        outputGenerator.generateTimestamp();
        return true;
      }
      const fileLoader = new FileLoader();
      const profileProcessor = new ProfileProcessor(this.config, fileLoader);
      const profiles = profileProcessor.build(this.profileName);
      outputGenerator.generate(profiles);
      return true;
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      return false;
    }
  }
}

module.exports = MemoryBuilder;
