/**
 * Memory Builder
 * 
 * Main orchestrator class that coordinates the entire memory build process
 * 
 * @module lib/Memory
 * @author AXIVO
 * @license BSD-3-Clause
 */
const fs = require('fs');
const path = require('path');
const { MemoryBuilderError } = require('./');
const { OutputGenerator, RelationGenerator } = require('../generators');
const { ConfigLoader, FileLoader } = require('../loaders');
const { ProfileProcessor } = require('../processors');

/**
 * Main orchestrator for memory builder system
 * 
 * Coordinates configuration loading, file processing, relation generation,
 * and output creation. Provides build statistics and error handling.
 * 
 * @class MemoryBuilder
 */
class MemoryBuilder {
  constructor(config = {}) {
    this.config = config;
    this.entities = [];
    this.relations = [];
    this.allRelations = [];
    this.stats = {
      filesProcessed: 0,
      entitiesCreated: 0,
      relationsCreated: 0,
      startTime: null
    };
  }

  /**
   * Process additional files not in domain profiles
   * 
   * @private
   */
  async #processAdditionalFiles() {
    const profilesPath = path.resolve(__dirname, '../..', this.config.build.profilesPath.domain);
    if (!fs.existsSync(profilesPath)) {
      return;
    }
    const processedFiles = new Set(this.config.build.profiles);
    const files = fs.readdirSync(profilesPath)
      .filter(file => (file.endsWith('.yaml') || file.endsWith('.yml')) && !processedFiles.has(file))
      .sort();
    for (const file of files) {
      await this.#processFile(path.join(profilesPath, file), file);
    }
  }

  /**
   * Process a single profile file
   * 
   * @private
   * @param {string} filePath - Full path to file
   * @param {string} filename - Base filename for source attribution
   */
  async #processFile(filePath, filename) {
    try {
      const fileLoader = new FileLoader();
      const data = fileLoader.load(filePath);
      const profileName = path.basename(filename, path.extname(filename)).toUpperCase();
      const processor = new ProfileProcessor(this.config);
      const result = processor.process(profileName, data, filename);
      this.entities.push(...result.entities);
      this.allRelations.push(...result.relations);
      this.stats.filesProcessed++;
      if (this.config.logging.showFileDetails) {
        console.log(`📄 Processed '${filename}' profile`);
      }
    } catch (error) {
      if (this.config.build.process.stopOnCriticalError) {
        throw new MemoryBuilderError(`Failed to process ${filename}: ${error.message}`);
      } else {
        console.warn(`⚠️ Failed to process ${filename}: ${error.message}`);
      }
    }
  }

  /**
   * Process all files according to configuration
   * 
   * @private
   */
  async #processFiles() {
    if (this.config.build.process.commonProfilesFirst) {
      const commonPath = path.resolve(__dirname, '../..', this.config.build.profilesPath.common);
      if (fs.existsSync(commonPath)) {
        const files = fs.readdirSync(commonPath)
          .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
          .sort();
        if (this.config.logging?.showProgress && files.length > 0) {
          console.log(`📚 Processing ${files.length} common profiles...`);
        }
        for (const file of files) {
          await this.#processFile(path.join(commonPath, file), `${path.basename(this.config.build.profilesPath.common)}/${file}`);
        }
      }
    }
    if (this.config.logging?.showProgress) {
      console.log(`📚 Processing ${this.config.build.profiles.length} domain profiles...`);
    }
    const profilesPath = path.resolve(__dirname, '../..', this.config.build.profilesPath.domain);
    for (const profileFile of this.config.build.profiles) {
      const filePath = path.join(profilesPath, profileFile);
      await this.#processFile(filePath, profileFile);
    }
    if (this.config.build.process.additionalProfiles) {
      await this.#processAdditionalFiles();
    }
  }

  /**
   * Main build method that orchestrates the entire process
   * 
   * @returns {Promise<boolean>} Build success status
   */
  async build() {
    try {
      this.stats.startTime = Date.now();
      if (Object.keys(this.config).length === 0) {
        const configLoader = new ConfigLoader();
        this.config = configLoader.load();
      }
      this.entities = [];
      this.relations = [];
      this.allRelations = [];
      this.stats.filesProcessed = 0;
      this.stats.entitiesCreated = 0;
      this.stats.relationsCreated = 0;
      await this.#processFiles();
      if (this.config.logging?.showProgress) {
        console.log('🔗 Generating relations from profile declarations...');
      }
      const relationGenerator = new RelationGenerator(this.config);
      this.relations = relationGenerator.generate(this.allRelations, this.entities);
      if (this.config.logging?.showProgress) {
        console.log(`🔗 Generated ${this.relations.length} relations`);
      }
      this.stats.entitiesCreated = this.entities.length;
      this.stats.relationsCreated = this.relations.length;
      const buildTime = Date.now() - this.stats.startTime;
      if (this.config.logging?.showProgress) {
        console.log(`📝 Output written to ${this.config.build.outputPath}`);
        console.log(`✅ Generated ${this.stats.entitiesCreated} entities and ${this.stats.relationsCreated} relations from ${this.stats.filesProcessed} profiles in ${buildTime}ms`);
      }
      const outputGenerator = new OutputGenerator(this.config);
      outputGenerator.generate(this.entities, this.relations);
      return true;
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      return false;
    }
  }
}

module.exports = MemoryBuilder;
