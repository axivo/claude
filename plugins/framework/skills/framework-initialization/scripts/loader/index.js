/**
 * Loader Entry Point
 *
 * Loads profile from builder.yaml settings and builds graph cache resources.
 * In container environment, outputs profile and timestamp only.
 *
 * @module scripts/loader
 * @author AXIVO
 * @license BSD-3-Clause
 */
const path = require('path');
const memoryPath = path.join(__dirname, '../memory');
const ConfigLoader = require(path.join(memoryPath, 'lib/loaders/config'));
const EnvironmentManager = require(path.join(memoryPath, 'lib/core/environment'));
const MemoryBuilder = require(path.join(memoryPath, 'lib/core/memory'));
process.chdir(memoryPath);
if (require.main === module) {
  const configLoader = new ConfigLoader();
  const config = configLoader.load();
  const profileName = config.settings.profile;
  const environmentManager = new EnvironmentManager(config.settings);
  if (environmentManager.isClaudeContainer()) {
    const builder = new MemoryBuilder(null, config);
    builder.build();
  } else {
    const builder = new MemoryBuilder(profileName, config);
    const success = builder.build();
    process.exit(success ? 0 : 1);
  }
}
