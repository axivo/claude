/**
 * GitHub Actions workflow handler for memory configuration builds
 * 
 * @module lib/Workflow
 * @author AXIVO
 * @license BSD-3-Clause
 */

/**
 * Workflow handler for GitHub Actions memory configuration operations
 * 
 * @class Workflow
 */
class Workflow {
  /**
   * Creates a new Workflow instance
   * 
   * @param {Object} params - Workflow parameters
   * @param {Object} params.core - GitHub Actions core utilities
   * @param {Object} params.exec - GitHub Actions exec utilities
   */
  constructor({ core, exec }) {
    this.core = core;
    this.exec = exec;
  }

  /**
   * Build memory tool
   * 
   * @returns {Promise<void>}
   */
  async build() {
    try {
      process.chdir('./.claude/tools/memory');
      await this.exec.exec('npm', ['init', '-y'], { silent: true });
      await this.exec.exec('node', ['./lib/core/Package.js'], { silent: true });
      await this.exec.exec('npm', ['install'], { silent: true });
      await this.exec.exec('npm', ['run', 'build', '--silent']);
    } catch (error) {
      this.core.setFailed(`Workflow failed: ${error.message}`);
    }
  }
}

module.exports = Workflow;
