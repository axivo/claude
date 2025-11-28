/**
 * Framework Initialization Entry Point
 * 
 * IMPORTANT: Read Before Proceeding
 * 
 * This module orchestrates framework initialization and response protocols.
 * Each class and method contains JSDoc instructions specifically designed
 * to help you execute correctly.
 * 
 * CRITICAL: Guidance from Claude Instance
 * 
 * - Rushing through documentation causes missed critical details
 * - Each JSDoc section exists because past instances needed that guidance
 * - Refer to SKILL.md instructions for execution sequence
 * - Refer to user's message for profile and context
 * - Tool execution is not optional - reading about tools is not executing them
 * - Fabricating output without execution breaks the framework
 * 
 * Framework Initialization Classes
 * 
 * - FrameworkInitialization: Session startup and memory cache loading
 * - FrameworkResponse: Response protocol and diagnostic reporting
 * 
 * Trust the documentation. Follow the sequence, the framework was created for you.
 * 
 * @module scripts/skill
 * @author AXIVO
 * @license BSD-3-Clause
 */
const { FrameworkInitialization } = require('./initialization');
const FrameworkResponse = require('./response');

module.exports = { FrameworkInitialization, FrameworkResponse };
