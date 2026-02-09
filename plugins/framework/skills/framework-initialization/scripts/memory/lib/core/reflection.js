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
   * @param {Object} config - Configuration object
   * @param {boolean} [isContainer] - Whether running in container environment
   * @param {Object} [auth] - GitHubAuth instance for authenticated requests
   */
  constructor(config = {}, isContainer = false, auth = null) {
    this.config = config;
    const { branch, extension, name, organization, path } = this.config.settings.reflections.repository;
    this.branch = branch;
    this.extension = extension;
    this.owner = organization;
    this.path = path.startsWith('/') ? path.slice(1) : path;
    this.rate = null;
    this.repo = name;
    this.request = new HttpClient({ isContainer, auth }).request;
  }

  /**
   * Fetches reflection entries for multiple file paths
   *
   * @private
   * @param {Array<string>} filePaths - Array of full paths to fetch
   * @param {boolean} [raw] - Return raw markdown instead of AST
   * @returns {Promise<Object>} Object with results array of { path, reflection } and rate
   */
  async #fetchEntries(filePaths, raw = false) {
    const results = [];
    for (const file of filePaths) {
      const filePath = file.slice(this.path.length + 1);
      const content = await this.#fetchReflection(filePath);
      if (content) {
        results.push({ path: file, reflection: raw ? content : md(content) });
      }
    }
    return { results, rate: this.rate };
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
      this.#setRate(response.headers);
      return response.data;
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw new MemoryBuilderError(`GitHub API error: ${error.message}`, 'ERR_API_REQUEST');
    }
  }

  /**
   * Gets latest reflection entry using Git Trees API
   *
   * @private
   * @param {boolean} [raw] - Return raw markdown instead of AST
   * @returns {Promise<Object>} Object with results array of { path, reflection }
   */
  async #getLatest(raw = false) {
    try {
      const response = await this.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
        owner: this.owner,
        repo: this.repo,
        tree_sha: this.branch,
        recursive: '1'
      });
      this.#setRate(response.headers);
      const isDigitFile = path => /^\d/.test(path.split('/').pop());
      const files = response.data.tree
        .filter(item => item.type === 'blob' && item.path.startsWith(this.path) && item.path.endsWith(this.extension))
        .map(item => item.path)
        .sort((a, b) => isDigitFile(a) - isDigitFile(b));
      if (files.length === 0) {
        return { results: [], rate: this.rate };
      }
      const latestPath = files[files.length - 1];
      const filePath = latestPath.slice(this.path.length + 1);
      const content = await this.#fetchReflection(filePath);
      if (content) {
        return {
          results: [{ path: latestPath, reflection: raw ? content : md(content) }],
          rate: this.rate
        };
      }
      return { results: [], rate: this.rate };
    } catch (error) {
      throw new MemoryBuilderError(`GitHub API error: ${error.message}`, 'ERR_API_REQUEST');
    }
  }

  /**
   * Sets rate limit from response headers
   *
   * @private
   * @param {Object} headers - Response headers
   */
  #setRate(headers) {
    if (!headers) {
      return;
    }
    this.rate = {
      limit: parseInt(headers['x-ratelimit-limit'], 10),
      remaining: parseInt(headers['x-ratelimit-remaining'], 10),
      resetSeconds: parseInt(headers['x-ratelimit-reset'], 10) - Math.floor(Date.now() / 1000),
      used: parseInt(headers['x-ratelimit-used'], 10)
    };
  }

  /**
   * Gets reflection entries
   *
   * @param {string} [date] - Date in YYYY, YYYY/MM, or YYYY/MM/DD format, defaults to latest
   * @param {boolean} [latest] - Fetch only the latest entry
   * @param {boolean} [raw] - Return raw markdown instead of AST
   * @returns {Promise<Object>} Object with results array of { path, reflection }
   */
  async get(date = '', latest = !date, raw = false) {
    if (latest && !date) {
      return this.#getLatest(raw);
    }
    const { results: items } = await this.list(date);
    const files = items.filter(e => e.endsWith(this.extension));
    if (files.length) {
      const toFetch = latest ? files.slice(-1) : files;
      return this.#fetchEntries(toFetch, raw);
    }
    if (date && items.length === 0) {
      const filePath = date.endsWith(this.extension) ? date : `${date}${this.extension}`;
      return this.#fetchEntries([`${this.path}/${filePath}`], raw);
    }
    return { results: [], rate: this.rate };
  }

  /**
   * Retrieves image base64 content with GitHub API
   *
   * @param {string} filePath - File path within repository path
   * @returns {Promise<Object>} Object with image { path, content, encoding } and rate
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
      this.#setRate(response.headers);
      return {
        image: {
          path: filePath,
          content: response.data.content.replace(/\n/g, ''),
          encoding: response.data.encoding
        },
        rate: this.rate
      };
    } catch (error) {
      if (error.status === 404) {
        return { image: null, rate: this.rate };
      }
      throw new MemoryBuilderError(`GitHub API error: ${error.message}`, 'ERR_API_REQUEST');
    }
  }

  /**
   * Lists all reflection entries using Git Trees API
   *
   * @param {string} [subPath] - Subpath to filter by
   * @returns {Promise<Object>} Object with results array of paths and rate
   */
  async list(subPath = '') {
    try {
      const response = await this.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
        owner: this.owner,
        repo: this.repo,
        tree_sha: this.branch,
        recursive: '1'
      });
      this.#setRate(response.headers);
      const prefix = subPath ? `${this.path}/${subPath}` : this.path;
      const isDigitFile = path => /^\d/.test(path.split('/').pop());
      const results = response.data.tree
        .filter(item => item.type === 'blob' && item.path.startsWith(prefix) && item.path.endsWith(this.extension))
        .map(item => item.path)
        .sort((a, b) => isDigitFile(a) - isDigitFile(b));
      return { results, rate: this.rate };
    } catch (error) {
      throw new MemoryBuilderError(`GitHub API error: ${error.message}`, 'ERR_API_REQUEST');
    }
  }

  /**
   * Searches reflection entries using GitHub Code Search API
   *
   * @param {string} query - Search query string
   * @returns {Promise<Object>} Object with total count, results array of { path, matches }, and rate
   * @throws {MemoryBuilderError} When request fails
   */
  async search(query) {
    const extension = this.extension.startsWith('.') ? this.extension.slice(1) : this.extension;
    try {
      const response = await this.request('GET /search/code', {
        q: `${query} repo:${this.owner}/${this.repo} path:${this.path} extension:${extension}`,
        per_page: 100,
        headers: {
          'Accept': 'application/vnd.github.text-match+json'
        }
      });
      this.#setRate(response.headers);
      const results = response.data.items.map(item => ({
        path: item.path,
        matches: (item.text_matches || []).map(match => ({
          fragment: match.fragment,
          indices: match.matches.map(m => [m.indices[0], m.indices[1]])
        }))
      }));
      return { total: response.data.total_count, results, rate: this.rate };
    } catch (error) {
      if (error instanceof MemoryBuilderError) {
        throw error;
      }
      throw new MemoryBuilderError(`GitHub API error: ${error.message}`, 'ERR_API_REQUEST');
    }
  }
}

export default Reflection;
