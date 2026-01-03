/**
 * Reflection Reader
 *
 * Fetches diary entries from axivo/claude-reflections repository
 *
 * @module lib/core/Reflection
 * @author AXIVO
 * @license BSD-3-Clause
 */
import { request } from '../vendor/octokit-request.min.mjs';
import MemoryBuilderError from './error.js';

/**
 * Fetches diary entries from GitHub repository
 *
 * @class Reflection
 */
class Reflection {
  /**
   * Creates Reflection instance
   *
   * @param {Object} config - Configuration object
   */
  constructor(config) {
    const { branch, extension, name, organization, path } = config.settings.reflections.repository;
    this.branch = branch;
    this.extension = extension;
    this.owner = organization;
    this.path = path;
    this.repo = name;
  }

  /**
   * Fetches directory contents from GitHub API
   *
   * @private
   * @param {string} [subPath=''] - Subpath within repository path
   * @returns {Promise<Array|null>} Array of items or null if not found
   * @throws {MemoryBuilderError} When API request fails
   */
  async #fetchContents(subPath = '') {
    const fullPath = this.path + (subPath ? '/' + subPath : '');
    try {
      const response = await request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: fullPath,
        ref: this.branch
      });
      return response.data;
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw new MemoryBuilderError(`GitHub API error: ${error.message}`, 'ERR_API_REQUEST');
    }
  }

  /**
   * Fetches raw file content from GitHub
   *
   * @private
   * @param {string} filePath - File path within repository path
   * @returns {Promise<string|null>} File content or null if not found
   * @throws {MemoryBuilderError} When request fails
   */
  async #fetchRaw(filePath) {
    const fullPath = this.path + '/' + filePath;
    try {
      const response = await request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: fullPath,
        ref: this.branch,
        headers: {
          'Accept': 'application/vnd.github.raw+json'
        }
      });
      return response.data;
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw new MemoryBuilderError(`GitHub API error: ${error.message}`, 'ERR_RAW_REQUEST');
    }
  }

  /**
   * Fetches content for multiple file paths
   *
   * @private
   * @param {Array} files - Array of full paths to fetch
   * @returns {Promise<Object>} Object with entries array of { path, content }
   */
  async #fetchEntries(files) {
    const entries = [];
    for (const file of files) {
      const filePath = file.slice(this.path.length + 1);
      const content = await this.#fetchRaw(filePath);
      if (content) {
        entries.push({ path: file, content });
      }
    }
    return { entries };
  }

  /**
   * Gets diary entries
   *
   * @param {string} [date=''] - Date in YYYY, YYYY/MM, or YYYY/MM/DD format, defaults to latest
   * @returns {Promise<Object>} Object with entries array of { path, content }
   */
  async get(date = '', latest = !date) {
    const { entries: items } = await this.list(date);
    const files = items.filter(e => e.endsWith(this.extension));
    const dirs = items.filter(e => e.endsWith('/'));
    if (files.length) {
      const toFetch = latest ? files.slice(-1) : files;
      return this.#fetchEntries(toFetch);
    }
    if (dirs.length && latest) {
      const latestDir = dirs[dirs.length - 1];
      return this.get(latestDir.slice(this.path.length + 1, -1), true);
    }
    if (date && items.length === 0) {
      const filePath = date.endsWith(this.extension) ? date : `${date}${this.extension}`;
      return this.#fetchEntries([`${this.path}/${filePath}`]);
    }
    return { entries: [] };
  }

  /**
   * Lists all entries recursively
   *
   * @param {string} [subPath=''] - Subpath to start from
   * @returns {Promise<Object>} Object with entries array of paths
   */
  async list(subPath = '') {
    const items = await this.#fetchContents(subPath);
    if (!items) {
      if (subPath) {
        const filePath = `${this.path}/${subPath}${this.extension}`;
        const content = await this.#fetchRaw(`${subPath}${this.extension}`);
        if (content) {
          return { entries: [filePath] };
        }
      }
      return { entries: [] };
    }
    const prefix = `${this.path}${subPath ? '/' + subPath : ''}`;
    const entries = [];
    for (const item of items) {
      if (item.type === 'dir') {
        const nested = await this.list(subPath ? `${subPath}/${item.name}` : item.name);
        entries.push(...nested.entries);
      } else if (item.type === 'file' && item.name.endsWith(this.extension)) {
        entries.push(`${prefix}/${item.name}`);
      }
    }
    return { entries: entries.sort() };
  }
}

export default Reflection;
