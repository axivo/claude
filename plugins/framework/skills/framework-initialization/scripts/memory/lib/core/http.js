/**
 * HTTP Client
 *
 * HTTP client using curl binary for container environment
 *
 * @module lib/core/HttpClient
 * @author AXIVO
 * @license BSD-3-Clause
 */
import { spawnSync } from 'node:child_process';
import { request } from '../vendor/octokit-request.min.mjs';

/**
 * HTTP client using system curl binary
 *
 * @class HttpClient
 */
class HttpClient {
  /**
   * Creates HttpClient instance
   *
   * @param {Object} [options] - Client options
   * @param {number} [options.timeout=30] - Request timeout in seconds
   * @param {number} [options.maxBuffer=52428800] - Max response buffer (50MB)
   * @param {boolean} [options.isContainer=false] - Whether running in container
   * @param {Object} [options.auth] - GitHubAuth instance for authenticated requests
   */
  constructor(options = {}) {
    this.auth = options.auth || null;
    this.timeout = options.timeout || 30;
    this.maxBuffer = options.maxBuffer || 50 * 1024 * 1024;
    this.isContainer = options.isContainer || false;
    this.request = request.defaults({ request: { fetch: this.fetch.bind(this) } });
  }

  /**
   * Builds curl command arguments
   *
   * @private
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Array<string>} Curl arguments
   */
  #buildArgs(url, options) {
    const { method = 'GET', headers = {}, body } = options;
    const args = ['-s', '-S', '-L', '-i', '--max-time', String(this.timeout), '-X', method];
    Object.entries(headers).forEach(([key, value]) => {
      args.push('-H', `${key}: ${value}`);
    });
    if (body) {
      args.push('-d', typeof body === 'object' ? JSON.stringify(body) : body);
    }
    args.push(url);
    return args;
  }

  /**
   * Executes curl command
   *
   * @private
   * @param {Array<string>} args - Curl arguments
   * @returns {string} Raw curl output
   * @throws {Error} When curl execution fails
   */
  #execute(args) {
    const result = spawnSync('curl', args, {
      encoding: 'utf-8',
      maxBuffer: this.maxBuffer,
      timeout: (this.timeout + 5) * 1000
    });
    if (result.error) {
      throw new Error(`Curl execution failed: ${result.error.message}`);
    }
    if (result.status !== 0) {
      throw new Error(`Curl failed with exit code ${result.status}: ${result.stderr || 'unknown error'}`);
    }
    return result.stdout;
  }

  /**
   * Parses curl output into response components
   *
   * @private
   * @param {string} output - Raw curl output with headers
   * @returns {Object} Parsed response { statusCode, headers, body }
   */
  #parseResponse(output) {
    const headerEndIndex = output.lastIndexOf('\r\n\r\n');
    const headerSection = headerEndIndex > -1 ? output.slice(0, headerEndIndex) : '';
    const body = headerEndIndex > -1 ? output.slice(headerEndIndex + 4) : output;
    const statusLines = headerSection.match(/HTTP\/[\d.]+\s+(\d{3})/g);
    const statusCode = statusLines ? parseInt(statusLines[statusLines.length - 1].slice(-3), 10) : 200;
    const headers = new Headers();
    const lastHttpIndex = headerSection.lastIndexOf('HTTP/');
    const relevantSection = lastHttpIndex > -1 ? headerSection.slice(lastHttpIndex) : headerSection;
    relevantSection.split('\r\n').slice(1).forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        headers.set(line.slice(0, colonIndex).trim().toLowerCase(), line.slice(colonIndex + 1).trim());
      }
    });
    return { statusCode, headers, body };
  }

  /**
   * Performs HTTP request
   *
   * @param {string} url - Request URL
   * @param {Object} [options] - Request options
   * @param {string} [options.method='GET'] - HTTP method
   * @param {Object} [options.headers] - Request headers
   * @param {string|Object} [options.body] - Request body
   * @returns {Promise<Response>} Response object
   */
  async fetch(url, options = {}) {
    if (this.auth) {
      const token = await this.auth.getToken();
      options.headers = { ...options.headers, authorization: `token ${token}` };
    }
    if (!this.isContainer) {
      return fetch(url, options);
    }
    const args = this.#buildArgs(url, options);
    const output = this.#execute(args);
    const { statusCode, headers, body } = this.#parseResponse(output);
    return {
      ok: statusCode >= 200 && statusCode < 300,
      status: statusCode,
      headers,
      url,
      text: async () => body,
      json: async () => JSON.parse(body)
    };
  }
}

export default HttpClient;
