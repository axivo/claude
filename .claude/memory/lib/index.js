/**
 * Memory Builder Library
 * 
 * Main module exports for the simplified memory builder system
 * 
 * @module lib
 * @author AXIVO
 * @license BSD-3-Clause
 */
const core = require('./core');
const generators = require('./generators');
const loaders = require('./loaders');
const MemoryBuilder = require('./core/Memory');
const processors = require('./processors');

module.exports = {
  core,
  generators,
  loaders,
  MemoryBuilder,
  processors
};
