/**
 * Reflection Reader Entry Point
 *
 * Command-line interface to the Reflection class.
 * Fetches diary entries from claude-reflections repository.
 *
 * @module scripts/reflection
 * @author AXIVO
 * @license BSD-3-Clause
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import ConfigLoader from '../memory/lib/loaders/config.js';
import Reflection from '../memory/lib/core/reflection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.chdir(path.join(__dirname, '../memory'));

const configLoader = new ConfigLoader();
const config = configLoader.load();
const { values } = parseArgs({
  options: {
    date: { type: 'string', short: 'd', default: '' },
    help: { type: 'boolean', short: 'h', default: false },
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
    '  -d, --date [date]  Date in YYYY/MM/DD format (default: latest)',
    '  -h, --help         Display this message',
    '  -l, --list         List available entries'
  ].join('\n'));
  process.exit(0);
}
const reflection = new Reflection(config);
try {
  const result = values.list ? await reflection.list(values.date) : await reflection.get(values.date);
  for (const entry of result.entries.filter(e => e.reflection)) {
    entry.reflection = JSON.stringify(entry.reflection);
  }
  let output = JSON.stringify(result, null, 2);
  for (const entry of result.entries.filter(e => e.reflection)) {
    output = output.replace(JSON.stringify(entry.reflection), entry.reflection);
  }
  console.log(output);
} catch (error) {
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exit(1);
}
