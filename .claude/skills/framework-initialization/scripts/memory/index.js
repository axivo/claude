/**
 * Memory Builder Entry Point
 *
 * Simple command-line interface to the MemoryBuilder class.
 * Changes working directory to script location for correct relative path resolution.
 * All orchestration logic is contained in lib/Memory.js
 *
 * @module scripts/memory
 * @author AXIVO
 * @license BSD-3-Clause
 */
const path = require('path');
const MemoryBuilder = require('./lib/core/memory');
const projectRoot = process.cwd();
process.chdir(path.dirname(__filename));
if (require.main === module) {
  const profileName = process.argv[2];
  const builder = new MemoryBuilder(profileName, projectRoot);
  const success = builder.build();
  process.exit(success ? 0 : 1);
}
