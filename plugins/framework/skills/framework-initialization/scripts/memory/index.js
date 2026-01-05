/**
 * Memory Builder Entry Point
 *
 * Command-line interface for the MemoryBuilder class
 *
 * @module scripts/memory
 * @author AXIVO
 * @license BSD-3-Clause
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import ConfigLoader from './lib/loaders/config.js';
import MemoryBuilder from './lib/core/memory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.chdir(__dirname);

const configLoader = new ConfigLoader();
const config = configLoader.load();
const { values } = parseArgs({
  options: {
    container: { type: 'boolean', short: 'c', default: false },
    help: { type: 'boolean', short: 'h', default: false },
    profile: { type: 'string', short: 'p', default: config.settings.profile }
  },
  strict: true
});
if (values.help) {
  console.log([
    `index.js v${config.settings.version}`,
    '',
    'Usage:',
    '  $ node index.js [options]',
    '',
    'Options:',
    '  -c, --container       Use container environment (default: autodetected)',
    '  -h, --help            Display this message',
    `  -p, --profile [name]  Build a specific profile (default: ${config.settings.profile})`
  ].join('\n'));
  process.exit(0);
}
const profileName = (values.container || values.profile !== config.settings.profile) ? values.profile : null;
const builder = new MemoryBuilder(profileName, config, values.container);
const success = await builder.build();
process.exit(success ? 0 : 1);
