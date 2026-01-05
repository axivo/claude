/**
 * Memory Loader Entry Point
 *
 * Automated loader for the MemoryBuilder class
 *
 * @module scripts/loader
 * @author AXIVO
 * @license BSD-3-Clause
 */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const memoryPath = path.join(__dirname, '../memory');

const { default: ConfigLoader } = await import(path.join(memoryPath, 'lib/loaders/config.js'));
const { default: EnvironmentManager } = await import(path.join(memoryPath, 'lib/core/environment.js'));
const { default: MemoryBuilder } = await import(path.join(memoryPath, 'lib/core/memory.js'));

process.chdir(memoryPath);

const configLoader = new ConfigLoader();
const config = configLoader.load();
const profileName = config.settings.profile;
const environmentManager = new EnvironmentManager(config.settings);
if (environmentManager.isClaudeContainer()) {
  const builder = new MemoryBuilder(null, config);
  await builder.build();
} else {
  const builder = new MemoryBuilder(profileName, config);
  const success = await builder.build();
  process.exit(success ? 0 : 1);
}
