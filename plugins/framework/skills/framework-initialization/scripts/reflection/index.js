/**
 * Reflection Reader Entry Point
 *
 * Command-line interface for the Reflection class
 *
 * @module scripts/reflection
 * @author AXIVO
 * @license BSD-3-Clause
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import ConfigLoader from '../memory/lib/loaders/config.js';
import { EnvironmentManager } from '../memory/lib/core/index.js';
import Reflection from '../memory/lib/core/reflection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.chdir(path.join(__dirname, '../memory'));

const configLoader = new ConfigLoader();
const config = configLoader.load();
const { values } = parseArgs({
  options: {
    ast: { type: 'boolean', short: 'a', default: false },
    date: { type: 'string', short: 'd', default: '' },
    help: { type: 'boolean', short: 'h', default: false },
    image: { type: 'string', short: 'i', default: '' },
    list: { type: 'boolean', short: 'l', default: false }
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
    '  -a, --ast           Output AST markdown',
    '  -d, --date [date]   Date in YYYY/MM/DD format (default: latest)',
    '  -h, --help          Display this message',
    '  -i, --image [path]  Get base64 image with path in YYYY/MM/images/name.extension format',
    '  -l, --list          List available entries'
  ].join('\n'));
  process.exit(0);
}
const environmentManager = new EnvironmentManager(config.settings);
const reflection = new Reflection(config, environmentManager.isClaudeContainer());
try {
  let result;
  if (values.image) {
    result = await reflection.image(values.image);
  } else if (values.list) {
    result = await reflection.list(values.date);
  } else {
    result = await reflection.get(values.date, undefined, !values.ast);
  }
  if (result.entries) {
    for (const entry of result.entries.filter(e => e.reflection)) {
      entry.reflection = JSON.stringify(entry.reflection);
    }
  }
  let output = JSON.stringify(result, null, 2);
  if (result.entries) {
    for (const entry of result.entries.filter(e => e.reflection)) {
      output = output.replace(JSON.stringify(entry.reflection), entry.reflection);
    }
  }
  console.log(output);
} catch (error) {
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exit(1);
}
