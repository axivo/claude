/**
 * Package Builder
 * 
 * Enhances npm init -y output with memory-builder specific configuration
 * 
 * @module lib/core/Package
 * @author AXIVO
 * @license BSD-3-Clause
 */
const fs = require('fs');
const path = require('path');

/**
 * Package builder for MemoryBuilder
 * 
 * Enhances package.json files with memory-builder specific configuration
 * including scripts, keywords, and directories.
 * 
 * @class PackageBuilder
 */
class PackageBuilder {
  /**
   * Creates a new PackageBuilder instance
   */
  constructor() {
    this.packagePath = path.resolve('./package.json');
  }

  /**
   * Enhances package.json for memory builder project
   * 
   * @returns {Object} Enhanced package.json object
   * @throws {Error} When package.json not found
   */
  enhancePackage() {
    if (!fs.existsSync(this.packagePath)) {
      throw new Error('package.json not found. Run "npm init -y" first.');
    }
    const currentPackage = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
    const enhanced = {
      ...currentPackage,
      name: 'memory-builder',
      description: 'YAML to JSONL memory configuration builder for multi-profile collaboration system',
      main: 'builder.js',
      scripts: {
        'build': 'node builder.js',
        'build:sources': 'node builder.js --sources'
      },
      keywords: [
        'axivo',
        'collaboration',
        'engineering',
        'infrastructure',
        'mcp',
        'memory'
      ],
      directories: {
        ...currentPackage.directories,
        'lib': 'lib'
      }
    };
    fs.writeFileSync(this.packagePath, JSON.stringify(enhanced, null, 2) + '\n');
    console.log('✅ Enhanced package.json for AXIVO memory builder');
    console.log(`📦 Name: ${enhanced.name}`);
    console.log(`📝 Scripts: ${Object.keys(enhanced.scripts).join(', ')}`);
    return enhanced;
  }
}

if (require.main === module) {
  try {
    const packageBuilder = new PackageBuilder();
    packageBuilder.enhancePackage();
  } catch (error) {
    console.error(`❌ Enhancement failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = PackageBuilder;
