#!/usr/bin/env node

const MemoryBuilder = require('./lib/core/Memory');

/**
 * Memory Builder Entry Point
 * 
 * Simple command-line interface to the MemoryBuilder class.
 * All orchestration logic is now contained in lib/Memory.js
 */

if (require.main === module) {
  const builder = new MemoryBuilder();
  builder.build().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Unexpected build error:', error.message);
    process.exit(1);
  });
}

module.exports = MemoryBuilder;
