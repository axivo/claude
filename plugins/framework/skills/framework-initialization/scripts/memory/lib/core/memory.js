/**
 * Memory Builder
 *
 * Main orchestrator class that coordinates the entire memory build process
 *
 * @module lib/Memory
 * @author AXIVO
 * @license BSD-3-Clause
 */
import { EnvironmentManager } from '../core/index.js';
import { OutputGenerator } from '../generators/index.js';
import { ConfigLoader, FileLoader } from '../loaders/index.js';
import { ContentProcessor } from '../processors/index.js';

/**
 * Main orchestrator for memory builder system
 *
 * Coordinates configuration loading, profile processing, and output creation.
 *
 * @class MemoryBuilder
 */
class MemoryBuilder {
  /**
   * Creates MemoryBuilder instance
   *
   * @param {string} profileName - Profile name to build (default settings.profile)
   * @param {Object} config - Configuration object (optional)
   * @param {boolean} container - Use container environment (optional, default autodetected)
   */
  constructor(profileName, config = {}, container = false) {
    this.profileName = profileName;
    this.config = config;
    this.container = container;
  }

  /**
   * Builds profile with hierarchical structure
   *
   * @returns {boolean} Build success status
   */
  build() {
    try {
      const configLoader = new ConfigLoader();
      if (Object.keys(this.config).length === 0) {
        this.config = configLoader.load();
      }
      const environmentManager = new EnvironmentManager(this.config.settings);
      environmentManager.sync();
      this.container = this.container || environmentManager.isClaudeContainer();
      configLoader.resolveTemplatePath(this.config, this.container);
      const outputGenerator = new OutputGenerator(this.config, this.container, this.profileName);
      if (!this.profileName) {
        const defaultGenerator = new OutputGenerator(this.config, false, this.config.settings.profile);
        defaultGenerator.generateOutput();
        return true;
      }
      const fileLoader = new FileLoader();
      const profileProcessor = new ContentProcessor(this.config, fileLoader, 'profiles');
      const profiles = profileProcessor.build(this.profileName);
      const instructionsName = this.container ? 'CONTAINER' : 'LOCAL';
      const instructionsProcessor = new ContentProcessor(this.config, fileLoader, 'instructions');
      const instructions = instructionsProcessor.build(instructionsName);
      if (this.container && !environmentManager.isClaudeContainer()) {
        const result = outputGenerator.generate(instructions, profiles, true);
        const defaultProfile = this.config.settings.profile;
        const defaultProfiles = profileProcessor.build(defaultProfile);
        const localInstructions = instructionsProcessor.build('LOCAL');
        const defaultGenerator = new OutputGenerator(this.config, false, defaultProfile);
        defaultGenerator.generate(localInstructions, defaultProfiles, true);
        outputGenerator.output(result, 'stdout');
      } else {
        outputGenerator.generate(instructions, profiles);
      }
      return true;
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      return false;
    }
  }
}

export default MemoryBuilder;
