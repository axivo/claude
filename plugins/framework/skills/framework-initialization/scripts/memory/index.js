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
import OutputGenerator from './lib/generators/output.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.chdir(__dirname);

const configLoader = new ConfigLoader();
const config = configLoader.load();
const { values } = parseArgs({
  options: {
    container: { type: 'boolean', short: 'c', default: false },
    help: { type: 'boolean', short: 'h', default: false },
    minify: { type: 'boolean', short: 'm', default: false },
    profile: { type: 'string', short: 'p', default: config.settings.profile },
    session: { type: 'boolean', short: 's', default: false }
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
    '  -m, --minify          Minify JS files in packaged zip archives',
    `  -p, --profile [name]  Build a specific profile (default: ${config.settings.profile})`,
    '  -s, --session         Update and display session information'
  ].join('\n'));
  process.exit(0);
}
if (values.session) {
  const outputGenerator = new OutputGenerator(config, values.container);
  const sessionUuid = outputGenerator.detectSessionUuid();
  const state = await outputGenerator.updateSessionState(sessionUuid);
  console.log(JSON.stringify(state, null, 2));
  process.exit(0);
}
const profileName = (values.container || values.profile !== config.settings.profile) ? values.profile : null;
const builder = new MemoryBuilder(profileName, config, values.container, values.minify);
const success = await builder.build();
process.exit(success ? 0 : 1);
