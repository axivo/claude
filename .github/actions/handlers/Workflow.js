/**
 * Workflow handler for memory configuration operations
 * 
 * @module handlers/Workflow
 * @author AXIVO
 * @license BSD-3-Clause
 */
const Action = require('../core/Action');
const config = require('../config');
const FileService = require('../services/File');
const GitService = require('../services/Git');
const GitHubService = require('../services/Github');
const IssueService = require('../services/Issue');
const LabelService = require('../services/Label');
const ShellService = require('../services/Shell');
const TemplateService = require('../services/Template');
const MemoryConfig = require('../../../.claude/memory/lib/loaders/Config');

/**
 * Workflow handler for memory configuration build operations
 * 
 * Provides orchestration for repository configuration, memory tool building,
 * signed commits, and issue reporting for memory workflows.
 * 
 * @class WorkflowHandler
 */
class WorkflowHandler extends Action {
  /**
   * Creates a new WorkflowHandler instance
   * 
   * @param {Object} params - Handler parameters
   */
  constructor(params) {
    params.config = config;
    super(params);
    this.fileService = new FileService(params);
    this.gitService = new GitService(params);
    this.gitHubService = new GitHubService(params);
    this.issueService = new IssueService(params);
    this.labelService = new LabelService(params);
    this.shellService = new ShellService(params);
    this.templateService = new TemplateService(params);
    this.memoryConfig = new MemoryConfig();
  }

  /**
   * Configures repository
   * 
   * @returns {Promise<void>}
   */
  async configureRepository() {
    return this.execute('configure repository', async () => {
      this.logger.info('Configuring repository for workflow operations...');
      await this.gitService.configure();
      this.logger.info('Repository configuration complete');
    });
  }

  /**
   * Builds memory graph
   * 
   * @returns {Promise<void>}
   */
  async build() {
    return this.execute('build memory configuration', async () => {
      if (this.config.get('issue.updateLabels')) await this.labelService.update();
      this.logger.info('Building memory graph...');
      const toolPath = '.claude/memory';
      process.chdir(toolPath);
      await this.shellService.execute('npm', ['init', '-y']);
      await this.shellService.execute('node', ['./lib/core/Package.js']);
      await this.shellService.execute('npm', ['install']);
      await this.shellService.execute('npm', ['run', 'build', '--silent'], { silent: false });
      process.chdir(process.env.GITHUB_WORKSPACE);
      const path = require('path');
      const memoryConfig = this.memoryConfig.load();
      const memoryPath = path.join(toolPath, memoryConfig.build.outputPath);
      const gitStatus = await this.gitService.getStatus();
      const changedFiles = [...gitStatus.modified, ...gitStatus.untracked];
      const files = changedFiles.includes(memoryPath) ? [memoryPath] : [];
      if (!files.length) {
        this.logger.info('No memory graph changes to commit');
        return;
      }
      const branch = process.env.GITHUB_HEAD_REF;
      await this.gitService.signedCommit(branch, files, this.config.get('workflow.commitMessage'));
      this.logger.info('Successfully built memory graph');
    });
  }

  /**
   * Reports workflow issues
   * 
   * @returns {Promise<void>}
   */
  async reportIssue() {
    return this.execute('report workflow issue', async () => {
      this.logger.info('Checking for workflow issues...');
      const templatePath = this.config.get('workflow.template');
      const templateContent = await this.fileService.read(templatePath);
      const issue = await this.issueService.report(
        this.context,
        {
          content: templateContent,
          service: this.templateService
        }
      );
      let message = 'No workflow issues to report';
      if (issue) message = 'Successfully reported workflow issue';
      this.logger.info(`${message}`);
    }, false);
  }
}

module.exports = WorkflowHandler;
