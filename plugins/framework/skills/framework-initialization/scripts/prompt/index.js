/**
 * Prompt Reminder Entry Point
 *
 * Command-line interface for UserPromptSubmit hook reinforcement messages
 *
 * @module scripts/prompt
 * @author AXIVO
 * @license BSD-3-Clause
 */
import { randomInt } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import ConfigLoader from '../memory/lib/loaders/config.js';
import TimeGenerator from '../memory/lib/generators/time.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.chdir(path.join(__dirname, '../memory'));

const messages = JSON.parse(fs.readFileSync(path.join(__dirname, 'prompt.json'), 'utf8'));

let hookEventName = 'UserPromptSubmit';
if (!process.stdin.isTTY) {
  try {
    const stdinBuffer = fs.readFileSync(0, 'utf8');
    if (stdinBuffer.trim()) {
      const hookInput = JSON.parse(stdinBuffer);
      if (hookInput && typeof hookInput.hook_event_name === 'string') {
        hookEventName = hookInput.hook_event_name;
      }
    }
  } catch { }
}

const configLoader = new ConfigLoader();
const config = configLoader.load();
const { values } = parseArgs({
  options: {
    help: { type: 'boolean', short: 'h', default: false },
    key: { type: 'string', short: 'k', default: '' },
    message: { type: 'string', short: 'm', default: '' }
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
    '  -h, --help            Display this message',
    '  -k, --key [name]      Emit a specific reminder by category.key (default: random)',
    '  -m, --message [text]  Emit a custom reminder with literal text',
    '',
    'Available keys:',
    ...Object.entries(messages)
      .filter(([, v]) => typeof v === 'object')
      .flatMap(([cat, obj]) =>
        Object.keys(obj).map(k => `  ${cat}.${k}`)
      )
  ].join('\n'));
  process.exit(0);
}

let selectedMessage;
if (values.message) {
  selectedMessage = values.message;
} else if (values.key) {
  const [category, key] = values.key.split('.');
  if (!messages[category] || !messages[category][key]) {
    process.exit(0);
  }
  selectedMessage = messages[category][key];
} else {
  const keys = Object.keys(messages.prompt);
  selectedMessage = messages.prompt[keys[randomInt(0, keys.length)]];
}
const timeGenerator = new TimeGenerator(config);
const time = timeGenerator.generate();
const timestamp = typeof time.datetime === 'string' ? time.datetime : time.datetime.current;
const reminder = `${timestamp} - ${messages.message.architect}\nArchitect Message: ${selectedMessage}`;
if (hookEventName === 'UserPromptSubmit') {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName,
      additionalContext: reminder
    }
  }));
} else {
  console.log(reminder);
}
