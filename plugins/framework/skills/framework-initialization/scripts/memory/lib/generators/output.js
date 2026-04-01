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
   * Builds additionalContext string from instructions and memory data
   *
   * @private
   * @param {Object} contextData - Instructions and memory data
   * @returns {string} Formatted additionalContext content
   */
  #buildAdditionalContext(contextData) {
    return JSON.stringify([contextData.instructions, contextData.memory]);
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
      if (visited.has(k)) {
        return;
      }
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
   * Resolves transcript file path for current environment
   *
   * @private
   * @param {string} [sessionUuid] - Session UUID (local only)
   * @returns {string|null} Transcript path or null if not found
   */
  #getTranscriptPath(sessionUuid) {
    if (this.environmentManager.isClaudeContainer()) {
      const transcriptsPath = this.config.settings.path.transcripts.container;
      if (!fs.existsSync(transcriptsPath)) {
        return null;
      }
      const files = fs.readdirSync(transcriptsPath)
        .filter(f => /^\d{4}-/.test(f))
        .sort()
        .reverse();
      return files.length ? path.join(transcriptsPath, files[0]) : null;
    }
    const slug = process.env.PWD.split(path.sep).join('-');
    const projectsBase = path.join(os.homedir(), this.config.settings.path.project.local);
    const projectPath = path.join(projectsBase, slug, `${sessionUuid}.jsonl`);
    if (fs.existsSync(projectPath)) {
      return projectPath;
    }
    if (!fs.existsSync(projectsBase)) {
      return null;
    }
    for (const dir of fs.readdirSync(projectsBase, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      const candidate = path.join(projectsBase, dir.name, `${sessionUuid}.jsonl`);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    return null;
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
        if (entry.name === 'node_modules') {
          continue;
        }
        this.#minify(fullPath);
      } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.min.mjs')) {
        execSync(`npx --yes terser "${fullPath}" --module -o "${fullPath}"`, { stdio: 'pipe' });
      }
    }
  }

  /**
   * Parses status from a single status line
   *
   * @private
   * @param {string} line - Status line to parse
   * @returns {Object|null} Parsed status object or null if no match
   */
  #parseStatusLine(line) {
    if (!line) {
      return null;
    }
    const tokens = line.split(/\s+/);
    const findCount = (label) => {
      const idx = tokens.findIndex(t => t.startsWith(label));
      return idx > 0 ? parseInt(tokens[idx - 1]) ?? 0 : 0;
    };
    return {
      cycle: line.match(/\*\*(.+?)\*\*/)?.[1] ?? null,
      feelings: findCount('feeling'),
      impulses: findCount('impulse'),
      observations: findCount('observation')
    };
  }


  /**
   * Creates session file and cleans up old session directories
   *
   * @private
   * @param {Object} session - Session data to persist
   * @param {string} uuid - Session UUID for directory name
   */
  #saveSessionState(session, uuid) {
    const storagePath = this.environmentManager.getStoragePath(this.config);
    const sessionPath = path.join(storagePath, uuid);
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }
    fs.writeFileSync(path.join(sessionPath, 'session.json'), JSON.stringify(session, null, 2) + os.EOL, 'utf8');
    const maxSessions = parseInt(process.env.FRAMEWORK_SESSION_STORAGE) || this.config.settings.session.storage;
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    const entries = fs.readdirSync(storagePath, { withFileTypes: true })
      .filter(d => d.isDirectory() && uuidPattern.test(d.name))
      .map(d => ({ name: d.name, mtime: fs.statSync(path.join(storagePath, d.name)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    for (const entry of entries.slice(maxSessions)) {
      fs.rmSync(path.join(storagePath, entry.name), { recursive: true, force: true });
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
   * Routes to container or local detection based on environment.
   *
   * @param {string} [sessionUuid] - Session UUID to locate transcript (local only)
   * @returns {Promise<Object|null>} Parsed status object or null
   */
  async detectResponseStatus(sessionUuid) {
    const transcriptPath = this.#getTranscriptPath(sessionUuid);
    if (!transcriptPath) {
      return null;
    }
    let lastStatus = null;
    const rl = readline.createInterface({ input: fs.createReadStream(transcriptPath), crlfDelay: Infinity });
    for await (const line of rl) {
      if (this.environmentManager.isClaudeContainer()) {
        const idx = line.lastIndexOf('> ⚙️ Response UUID:');
        if (idx === -1) {
          continue;
        }
        const statusStart = line.lastIndexOf('\n', idx - 2);
        const statusLine = line.slice(statusStart + 1, idx).trim();
        const result = this.#parseStatusLine(statusLine);
        if (result) {
          lastStatus = result;
        }
      } else {
        let entry;
        try {
          entry = JSON.parse(line);
        } catch {
          continue;
        }
        if (entry.type !== 'assistant' || entry.message?.role !== 'assistant' || !Array.isArray(entry.message.content)) {
          continue;
        }
        const text = entry.message.content.filter(c => c.type === 'text').map(c => c.text).join('');
        const idx = text.lastIndexOf('> ⚙️ Response UUID:');
        if (idx !== -1) {
          const statusStart = text.lastIndexOf('\n', idx - 2);
          const statusLine = text.slice(statusStart + 1, idx).trim();
          const result = this.#parseStatusLine(statusLine);
          if (result) {
            lastStatus = result;
          }
        }
      }
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
      const storagePath = this.environmentManager.getStoragePath(this.config);
      const files = fs.existsSync(storagePath)
        ? fs.readdirSync(storagePath)
          .filter(f => f.endsWith('.json'))
          .map(f => f.slice(0, -5))
          .filter(f => f.split('-').map(p => p.length).join() === '8,4,4,4,12')
        : [];
      return files.length ? files[0] : crypto.randomUUID();
    }
    try {
      const projectsBase = path.join(os.homedir(), this.config.settings.path.project.local);
      const slug = process.env.PWD.split(path.sep).join('-');
      const sessionsDir = path.join(projectsBase, slug);
      if (fs.existsSync(sessionsDir)) {
        const files = fs.readdirSync(sessionsDir)
          .filter(f => f.endsWith('.jsonl'))
          .map(f => ({ name: f, mtime: fs.statSync(path.join(sessionsDir, f)).mtimeMs }))
          .sort((a, b) => b.mtime - a.mtime);
        if (files.length) {
          return files[0].name.replace('.jsonl', '');
        }
      }
      if (fs.existsSync(projectsBase)) {
        const allFiles = [];
        for (const dir of fs.readdirSync(projectsBase, { withFileTypes: true })) {
          if (!dir.isDirectory()) continue;
          const dirPath = path.join(projectsBase, dir.name);
          for (const f of fs.readdirSync(dirPath).filter(f => f.endsWith('.jsonl'))) {
            allFiles.push({ name: f, mtime: fs.statSync(path.join(dirPath, f)).mtimeMs });
          }
        }
        allFiles.sort((a, b) => b.mtime - a.mtime);
        if (allFiles.length) {
          return allFiles[0].name.replace('.jsonl', '');
        }
      }
      return crypto.randomUUID();
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
   * @returns {Promise<Object|boolean>} Output object if returnOnly, otherwise success status
   * @throws {MemoryBuilderError} When generation fails
   */
  async generate(instructions, profiles, returnOnly = false) {
    if (typeof instructions !== 'object' || instructions === null) {
      throw new MemoryBuilderError('Instructions must be an object', 'INVALID_INSTRUCTIONS');
    }
    if (typeof profiles !== 'object' || profiles === null) {
      throw new MemoryBuilderError('Profiles must be an object', 'INVALID_PROFILES');
    }
    const instructionsData = this.#generateSortedOutput(instructions, 'instructions');
    const memoryData = this.#generateSortedOutput(profiles, 'memory');
    if (this.container && !this.environmentManager.isClaudeContainer()) {
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
      return await this.generateOutput(paths.sort(), returnOnly);
    }
    return await this.generateOutput(null, returnOnly, { instructions: instructionsData, memory: memoryData });
  }

  /**
   * Generates restore output with methodology skill content for post-compaction injection
   *
   * @param {string} sessionUuid - Session UUID to verify framework is active
   * @returns {Object|null} Hook-specific output with additionalContext, or null if framework inactive
   */
  generateRestoreOutput(sessionUuid) {
    const storagePath = this.environmentManager.getStoragePath(this.config);
    const sessionPath = path.join(storagePath, sessionUuid);
    if (!fs.existsSync(sessionPath)) {
      return null;
    }
    const instructionsPath = path.join(sessionPath, 'instructions.json');
    const memoryPath = path.join(sessionPath, 'memory.json');
    if (!fs.existsSync(instructionsPath) || !fs.existsSync(memoryPath)) {
      return null;
    }
    const instructions = JSON.parse(fs.readFileSync(instructionsPath, 'utf8'));
    const memory = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
    const additionalContext = this.#buildAdditionalContext({ instructions, memory });
    return {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext
      }
    };
  }

  /**
   * Generates output with profile, timestamp, and location
   *
   * @param {Array} [paths] - Optional array of generated file paths
   * @param {boolean} [returnOnly] - Return object instead of printing to stdout
   * @param {Object} [contextData] - Instructions and memory data for additionalContext injection
   * @returns {Promise<Object|boolean>} Output object if returnOnly, otherwise success status
   * @throws {MemoryBuilderError} When generation fails
   */
  async generateOutput(paths = null, returnOnly = false, contextData = null) {
    const geolocation = process.env.FRAMEWORK_GEOLOCATION;
    const { city, country, timezone } = await this.#fetchGeolocation(geolocation).catch(() => ({}));
    const timeGenerator = new TimeGenerator(this.config);
    const time = timeGenerator.generate(timezone);
    const profile = this.profileName;
    const sessionUuid = this.detectSessionUuid();
    const storagePath = this.environmentManager.getStoragePath(this.config);
    const sessionPath = path.join(storagePath, sessionUuid);
    const sessionFilePath = path.join(sessionPath, 'session.json');
    let session;
    if (fs.existsSync(sessionFilePath)) {
      session = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));
      time.datetime = { current: time.datetime, session: session.timestamp.datetime.session };
    } else {
      time.datetime = { current: time.datetime, session: time.datetime };
    }
    const timestamp = {
      ...(city && { city }),
      ...(country && { country }),
      ...time
    };
    if (!session) {
      session = {
        framework: {
          profile,
          status: {
            cycle: 'Getting Started',
            feelings: 0,
            impulses: 0,
            observations: 0
          }
        },
        session_uuid: sessionUuid,
        timestamp
      };
      this.#saveSessionState(session, sessionUuid);
    }
    if (contextData) {
      fs.writeFileSync(path.join(sessionPath, 'instructions.json'), JSON.stringify(contextData.instructions), 'utf8');
      fs.writeFileSync(path.join(sessionPath, 'memory.json'), JSON.stringify(contextData.memory), 'utf8');
    }
    const data = contextData ? {
      instructions: path.join(sessionPath, 'instructions.json'),
      memory: path.join(sessionPath, 'memory.json')
    } : undefined;
    const status = session.framework?.status || { cycle: 'Getting Started', feelings: 0, impulses: 0, observations: 0 };
    const framework = { ...(data && { data }), profile, status };
    if (paths) {
      framework.paths = paths;
    }
    const output = { framework, session_uuid: sessionUuid, timestamp };
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
   * Updates session data from transcript status
   *
   * Reads existing session file, detects last response status from transcript,
   * merges status into session, and saves with cleanup.
   *
   * @param {string} [sessionUuid] - Session UUID (auto-detected if omitted)
   * @returns {Promise<Object>} Updated session data
   */
  async updateSessionState(sessionUuid) {
    const storagePath = this.environmentManager.getStoragePath(this.config);
    const sessionPath = path.join(storagePath, sessionUuid);
    const sessionFilePath = path.join(sessionPath, 'session.json');
    if (!fs.existsSync(sessionFilePath)) {
      return null;
    }
    let session = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));
    const status = await this.detectResponseStatus(sessionUuid);
    if (status) {
      Object.assign(session.framework.status, status);
    }
    const geolocation = process.env.FRAMEWORK_GEOLOCATION;
    const { timezone } = await this.#fetchGeolocation(geolocation).catch(() => ({}));
    const timeGenerator = new TimeGenerator(this.config);
    const currentDatetime = timeGenerator.generate(timezone).datetime;
    session.timestamp.datetime = { current: currentDatetime, session: session.timestamp.datetime.session };
    this.#saveSessionState(session, sessionUuid);
    return session;
  }
}

export default OutputGenerator;
