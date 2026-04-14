/**
 * Reflection Reader
 *
 * Fetches diary entries from metadata API and CDN storage
 *
 * @module reflection/lib/core/Reflection
 * @author AXIVO
 * @license BSD-3-Clause
 */
import fs from 'fs';
import path from 'path';
import FrameworkError from '../../../shared/core/error.js';
import HttpClient from '../../../shared/core/http.js';

const entryPattern = /\/(\d{4})\/(\d{2})\/(\d{2})\//;

/**
 * Fetches diary entries from metadata API and CDN
 *
 * @class Reflection
 */
class Reflection {
  /**
   * Creates Reflection instance
   *
   * @param {Object} config - Configuration object
   * @param {Object} environmentManager - EnvironmentManager instance
   */
  constructor(config, environmentManager) {
    this.config = config;
    this.environmentManager = environmentManager;
    const isContainer = environmentManager?.isClaudeContainer() ?? false;
    const { cdn, url } = this.config.settings.reflections;
    this.cdn = cdn;
    this.http = new HttpClient({ isContainer });
    this.url = url;
  }

  /**
   * Extracts date from an R2 key
   *
   * @private
   * @param {string} key - R2 object key
   * @returns {string|null} Date in YYYY/MM/DD format
   */
  #extractDate(key) {
    const match = key.match(entryPattern);
    if (!match) {
      return null;
    }
    return `${match[1]}/${match[2]}/${match[3]}`;
  }

  /**
   * Builds reflection URL from R2 key
   *
   * @private
   * @param {string} key - R2 object key
   * @returns {string} Reflection URL
   */
  #keyToUrl(key) {
    const slug = key
      .replace('src/content/claude/reflections/', '')
      .replace('.mdx', '');
    return `${this.url}/${slug}`;
  }

  /**
   * Builds R2 key from reflection URL
   *
   * @private
   * @param {string} url - Reflection URL
   * @returns {string} R2 object key
   */
  #urlToKey(url) {
    const slug = url.replace(this.url + '/', '');
    return `src/content/claude/reflections/${slug}.mdx`;
  }

  /**
   * Fetches content from CDN
   *
   * @private
   * @param {string} key - R2 object key
   * @returns {Promise<string|null>} Content or null if not found
   */
  async #fetch(key) {
    try {
      const response = await this.http.fetch(`${this.cdn}/${key}`);
      if (!response.ok) {
        return null;
      }
      return await response.text();
    } catch (error) {
      throw new FrameworkError(`CDN fetch failed: ${error.message}`, 'ERR_CDN_FETCH');
    }
  }

  /**
   * Fetches all entries metadata from website API
   *
   * @private
   * @returns {Promise<Array>} Array of metadata objects
   */
  async #fetchMetadata() {
    try {
      const response = await this.http.fetch(
        `${new URL(this.url).origin}/metadata`
      );
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.objects || [];
    } catch {
      return [];
    }
  }

  /**
   * Lists all reflection entries
   *
   * @param {Object} [options] - List options
   * @param {number} [options.limit=0] - Entries per index (0 for all)
   * @param {number} [options.index=1] - Index number
   * @returns {Promise<Object>} Object with current, total, and results array
   */
  async list({ limit = 0, index = 1 } = {}) {
    const objects = await this.#fetchMetadata();
    const results = objects
      .map(obj => ({
        author: obj.author,
        date: obj.date,
        description: obj.description,
        source: obj.source,
        tags: obj.tags,
        title: obj.title,
        url: this.#keyToUrl(obj.key)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (limit > 0) {
      const totalIndex = Math.ceil(results.length / limit);
      const clampedIndex = index > totalIndex ? 1 : index;
      const start = (clampedIndex - 1) * limit;
      const end = start + limit;
      const indexed = results.slice(start, end);
      return {
        current: { index: clampedIndex, results: indexed.length },
        results: indexed,
        total: { index: totalIndex, results: results.length }
      };
    }
    return { total: results.length, results };
  }

  /**
   * Lists reflection entries filtered by date
   *
   * @param {string} date - Date prefix in YYYY, YYYY/MM, or YYYY/MM/DD format
   * @returns {Promise<Object>} Object with total and results array
   */
  async listByDate(date) {
    const { results } = await this.list();
    const normalized = date.replace(/\//g, '-');
    const filtered = results.filter(entry => entry.date.startsWith(normalized));
    return { total: filtered.length, results: filtered };
  }

  /**
   * Reads a reflection entry from CDN
   *
   * @param {string} url - Full reflection URL
   * @returns {Promise<Object>} Object with entry content
   */
  async read(url) {
    const key = this.#urlToKey(url);
    const content = await this.#fetch(key);
    if (!content) {
      return { error: `Entry not found: ${url}` };
    }
    return { url, content };
  }

  /**
   * Gets entries for a date, optionally reading a specific entry
   *
   * @param {string} [date] - Date in YYYY/MM/DD format
   * @param {number} [entry=0] - 1-based entry index to read
   * @returns {Promise<Object>} Object with results array
   */
  async get(date, entry = 0) {
    const { results } = date ? await this.listByDate(date) : await this.list();
    if (results.length === 0) {
      return { total: 0, results: [] };
    }
    if (entry > 0 && entry <= results.length) {
      const target = results[entry - 1];
      const { content } = await this.read(target.url);
      if (content) {
        delete target.description;
        target.content = content;
      }
      return target;
    }
    return { total: results.length, results };
  }

  /**
   * Gets the latest reflection entry with content
   *
   * @returns {Promise<Object>} Object with single result
   */
  async latest() {
    const { results } = await this.list();
    if (results.length === 0) {
      return { total: 0, results: [] };
    }
    const last = results[results.length - 1];
    const { content } = await this.read(last.url);
    if (content) {
      delete last.description;
      last.content = content;
    }
    return last;
  }

  /**
   * Retrieves image from CDN and writes to local storage
   *
   * @param {string} imagePath - Path in YYYY/MM/media/name.extension format
   * @returns {Promise<Object>} Object with image path and source
   */
  async image(imagePath) {
    const storagePath = this.environmentManager.getStoragePath(this.config);
    const localPath = path.join(storagePath, path.basename(imagePath));
    if (fs.existsSync(localPath)) {
      return {
        image: {
          path: localPath,
          source: imagePath
        }
      };
    }
    const match = imagePath.match(/(\d{4})\/(\d{2})\/media\/(.+)$/);
    if (!match) {
      return { image: null };
    }
    const cdnPath = `public/claude/reflections/${match[1]}/${match[2]}/${match[3]}`;
    try {
      const response = await this.http.fetch(`${this.cdn}/${cdnPath}`);
      if (!response.ok) {
        return { image: null };
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
      }
      fs.writeFileSync(localPath, buffer);
      return {
        image: {
          path: localPath,
          source: imagePath
        }
      };
    } catch (error) {
      throw new FrameworkError(`Image fetch failed: ${error.message}`, 'ERR_CDN_FETCH');
    }
  }
}

export default Reflection;
