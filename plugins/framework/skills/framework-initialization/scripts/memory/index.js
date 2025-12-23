/**
 * Memory Builder Entry Point
 *
 * Command-line interface to the MemoryBuilder class.
 * Changes working directory to script location for correct relative path resolution.
 * When profile is not specified, reads default from builder.yaml config.
 *
 * @module scripts/memory
 * @author AXIVO
 * @license BSD-3-Clause
 */
const path = require('path');
const { parseArgs } = require('util');
const ConfigLoader = require('./lib/loaders/config');
const MemoryBuilder = require('./lib/core/memory');
process.chdir(path.dirname(__filename));
if (require.main === module) {
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
  const success = builder.build();
  process.exit(success ? 0 : 1);
}
