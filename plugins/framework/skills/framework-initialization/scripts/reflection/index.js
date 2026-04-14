/**
 * Reflection Reader Entry Point
 *
 * Command-line interface for the Reflection class
 *
 * @module scripts/reflection
 * @author AXIVO
 * @license BSD-3-Clause
 */
import { parseArgs } from 'util';
import ConfigLoader from '../shared/loaders/config.js';
import EnvironmentManager from '../shared/core/environment.js';
import Reflection from './lib/core/reflection.js';

const configLoader = new ConfigLoader();
const config = configLoader.load();
let values;
try {
  ({ values } = parseArgs({
    options: {
      date: { type: 'string', short: 'd', default: '' },
      entry: { type: 'string', short: 'e', default: '0' },
      help: { type: 'boolean', short: 'h', default: false },
      image: { type: 'string', short: 'i', default: '' },
      list: { type: 'boolean', short: 'l', default: false },
      page: { type: 'string', short: 'p', default: '1' }
    },
    strict: true
  }));
} catch {
  console.error(JSON.stringify({ error: 'Invalid arguments. Use -h for help' }, null, 2));
  process.exit(1);
}
if (values.help) {
  console.log([
    `index.js v${config.settings.version}`,
    '',
    'Usage:',
    '  $ node index.js [options]',
    '',
    'Options:',
    '  -d, --date [date]     Date in YYYY/MM/DD format (default: latest)',
    '  -e, --entry [number]  Entry number to read content',
    '  -h, --help            Display this message',
    '  -i, --image [path]    Get image with path in YYYY/MM/media/name.extension format',
    '  -l, --list            List available entries',
    `  -p, --page [number]   Page number for all entries listing (default: 1, ${config.settings.reflections.limit} per page)`
  ].join('\n'));
  process.exit(0);
}
const environmentManager = new EnvironmentManager(config.settings);
const reflection = new Reflection(config, environmentManager);
try {
  let response;
  if (values.image) {
    response = await reflection.image(values.image);
  } else if (values.list) {
    response = values.date
      ? await reflection.listByDate(values.date)
      : await reflection.list({ limit: config.settings.reflections.limit, index: Math.max(1, parseInt(values.page, 10) || 1) });
  } else if (values.date) {
    response = await reflection.get(values.date, parseInt(values.entry, 10));
  } else {
    response = await reflection.latest();
  }
  console.log(JSON.stringify(response, null, 2));
} catch (error) {
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exit(1);
}
