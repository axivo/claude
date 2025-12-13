/**
 * Memory Builder Entry Point
 *
 * Command-line interface to the MemoryBuilder class.
 * Changes working directory to script location for correct relative path resolution.
 *
 * @module scripts/memory
 * @author AXIVO
 * @license BSD-3-Clause
 */
const path = require('path');
const { parseArgs } = require('util');
const MemoryBuilder = require('./lib/core/memory');
const projectRoot = process.cwd();
process.chdir(path.dirname(__filename));
if (require.main === module) {
  const { values } = parseArgs({
    options: {
      container: {
        type: 'boolean',
        short: 'c',
        default: false
      },
      help: {
        type: 'boolean',
        short: 'h',
        default: false
      },
      profile: {
        type: 'string',
        short: 'p'
      }
    },
    strict: true
  });
  if (values.help) {
    console.log([
      'Usage: node memory/index.js [options]',
      '',
      'Options:',
      '  -c, --container       Force container environment for instructions',
      '  -h, --help            Show this help message',
      '  -p, --profile [name]  Build a specific profile (e.g., DEVELOPER)'
    ].join('\n'));
    process.exit(0);
  }
  const builder = new MemoryBuilder(values.profile, projectRoot, {}, values.container);
  const success = builder.build();
  process.exit(success ? 0 : 1);
}
