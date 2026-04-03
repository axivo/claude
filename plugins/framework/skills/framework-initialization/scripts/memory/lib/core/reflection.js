/**
 * Reflection Reader
 *
 * Fetches diary entries from axivo/claude-reflections repository
 *
 * @module lib/core/Reflection
 * @author AXIVO
 * @license BSD-3-Clause
 */
import fs from 'fs';
import path from 'path';
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
   * @param {EnvironmentManager} environmentManager - Environment manager instance
   * @param {Object} [auth] - GitHubAuth instance for authenticated requests
   */
  constructor(config = {}, environmentManager = null, auth = null) {
    this.config = config;
    this.environmentManager = environmentManager;
    const isContainer = environmentManager?.isClaudeContainer() ?? false;
    const { branch, extension, name, organization, path: repoPath } = this.config.settings.reflections.repository;
    this.branch = branch;
    this.extension = extension;
    this.owner = organization;
    this.path = repoPath.startsWith('/') ? repoPath.slice(1) : repoPath;
    this.rate = null;
    this.repo = name;
    this.request = new HttpClient({ isContainer, auth }).request;
    this.url = this.config.settings.reflections.url;
  }

  /**
   * Splits markdown content into individual entries by H2 headings
   *
   * @private
   * @param {string} filePath - Full repository path of the file
   * @param {string} content - Raw markdown content
   * @param {Object} [options] - Split options
   * @param {number} [options.entry] - 1-based entry index to include reflection content
   * @param {boolean} [options.raw] - Return raw markdown instead of AST
   * @returns {Array<Object>} Array of entry objects
   */
  #splitEntries(filePath, content, { entry = 0, raw = false } = {}) {
    const isReadme = filePath.split('/').pop().toUpperCase().startsWith('README');
    if (isReadme) {
      const result = { entry: 1, link: '', path: filePath, timestamp: '', title: 'Retrospective' };
      if (entry <= 1) {
        result.reflection = raw ? content : md(content);
      }
      return [result];
    }
    const h2Pattern = /^## .+$/gm;
    const matches = [...content.matchAll(h2Pattern)];
    if (matches.length === 0) {
      const result = { entry: 1, link: '', path: filePath, timestamp: '', title: '' };
      if (entry === 1) {
        result.reflection = raw ? content : md(content);
      }
      return [result];
    }
    const dateMatch = filePath.match(/(\d{4})\/(\d{2})\/(\d{2})/);
    const entries = [];
    for (let i = 0; i < matches.length; i++) {
      const heading = matches[i][0];
      const titleMatch = heading.match(/^## .+? — (.+)$/);
      const title = titleMatch ? titleMatch[1] : '';
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const link = dateMatch && slug
        ? `${this.url}/${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}/${slug}`
        : '';
      let timestamp = '';
      if (dateMatch) {
        const timeMatch = heading.match(/^## (\d{1,2}):(\d{2}) (AM|PM) (\w+)/);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          if (timeMatch[3] === 'PM' && hours !== 12) hours += 12;
          if (timeMatch[3] === 'AM' && hours === 12) hours = 0;
          const timezones = { EST: '-05:00', EDT: '-04:00', CST: '-06:00', CDT: '-05:00', MST: '-07:00', MDT: '-06:00', PST: '-08:00', PDT: '-07:00' };
          const offset = timezones[timeMatch[4]] || '-05:00';
          timestamp = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T${String(hours).padStart(2, '0')}:${timeMatch[2]}:00${offset}`;
        }
      }
      const entryIndex = i + 1;
      const result = { entry: entryIndex, link, path: filePath, timestamp, title };
      if (entry === entryIndex) {
        const start = matches[i].index;
        const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
        const entryContent = content.slice(start, end).trimEnd();
        result.reflection = raw ? entryContent : md(entryContent);
      }
      entries.push(result);
    }
    return entries;
  }

  /**
   * Fetches reflection entries for multiple file paths
   *
   * @private
   * @param {Array<string>} filePaths - Array of full paths to fetch
   * @param {Object} [options] - Fetch options
   * @param {number} [options.entry] - 1-based entry index to include reflection content
   * @param {boolean} [options.raw] - Return raw markdown instead of AST
   * @returns {Promise<Object>} Object with results array and rate
   */
  async #fetchEntries(filePaths, { entry = 0, raw = false } = {}) {
    const results = [];
    for (const file of filePaths) {
      const filePath = file.slice(this.path.length + 1);
      const content = await this.#fetchReflection(filePath);
      if (content) {
        results.push(...this.#splitEntries(file, content, { entry, raw }));
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
   * Gets all entries from the latest file using Git Trees API
   *
   * @private
   * @param {Object} [options] - Fetch options
   * @param {number} [options.entry] - 1-based entry index to include reflection content
   * @param {boolean} [options.raw] - Return raw markdown instead of AST
   * @returns {Promise<Object>} Object with results array and rate
   */
  async #getEntries({ entry = 0, raw = false } = {}) {
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
          results: this.#splitEntries(latestPath, content, { entry, raw }),
          rate: this.rate
        };
      }
      return { results: [], rate: this.rate };
    } catch (error) {
      throw new MemoryBuilderError(`GitHub API error: ${error.message}`, 'ERR_API_REQUEST');
    }
  }

  /**
   * Gets the last entry from the latest file
   *
   * @private
   * @param {Object} [options] - Fetch options
   * @param {boolean} [options.raw] - Return raw markdown instead of AST
   * @returns {Promise<Object>} Object with single-element results array and rate
   */
  async #getLatestEntry({ raw = false } = {}) {
    const { results, rate } = await this.#getEntries({ raw });
    if (results.length === 0) {
      return { results, rate };
    }
    const lastIndex = results.length;
    const { results: expanded, rate: expandedRate } = await this.#getEntries({ entry: lastIndex, raw });
    return { results: expanded.slice(-1), rate: expandedRate };
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
   * @param {number} [entry] - 1-based entry index to include reflection content
   * @returns {Promise<Object>} Object with results array and rate
   */
  async get(date = '', latest = !date, raw = false, entry = 0) {
    const options = { entry, raw };
    if (latest && !date) {
      return entry ? this.#getEntries(options) : this.#getLatestEntry(options);
    }
    const { results: items } = await this.list(date);
    const files = items.filter(e => e.endsWith(this.extension));
    if (files.length) {
      const toFetch = latest ? files.slice(-1) : files;
      return this.#fetchEntries(toFetch, options);
    }
    if (date && items.length === 0) {
      const filePath = date.endsWith(this.extension) ? date : `${date}${this.extension}`;
      return this.#fetchEntries([`${this.path}/${filePath}`], options);
    }
    return { results: [], rate: this.rate };
  }

  /**
   * Retrieves image from GitHub API and writes to local storage
   *
   * @param {string} filePath - File path within repository path
   * @returns {Promise<Object>} Object with image { file, source } and rate
   * @throws {MemoryBuilderError} When request fails
   */
  async image(filePath) {
    const storagePath = this.environmentManager.getStoragePath(this.config);
    const imagePath = path.join(storagePath, path.basename(filePath));
    if (fs.existsSync(imagePath)) {
      return {
        image: {
          path: imagePath,
          source: filePath
        }
      };
    }
    const fullPath = `${this.path}/${filePath}`;
    try {
      const response = await this.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: this.owner,
        repo: this.repo,
        path: fullPath,
        ref: this.branch
      });
      this.#setRate(response.headers);
      const base64 = response.data.content.replace(/\n/g, '');
      const buffer = Buffer.from(base64, 'base64');
      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
      }
      fs.writeFileSync(imagePath, buffer);
      return {
        image: {
          path: imagePath,
          source: filePath
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
        matches: (item.text_matches || []).map(match => match.fragment)
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
