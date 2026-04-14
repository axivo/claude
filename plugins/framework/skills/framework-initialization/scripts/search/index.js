/**
 * Search Entry Point
 *
 * Command-line interface for searching documentation and reflections via Algolia
 *
 * @module scripts/search
 * @author AXIVO
 * @license BSD-3-Clause
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import ConfigLoader from '../shared/loaders/config.js';
import EnvironmentManager from '../shared/core/environment.js';
import HttpClient from '../shared/core/http.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.chdir(path.join(__dirname, '../memory'));

const configLoader = new ConfigLoader();
const config = configLoader.load();
const { search } = config.settings;
let values;
try {
  ({ values } = parseArgs({
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      limit: { type: 'string', short: 'l', default: String(search.limit) },
      query: { type: 'string', short: 'q', default: '' }
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
    '  -h, --help            Display this message',
    `  -l, --limit [number]  Maximum results per group (default: ${search.limit})`,
    '  -q, --query [text]    Search query'
  ].join('\n'));
  process.exit(0);
}
if (!values.query) {
  console.error(JSON.stringify({ error: "Search query is required. Use -q 'query'" }, null, 2));
  process.exit(1);
}
const limit = Math.max(1, parseInt(values.limit, 10) || search.limit);
const { appId, apiKey, indexName } = search.service;
const environmentManager = new EnvironmentManager(config.settings);
const isContainer = environmentManager.isClaudeContainer();
const http = new HttpClient({ isContainer });
try {
  const response = await http.fetch(`https://${appId}-dsn.algolia.net/1/indexes/${indexName}/query`, {
    method: 'POST',
    headers: {
      'X-Algolia-Application-Id': appId,
      'X-Algolia-API-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      params: [
        `query=${encodeURIComponent(values.query)}`,
        `hitsPerPage=${limit}`,
        'facetFilters=["section:claude"]',
        `attributesToSnippet=content:${search.snippet.words}`,
        'highlightPreTag=',
        'highlightPostTag='
      ].join('&')
    })
  });
  const data = await response.json();
  const results = (data.hits || []).map(hit => {
    const result = {};
    const category = hit.hierarchy?.lvl0;
    if (category) {
      result.category = category;
    }
    const title = hit.hierarchy?.lvl1 || hit.hierarchy?.lvl0;
    if (title) {
      result.title = title;
    }
    const heading = hit.hierarchy?.lvl3 || hit.hierarchy?.lvl2;
    if (heading) {
      result.heading = heading;
    }
    if (hit.url) {
      result.url = hit.url;
    }
    const snippet = (hit._snippetResult?.content?.value || '')
      .replace(/<[^>]*>/g, '')
      .replace(/\r?\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (snippet) {
      result.snippet = snippet;
    }
    return result;
  });
  console.log(JSON.stringify({
    total: data.nbHits || 0,
    results,
    attribution: 'Powered by Algolia - https://www.algolia.com/ref/docsearch/'
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exit(1);
}
