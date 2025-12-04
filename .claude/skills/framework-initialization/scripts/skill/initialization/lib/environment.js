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
   * Skill Name Constant
   *
   * The name of this skill, used for path resolution across all classes.
   *
   * @static
   * @type {string}
   */
  static skillName = 'framework-initialization';

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
   * HOW IT WORKS:
   * Semantic tools are universal - they work in all environments and automatically
   * resolve to the correct environment-specific tool. The path you're accessing
   * tells you what filesystem you're working with, not which tool to use.
   *
   * PATH DETECTION (informational only):
   * - Path starts with /mnt/skills/ → container filesystem (skill resources)
   * - Any other path → user filesystem (diary, conversation logs, documents)
   *
   * @param {string} semanticName - Semantic tool name (e.g., 'semantic__read')
   * @returns {string} Environment-specific tool name
   *
   * @example
   * // Reading a file (works for any path - container or user filesystem)
   * const readTool = env.resolveTool('semantic__read');
   * // Returns: 'Read' (Code), 'claude:Read' (Desktop), 'view' (Mobile)
   *
   * @example
   * // Writing a diary entry
   * const writeTool = env.resolveTool('semantic__write');
   * // Returns: 'Write' (Code), 'claude:Write' (Desktop), 'create_file' (Mobile)
   */
  resolveTool(semanticName) {
    const e = this.constants;
    const scriptPath = `${this.getSkillPath()}/${Environment.skillName}/scripts/memory`;
    const toolMap = {
      'semantic__bash': { [e.claudeCode]: 'Bash', [e.claudeDesktop]: 'claude:Bash', [e.claudeMobile]: 'bash_tool' },
      'semantic__bash_tool': { [e.claudeCode]: 'Bash', [e.claudeDesktop]: 'bash_tool', [e.claudeMobile]: 'bash_tool' },
      'semantic__edit': { [e.claudeCode]: 'Edit', [e.claudeDesktop]: 'claude:Edit', [e.claudeMobile]: 'str_replace' },
      'semantic__get_time': { [e.claudeCode]: `Bash:node ${scriptPath}`, [e.claudeDesktop]: `bash_tool:node ${scriptPath}`, [e.claudeMobile]: `bash_tool:node ${scriptPath}` },
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
