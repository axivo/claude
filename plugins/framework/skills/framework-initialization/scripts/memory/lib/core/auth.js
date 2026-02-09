/**
 * GitHub App Authentication
 *
 * Generates JWT and exchanges for installation access token
 *
 * @module lib/core/GitHubAuth
 * @author AXIVO
 * @license BSD-3-Clause
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import HttpClient from './http.js';
import MemoryBuilderError from './error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configDir = path.join(__dirname, '../../config');

/**
 * GitHub App authentication via JWT and installation tokens
 *
 * @class GitHubAuth
 */
class GitHubAuth {
  /**
   * Creates GitHubAuth instance
   *
   * @param {Object} config - Configuration object from ConfigLoader
   * @param {boolean} [isContainer] - Whether running in container environment
   */
  constructor(config, isContainer = false) {
    const { id, key } = config.settings.reflections.repository;
    const keyPath = isContainer
      ? path.join(config.settings.path.project.container, key)
      : path.join(configDir, key);
    this.appId = id.client;
    this.installationId = id.installation;
    this.privateKey = fs.readFileSync(keyPath, 'utf8');
    this.request = new HttpClient({ isContainer }).request;
    this.token = null;
    this.tokenExpiry = 0;
  }

  /**
   * Base64url encodes a buffer or string
   *
   * @private
   * @param {Buffer|string} data - Data to encode
   * @returns {string} Base64url encoded string
   */
  #base64url(data) {
    const base64 = Buffer.from(data).toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Generates RS256 JWT for GitHub App authentication
   *
   * @private
   * @returns {string} Signed JWT
   * @throws {MemoryBuilderError} When JWT generation fails
   */
  #generateJWT() {
    try {
      const now = Math.floor(Date.now() / 1000);
      const header = this.#base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
      const payload = this.#base64url(JSON.stringify({
        iss: this.appId,
        iat: now - 60,
        exp: now + 600
      }));
      const signature = crypto
        .createSign('RSA-SHA256')
        .update(`${header}.${payload}`)
        .sign(this.privateKey, 'base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      return `${header}.${payload}.${signature}`;
    } catch (error) {
      throw new MemoryBuilderError(`JWT generation failed: ${error.message}`, 'ERR_AUTH_JWT');
    }
  }

  /**
   * Gets installation access token, using cache when valid
   *
   * @returns {Promise<string>} Installation access token
   * @throws {MemoryBuilderError} When token exchange fails
   */
  async getToken() {
    const now = Math.floor(Date.now() / 1000);
    if (this.token && this.tokenExpiry > now + 60) {
      return this.token;
    }
    const jwt = this.#generateJWT();
    try {
      const response = await this.request('POST /app/installations/{installation_id}/access_tokens', {
        installation_id: this.installationId,
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      this.token = response.data.token;
      this.tokenExpiry = Math.floor(new Date(response.data.expires_at).getTime() / 1000);
      return this.token;
    } catch (error) {
      throw new MemoryBuilderError(`Token exchange failed: ${error.message}`, 'ERR_AUTH_TOKEN');
    }
  }
}

export default GitHubAuth;
