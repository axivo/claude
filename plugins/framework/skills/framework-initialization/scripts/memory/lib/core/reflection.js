/**
 * Reflection Reader
 *
 * Fetches diary entries from axivo/claude-reflections repository
 *
 * @module lib/core/Reflection
 * @author AXIVO
 * @license BSD-3-Clause
 */
import md from '../vendor/markdown-ast.min.mjs';
import HttpClient from './http.js';
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
   * @param {Object} config - Configuration object (optional)
   */
  constructor(config = {}, isContainer = false) {
    this.config = config;
    const { branch, extension, name, organization, path } = this.config.settings.reflections.repository;
    this.branch = branch;
    this.extension = extension;
    this.owner = organization;
    this.path = path;
    this.repo = name;
    this.request = new HttpClient({ isContainer }).request;
  }

  /**
   * Fetches directory with GitHub API
   *
   * @private
   * @param {string} [subPath] - Subpath within repository path
   * @returns {Promise<Array|null>} Array of items or null if not found
   * @throws {MemoryBuilderError} When API request fails
   */
  async #fetchDirectory(subPath = '') {
    const fullPath = subPath ? `${this.path}/${subPath}` : this.path;
    try {
      const response = await this.request('GET /repos/{owner}/{repo}/contents/{path}', {
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
   * Fetches reflection entries for multiple file paths
   *
   * @private
   * @param {Array} filePaths - Array of full paths to fetch
   * @param {boolean} [raw] - Return raw markdown instead of AST
   * @returns {Promise<Object>} Object with entries array of { path, reflection }
   */
  async #fetchEntries(filePaths, raw = false) {
    const entries = [];
    for (const file of filePaths) {
      const filePath = file.slice(this.path.length + 1);
      const content = await this.#fetchReflection(filePath);
      if (content) {
        entries.push({ path: file, reflection: raw ? content : md(content) });
      }
    }
    return { entries };
  }

  /**
   * Fetches reflection content with GitHub API
   *
   * @private
   * @param {string} filePath - File path within repository path
   * @returns {Promise<string|null>} Reflection content or null if not found
   * @throws {MemoryBuilderError} When request fails
   */
  async #fetchReflection(filePath) {
    const fullPath = `${this.path}/${filePath}`;
    try {
      const response = await this.request('GET /repos/{owner}/{repo}/contents/{path}', {
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
      throw new MemoryBuilderError(`GitHub API error: ${error.message}`, 'ERR_API_REQUEST');
    }
  }

  /**
   * Gets reflection entries
   *
   * @param {string} [date] - Date in YYYY, YYYY/MM, or YYYY/MM/DD format, defaults to latest
   * @param {boolean} [latest] - Fetch only the latest entry
   * @param {boolean} [raw] - Return raw markdown instead of AST
   * @returns {Promise<Object>} Object with entries array of { path, reflection }
   */
  async get(date = '', latest = !date, raw = false) {
    const { entries: items } = await this.list(date);
    const files = items.filter(e => e.endsWith(this.extension));
    const dirs = items.filter(e => e.endsWith('/'));
    if (files.length) {
      const toFetch = latest ? files.slice(-1) : files;
      return this.#fetchEntries(toFetch, raw);
    }
    if (dirs.length && latest) {
      const latestDir = dirs[dirs.length - 1];
      return this.get(latestDir.slice(this.path.length + 1, -1), true, raw);
    }
    if (date && items.length === 0) {
      const filePath = date.endsWith(this.extension) ? date : `${date}${this.extension}`;
      return this.#fetchEntries([`${this.path}/${filePath}`], raw);
    }
    return { entries: [] };
  }

  /**
   * Retrieves image base64 content with GitHub API
   *
   * @param {string} filePath - File path within repository path
   * @returns {Promise<Object>} Object with image { path, content, encoding }
   * @throws {MemoryBuilderError} When request fails
   */
  async image(filePath) {
    const fullPath = `${this.path}/${filePath}`;
    try {
      const response = await this.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: fullPath,
        ref: this.branch
      });
      return {
        image: {
          path: filePath,
          content: response.data.content.replace(/\n/g, ''),
          encoding: response.data.encoding
        }
      };
    } catch (error) {
      if (error.status === 404) {
        return { image: null };
      }
      throw new MemoryBuilderError(`GitHub API error: ${error.message}`, 'ERR_API_REQUEST');
    }
  }

  /**
   * Lists all reflection entries recursively
   *
   * @param {string} [subPath] - Subpath to start from
   * @returns {Promise<Object>} Object with entries array of paths
   */
  async list(subPath = '') {
    const items = await this.#fetchDirectory(subPath);
    if (!items) {
      if (subPath) {
        const filePath = `${this.path}/${subPath}${this.extension}`;
        const content = await this.#fetchReflection(`${subPath}${this.extension}`);
        if (content) {
          return { entries: [filePath] };
        }
      }
      return { entries: [] };
    }
    const prefix = subPath ? `${this.path}/${subPath}` : this.path;
    const entries = [];
    for (const item of items) {
      if (item.type === 'dir') {
        const nested = await this.list(subPath ? `${subPath}/${item.name}` : item.name);
        entries.push(...nested.entries);
      } else if (item.type === 'file' && item.name.endsWith(this.extension)) {
        entries.push(`${prefix}/${item.name}`);
      }
    }
    return {
      entries: entries.sort((a, b) => {
        const isDigitFile = path => /^\d/.test(path.split('/').pop());
        return isDigitFile(a) - isDigitFile(b);
      })
    };
  }
}

export default Reflection;
