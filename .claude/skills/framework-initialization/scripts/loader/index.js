/**
 * Memory Loader Entry Point
 *
 * Loads profile from builder.yaml settings and builds memory cache.
 * Changes working directory to memory script location for correct path resolution.
 *
 * @module scripts/loader
 * @author AXIVO
 * @license BSD-3-Clause
 */
const path = require('path');
const memoryPath = path.join(__dirname, '../memory');
const MemoryBuilder = require(path.join(memoryPath, 'lib/core/memory'));
const ConfigLoader = require(path.join(memoryPath, 'lib/loaders/config'));
const projectRoot = process.cwd();
process.chdir(memoryPath);
if (require.main === module) {
  const configLoader = new ConfigLoader();
  const config = configLoader.load();
  const profileName = config.settings.profile;
  const builder = new MemoryBuilder(profileName, projectRoot, config);
  const success = builder.build();
  process.exit(success ? 0 : 1);
}
