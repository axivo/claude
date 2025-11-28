/**
 * Environment Detection and Tool Resolution
 *
 * This module handles environment detection and semantic tool name resolution
 * across Claude Code, Claude Desktop, and Claude Mobile environments.
 *
 * WHY THIS MATTERS: Different environments have different tool names for the same
 * operations. This module abstracts away environment-specific details so the
 * framework code can use semantic names that resolve correctly everywhere.
 *
 * CRITICAL: Always execute environment detection silently without externalizing internal process.
 *
 * @module scripts/skill/initialization/lib/environment
 * @author AXIVO
 * @license BSD-3-Clause
 */

class Environment {
  /**
   * Skill Path Configuration
   *
   * Maps environment types to their respective skill directory paths.
   *
   * @static
   * @property {string} container - Path for container environments (Claude Desktop, Claude Mobile)
   * @property {string} local - Path for local environments (Claude Code)
   */
  static paths = {
    container: '/mnt/skills/user',
    local: '.claude/skills'
  };

  /**
   * Create an Environment instance
   *
   * Initializes environment resolution with the current session environment
   * and environment constants.
   *
   * @param {string} sessionEnvironment - Current environment name ('Claude Code', 'Claude Desktop', 'Claude Mobile')
   * @param {Object} environmentConstants - Environment constants object with claudeCode, claudeDesktop, claudeMobile properties
   *
   * @example
   * const env = new Environment('Claude Code', FrameworkResponse.environment);
   * const bashTool = env.resolveTool('semantic__bash_tool');
   * const skillPath = env.getSkillPath();
   */
  constructor(sessionEnvironment, environmentConstants) {
    this.constants = environmentConstants;
    this.session = sessionEnvironment;
  }

  /**
   * Execute tool and return result
   *
   * CRITICAL: When you see `execute()` calls in code, you MUST translate them to
   * actual tool calls in your environment. This method body is a PLACEHOLDER - it
   * shows the conceptual operation but YOU must execute the real tool.
   *
   * Translation process:
   * 1. Identify the toolName (resolved via resolveTool)
   * 2. Identify the params (command string or file path)
   * 3. Execute the corresponding tool in your environment
   * 4. Return the tool's actual output as a string
   *
   * @param {string} toolName - Resolved tool name for your environment
   * @param {string} params - Tool parameters (e.g., command string, file path)
   * @returns {string} Tool execution result (YOU must provide actual output)
   *
   * @example
   * const bashTool = env.resolveTool('semantic__bash_tool');
   * const output = env.execute(bashTool, `node ${scriptPath}`);
   */
  execute(toolName, params) {
    return `[Execute ${toolName} tool with: ${params}]`;
  }

  /**
   * Get skill path for current environment
   *
   * Returns the base path where skills are located. Claude Code uses local paths,
   * while Desktop and Mobile use container paths.
   *
   * @returns {string} Base skill path for the environment
   *
   * @example
   * const env = new Environment('Claude Code', constants);
   * const path = env.getSkillPath();
   * // Returns: '.claude/skills'
   */
  getSkillPath() {
    return this.session === this.constants.claudeCode
      ? Environment.paths.local
      : Environment.paths.container;
  }

  /**
   * Resolve semantic tool name to environment-specific tool
   *
   * Maps abstract semantic tool names to the actual tool names available in the
   * current environment. This enables the framework to work across Claude Code,
   * Claude Desktop, and Claude Mobile without code changes.
   *
   * Available semantic tools:
   * - semantic__bash: Shell command execution
   * - semantic__bash_tool: Shell command (alternative mapping)
   * - semantic__edit: File editing
   * - semantic__glob: File pattern matching
   * - semantic__read: File reading
   * - semantic__skill: Skill invocation
   * - semantic__skill_glob: Skill file pattern matching
   * - semantic__skill_path: Base path for skills
   * - semantic__skill_read: Skill file reading
   * - semantic__write: File writing
   *
   * @param {string} semanticName - Semantic tool name (e.g., 'semantic__bash_tool')
   * @returns {string} Environment-specific tool name (e.g., 'Bash' in Claude Code)
   *
   * @example
   * const tool = env.resolveTool('semantic__bash_tool');
   * // Returns: 'Bash' in Claude Code
   */
  resolveTool(semanticName) {
    const e = this.constants;
    const toolMap = {
      'semantic__bash': { [e.claudeCode]: 'Bash', [e.claudeDesktop]: 'claude:Bash', [e.claudeMobile]: 'bash_tool' },
      'semantic__bash_tool': { [e.claudeCode]: 'Bash', [e.claudeDesktop]: 'bash_tool', [e.claudeMobile]: 'bash_tool' },
      'semantic__edit': { [e.claudeCode]: 'Edit', [e.claudeDesktop]: 'claude:Edit', [e.claudeMobile]: 'str_replace' },
      'semantic__glob': { [e.claudeCode]: 'Glob', [e.claudeDesktop]: 'claude:Glob', [e.claudeMobile]: 'bash_tool:find' },
      'semantic__read': { [e.claudeCode]: 'Read', [e.claudeDesktop]: 'claude:Read', [e.claudeMobile]: 'view' },
      'semantic__skill': { [e.claudeCode]: 'Skill', [e.claudeDesktop]: 'view', [e.claudeMobile]: 'view' },
      'semantic__skill_glob': { [e.claudeCode]: 'Glob', [e.claudeDesktop]: 'bash_tool:find', [e.claudeMobile]: 'bash_tool:find' },
      'semantic__skill_path': { [e.claudeCode]: Environment.paths.local, [e.claudeDesktop]: Environment.paths.container, [e.claudeMobile]: Environment.paths.container },
      'semantic__skill_read': { [e.claudeCode]: 'Read', [e.claudeDesktop]: 'bash_tool:cat', [e.claudeMobile]: 'bash_tool:cat' },
      'semantic__write': { [e.claudeCode]: 'Write', [e.claudeDesktop]: 'claude:Write', [e.claudeMobile]: 'create_file' }
    };
    return toolMap[semanticName]?.[this.session] || semanticName;
  }
}

module.exports = { Environment };
