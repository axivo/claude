/**
 * Output Generator
 *
 * Formats profiles into JSON and writes output file.
 * Handles UTF-8 encoding and POSIX compliance.
 * Includes timestamp generation.
 *
 * @module lib/generators/OutputGenerator
 * @author AXIVO
 * @license BSD-3-Clause
 */
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline';
import EnvironmentManager from '../core/environment.js';
import HttpClient from '../core/http.js';
import MemoryBuilderError from '../core/error.js';
import TimeGenerator from './time.js';

/**
 * Generates and writes JSON output files
 *
 * Formats hierarchical profile dictionary into JSON with proper encoding.
 *
 * @class OutputGenerator
 */
class OutputGenerator {
  /**
   * Creates OutputGenerator instance
   *
   * @param {Object} config - Configuration object for output generation
   * @param {boolean} [container] - Running in container or container mode requested
   * @param {string} [profileName] - Profile name for output
   * @param {boolean} [minify] - Minify JS files in zip archives
   */
  constructor(config, container = false, profileName = null, minify = false) {
    this.config = config;
    this.container = container;
    this.environmentManager = new EnvironmentManager(config.settings);
    this.minify = minify;
    this.profileName = profileName || config.settings.profile;
  }

  /**
   * Clears JSON payload data from SKILL.md placeholders
   *
   * @private
   * @param {string} marker - Delimiter name (instructions or methodology)
   */
  #clearPayloadData(marker) {
    const skillInfo = this.#findSkillByKey('methodology');
    const skillPath = path.join(os.homedir(), this.config.settings.path.skill.local, skillInfo.pluginName, skillInfo.pluginVersion, 'skills', skillInfo.skillName, 'SKILL.md');
    const content = fs.readFileSync(skillPath, 'utf8');
    const pattern = new RegExp(
      `(<!-- framework-${marker}-start -->)[\\s\\S]*?(<!-- framework-${marker}-end -->)`
    );
    const emptyBlock = `$1\n$2`;
    fs.writeFileSync(skillPath, content.replace(pattern, emptyBlock), 'utf8');
  }

  /**
   * Creates zip archive of a single skill directory
   *
   * @private
   * @param {string} pluginName - Name of the plugin containing the skill
   * @param {string} pluginVersion - Version of the plugin
   * @param {string} skillName - Name of the skill to zip
   * @returns {string} Path to created zip file
   * @throws {MemoryBuilderError} When zip creation fails
   */
  #createZip(pluginName, pluginVersion, skillName) {
    const outputPath = this.config.settings.path.package.output;
    const sourcePath = path.resolve(os.homedir(), this.config.settings.path.skill.local, pluginName, pluginVersion, 'skills');
    const zipPath = `${outputPath}/${skillName}.zip`;
    const skillPath = path.join(sourcePath, skillName);
    if (!fs.existsSync(skillPath)) {
      return null;
    }
    const tmpDir = this.minify ? fs.mkdtempSync(path.join(os.tmpdir(), 'framework-pkg-')) : null;
    try {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
      const excludePaths = this.config.settings.path.package.excludes;
      const exclusions = excludePaths
        .map(pattern => `--exclude="${skillName}/${pattern}/*"`)
        .join(' ');
      let cwd = sourcePath;
      if (tmpDir) {
        execSync(`cp -a "${skillPath}" "${tmpDir}/${skillName}"`, { stdio: 'pipe' });
        this.#minify(path.join(tmpDir, skillName));
        cwd = tmpDir;
      }
      execSync(`tar -acf "${zipPath}" ${exclusions} "${skillName}/"`, { cwd, stdio: 'pipe' });
      return zipPath;
    } catch (error) {
      throw new MemoryBuilderError(`Failed to create ${skillName} zip archive: ${error.message}`, 'ZIP_CREATE_ERROR');
    } finally {
      if (tmpDir) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    }
  }

  /**
   * Recursively minifies JS files in a directory using npx terser
   *
   * @private
   * @param {string} directory - Directory to process
   */
  #minify(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules') continue;
        this.#minify(fullPath);
      } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.min.mjs')) {
        execSync(`npx --yes terser "${fullPath}" --module -o "${fullPath}"`, { stdio: 'pipe' });
      }
    }
  }

  /**
   * Fetches geolocation data from environment or API
   *
   * @private
   * @param {string} [geolocation] - Optional geolocation JSON string
   * @returns {Promise<Object>} Object with city, country, timezone (empty object on failure)
   */
  async #fetchGeolocation(geolocation) {
    if (geolocation) {
      const location = JSON.parse(geolocation.replace(/'/g, '"'));
      return { city: location.city, country: location.country, timezone: location.timezone };
    }
    const httpClient = new HttpClient({ isContainer: this.environmentManager.isClaudeContainer() });
    const response = await httpClient.fetch(this.config.settings.geolocation.service);
    const data = await response.json();
    return {
      city: data.city,
      country: new Intl.DisplayNames(['en'], { type: 'region' }).of(data.country),
      timezone: data.timezone
    };
  }

  /**
   * Finds a skill and its plugin info by skill key
   *
   * @private
   * @param {string} skillKey - Skill key to find (e.g., 'init', 'methodology')
   * @returns {Object|null} Object with plugin and skill info, or null if not found
   */
  #findSkillByKey(skillKey) {
    for (const pluginList of Object.values(this.config.settings.plugins)) {
      for (const { plugin, skills } of pluginList) {
        if (skills?.[skillKey]) {
          const pluginName = plugin.name;
          const pluginVersion = plugin.version;
          return { pluginName, pluginVersion, skillName: skills[skillKey] };
        }
      }
    }
    return null;
  }

  /**
   * Generates inheritance-ordered output
   *
   * Uses reverse topological sort so active profile appears first, then parents.
   * This mirrors instance cognition: start from active profile, traverse to foundations.
   *
   * @private
   * @param {Object} data - Data to sort and output
   * @param {string} key - Wrapper key for output object
   * @returns {Object} Sorted output object with version
   */
  #generateSortedOutput(data, key) {
    const keys = Object.keys(data);
    const visited = new Set();
    const result = [];
    const visit = (k) => {
      if (visited.has(k)) return;
      visited.add(k);
      const inherits = data[k]?.inherits;
      if (Array.isArray(inherits)) {
        inherits.filter(p => keys.includes(p)).forEach(visit);
      }
      result.push(k);
    };
    keys.forEach(visit);
    const sorted = Object.fromEntries(result.reverse().map(k => [k, data[k]]));
    const skillInfo = this.#findSkillByKey('methodology');
    const sectionName = `Framework ${key.charAt(0).toUpperCase() + key.slice(1)} Data`;
    return { [skillInfo.skillName]: sectionName, [key]: sorted, version: skillInfo.pluginVersion };
  }

  /**
   * Derives session storage directory from config
   *
   * @private
   * @returns {string} Path to session storage directory
   */
  #getSessionStoragePath() {
    if (this.environmentManager.isClaudeContainer()) {
      return this.config.settings.path.project.container;
    }
    const { name } = this.config.settings.plugins.framework[0].plugin;
    return path.join(os.homedir(), this.config.settings.path.skill.local, name);
  }

  /**
   * Injects JSON data into SKILL.md between delimiters
   *
   * @private
   * @param {string} marker - Delimiter name (instructions or methodology)
   * @param {Object} data - JSON data to inject
   */
  #injectData(marker, data) {
    const skillInfo = this.#findSkillByKey('methodology');
    const skillPath = (this.container && this.environmentManager.isClaudeContainer())
      ? path.join(this.config.settings.path.skill.container, skillInfo.skillName, 'SKILL.md')
      : path.join(os.homedir(), this.config.settings.path.skill.local, skillInfo.pluginName, skillInfo.pluginVersion, 'skills', skillInfo.skillName, 'SKILL.md');
    const content = fs.readFileSync(skillPath, 'utf8');
    const pattern = new RegExp(
      `(<!-- framework-${marker}-start -->)[\\s\\S]*?(<!-- framework-${marker}-end -->)`
    );
    const jsonBlock = `$1\n\`\`\`json\n${JSON.stringify(data)}\n\`\`\`\n$2`;
    fs.writeFileSync(skillPath, content.replace(pattern, jsonBlock), 'utf8');
  }

  /**
   * Creates session state file and cleans up old files
   *
   * @private
   * @param {string} sessionUuid - Session UUID for filename
   * @param {Object} state - Session state to persist
   */
  #saveSessionState(sessionUuid, state) {
    const storagePath = this.#getSessionStoragePath();
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
    const filePath = path.join(storagePath, `${sessionUuid}.json`);
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2) + os.EOL, 'utf8');
    const maxFiles = parseInt(process.env.FRAMEWORK_SESSION_STORAGE) || this.config.settings.session.storage;
    const files = fs.readdirSync(storagePath)
      .filter(f => f.endsWith('.json'))
      .map(f => ({ name: f, mtime: fs.statSync(path.join(storagePath, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    for (const file of files.slice(maxFiles)) {
      fs.unlinkSync(path.join(storagePath, file.name));
    }
  }

  /**
   * Writes JSON data to file in package output directory
   *
   * @private
   * @param {string} filename - Output filename (e.g., 'instructions.json')
   * @param {Object} data - JSON data to write
   * @returns {string} Path to created file
   */
  #writeJsonFile(filename, data) {
    const outputPath = this.config.settings.path.package.output;
    const filePath = path.join(outputPath, filename);
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
    return filePath;
  }

  /**
   * Detects last response status from session transcript
   *
   * @param {string} [sessionUuid] - Session UUID to locate transcript
   * @returns {Promise<Object|null>} Parsed status object or null
   */
  async detectResponseStatus(sessionUuid) {
    const slug = process.env.PWD.split(path.sep).join('-');
    const transcriptPath = path.join(os.homedir(), this.config.settings.path.project.local, slug, `${sessionUuid}.jsonl`);
    if (!fs.existsSync(transcriptPath)) {
      return null;
    }
    let lastStatus = null;
    const rl = readline.createInterface({ input: fs.createReadStream(transcriptPath), crlfDelay: Infinity });
    for await (const line of rl) {
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }
      if (entry.type !== 'assistant' || entry.message?.role !== 'assistant' || !Array.isArray(entry.message.content)) continue;
      const text = entry.message.content.filter(c => c.type === 'text').map(c => c.text).join('');
      if (!text.includes('> Status:')) continue;
      const lines = text.split('\n');
      const statusLine = lines.find(l => l.startsWith('> Status:') && !l.includes('{cycle}'));
      if (!statusLine) continue;
      const uuidLine = lines.find(l => l.startsWith('> Response UUID:') && !l.includes('{uuid}'));
      const cycleMatch = statusLine.match(/\*\*(.+?)\*\*/);
      const countMatches = [...statusLine.matchAll(/(\d+)\s+\w+/g)];
      lastStatus = {
        cycle: cycleMatch?.[1] ?? null,
        feelings: parseInt(countMatches[0]?.[1]) ?? 0,
        impulses: parseInt(countMatches[1]?.[1]) ?? 0,
        observations: parseInt(countMatches[2]?.[1]) ?? 0,
        response_uuid: uuidLine?.match(/`(.+?)`/)?.[1] ?? null
      };
    }
    return lastStatus;
  }

  /**
   * Detects or generates session UUID
   *
   * @returns {string} Session UUID from current session
   */
  detectSessionUuid() {
    if (this.environmentManager.isClaudeContainer()) {
      const storagePath = this.#getSessionStoragePath();
      if (fs.existsSync(storagePath)) {
        const files = fs.readdirSync(storagePath).filter(f => f.endsWith('.json'));
        return files[0].replace('.json', '');
      }
      return crypto.randomUUID();
    }
    try {
      const slug = process.env.PWD.split(path.sep).join('-');
      const sessionsDir = path.join(os.homedir(), this.config.settings.path.project.local, slug);
      if (!fs.existsSync(sessionsDir)) {
        return crypto.randomUUID();
      }
      const files = fs.readdirSync(sessionsDir)
        .filter(f => f.endsWith('.jsonl'))
        .map(f => ({ name: f, mtime: fs.statSync(path.join(sessionsDir, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);
      return files[0].name.replace('.jsonl', '');
    } catch {
      return crypto.randomUUID();
    }
  }

  /**
   * Generates profile and instructions output with timestamp
   *
   * @param {Object} instructions - Hierarchical instructions dictionary
   * @param {Object} profiles - Hierarchical profile dictionary
   * @param {boolean} [returnOnly] - Return object instead of printing to stdout
   * @param {boolean} [skipInject] - Skip injecting data into SKILL.md
   * @returns {Promise<Object|boolean>} Output object if returnOnly, otherwise success status
   * @throws {MemoryBuilderError} When generation fails
   */
  async generate(instructions, profiles, returnOnly = false, skipInject = false) {
    if (typeof instructions !== 'object' || instructions === null) {
      throw new MemoryBuilderError('Instructions must be an object', 'INVALID_INSTRUCTIONS');
    }
    if (typeof profiles !== 'object' || profiles === null) {
      throw new MemoryBuilderError('Profiles must be an object', 'INVALID_PROFILES');
    }
    const instructionsData = this.#generateSortedOutput(instructions, 'instructions');
    const memoryData = this.#generateSortedOutput(profiles, 'memory');
    if (this.container && !this.environmentManager.isClaudeContainer()) {
      this.#clearPayloadData('instructions');
      this.#clearPayloadData('memory');
      const paths = [];
      const plugins = this.config.settings.plugins;
      for (const [, pluginList] of Object.entries(plugins)) {
        for (const { plugin, skills } of pluginList) {
          for (const skillName of Object.values(skills)) {
            const zipPath = this.#createZip(plugin.name, plugin.version, skillName);
            if (zipPath) {
              paths.push(zipPath);
            }
          }
        }
      }
      paths.push(this.#writeJsonFile('instructions.json', instructionsData));
      paths.push(this.#writeJsonFile('memory.json', memoryData));
      const keyFile = this.config.settings.reflections.repository.key;
      const keySource = path.resolve('config', keyFile);
      const keyDest = path.join(this.config.settings.path.package.output, keyFile);
      fs.copyFileSync(keySource, keyDest);
      paths.push(keyDest);
      if (!skipInject) {
        this.#injectData('instructions', instructionsData);
        this.#injectData('memory', memoryData);
      }
      return await this.generateOutput(paths.sort(), returnOnly);
    }
    if (!skipInject) {
      this.#injectData('instructions', instructionsData);
      this.#injectData('memory', memoryData);
    }
    return await this.generateOutput(null, returnOnly);
  }

  /**
   * Generates output with profile, timestamp, and location
   *
   * @param {Array} [paths] - Optional array of generated file paths
   * @param {boolean} [returnOnly] - Return object instead of printing to stdout
   * @returns {Promise<Object|boolean>} Output object if returnOnly, otherwise success status
   * @throws {MemoryBuilderError} When generation fails
   */
  async generateOutput(paths = null, returnOnly = false) {
    const geolocation = process.env.FRAMEWORK_GEOLOCATION;
    const { city, country, timezone } = await this.#fetchGeolocation(geolocation).catch(() => ({}));
    const timeGenerator = new TimeGenerator(this.config);
    const timestamp = timeGenerator.generate(timezone);
    if (city) timestamp.city = city;
    if (country) timestamp.country = country;
    const profile = this.profileName;
    const sessionUuid = this.detectSessionUuid();
    const output = paths
      ? { paths, profile, session_uuid: sessionUuid, timestamp }
      : { profile, session_uuid: sessionUuid, timestamp };
    const storagePath = this.#getSessionStoragePath();
    const stateFilePath = path.join(storagePath, `${sessionUuid}.json`);
    if (!fs.existsSync(stateFilePath)) {
      this.#saveSessionState(sessionUuid, {
        cycle: 'Getting Started',
        feelings: 0,
        impulses: 0,
        observations: 0,
        profile,
        session_uuid: sessionUuid,
        timestamp
      });
    }
    if (returnOnly) {
      return output;
    }
    this.output(output, 'stdout');
    return true;
  }

  /**
   * Outputs data to stdout or file
   *
   * @param {Object|Array} data - Data to output
   * @param {string} outputPath - Output file path ('stdout' for console)
   * @throws {MemoryBuilderError} When file write fails
   */
  output(data, outputPath) {
    if (!outputPath || outputPath === 'stdout') {
      console.log(JSON.stringify(data, null, 2));
      return;
    }
    const jsonContent = JSON.stringify(data);
    const resolvedPath = path.resolve(outputPath);
    const outputDir = path.dirname(resolvedPath);
    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const fd = fs.openSync(resolvedPath, 'w');
      try {
        fs.writeFileSync(fd, jsonContent, { encoding: 'utf8' });
        fs.fsyncSync(fd);
      } finally {
        fs.closeSync(fd);
      }
    } catch (error) {
      throw new MemoryBuilderError(`Failed to write ${resolvedPath} output file: ${error.message}`, 'OUTPUT_WRITE_ERROR');
    }
  }

  /**
   * Updates session state from transcript status
   *
   * Reads existing state file, detects last response status from transcript,
   * merges status into state, and saves with cleanup.
   *
   * @param {string} [sessionUuid] - Session UUID (auto-detected if omitted)
   * @returns {Promise<Object>} Updated session state
   */
  async updateSessionState(sessionUuid) {
    const storagePath = this.#getSessionStoragePath();
    const filePath = path.join(storagePath, `${sessionUuid}.json`);
    let state = {};
    if (fs.existsSync(filePath)) {
      state = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    const status = await this.detectResponseStatus(sessionUuid);
    if (status) {
      const { response_uuid, ...fields } = status;
      Object.assign(state, fields);
    }
    this.#saveSessionState(sessionUuid, state);
    return state;
  }
}

export default OutputGenerator;
