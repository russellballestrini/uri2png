import { spawn } from 'child_process';
import { BaseEngine } from '../lib/base-engine.js';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

/**
 * WebKit Native Tools engine - wrapper for wkhtmltoimage, webkit2png, etc.
 */
export class WebKitNativeEngine extends BaseEngine {
  constructor(options = {}) {
    super(options);
    this.tool = options.tool || 'wkhtmltoimage'; // wkhtmltoimage, webkit2png, cutycapt
  }

  async initialize() {
    // Check if tool is available
    try {
      await execAsync(`which ${this.tool}`);
    } catch (error) {
      throw new Error(`${this.tool} is not installed or not in PATH. Install it first.`);
    }
  }

  async capture(url, outputPath) {
    await this.initialize();

    const startTime = Date.now();
    const args = this._buildArgs(url, outputPath);

    return new Promise((resolve, reject) => {
      const process = spawn(this.tool, args);
      let stderr = '';

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        const duration = Date.now() - startTime;

        if (code === 0) {
          resolve({
            success: true,
            engine: 'webkit-native',
            tool: this.tool,
            url,
            outputPath,
            duration,
            viewport: this.getViewport()
          });
        } else {
          reject(new Error(`${this.tool} failed with code ${code}: ${stderr}`));
        }
      });

      process.on('error', reject);
    });
  }

  _buildArgs(url, outputPath) {
    if (this.tool === 'wkhtmltoimage') {
      const args = [
        '--format', 'png',
        '--width', this.options.width.toString(),
        '--height', this.options.height.toString(),
        '--quality', '100'
      ];

      if (this.options.userAgent) {
        args.push('--custom-header', 'User-Agent', this.options.userAgent);
      }

      if (this.options.delay > 0) {
        args.push('--javascript-delay', this.options.delay.toString());
      }

      args.push(url, outputPath);
      return args;
    } else if (this.tool === 'webkit2png') {
      const args = [
        '--width', this.options.width.toString(),
        '--height', this.options.height.toString(),
        '-o', outputPath.replace('.png', ''),
        url
      ];

      if (this.options.delay > 0) {
        args.push('--delay', (this.options.delay / 1000).toString());
      }

      return args;
    } else if (this.tool === 'cutycapt') {
      const args = [
        `--url=${url}`,
        `--out=${outputPath}`,
        `--min-width=${this.options.width}`,
        `--min-height=${this.options.height}`
      ];

      if (this.options.userAgent) {
        args.push(`--user-agent=${this.options.userAgent}`);
      }

      if (this.options.delay > 0) {
        args.push(`--delay=${this.options.delay}`);
      }

      return args;
    }

    throw new Error(`Unknown tool: ${this.tool}`);
  }

  async cleanup() {
    // Native tools don't need cleanup
  }

  get name() {
    return `WebKit Native (${this.tool})`;
  }
}

/**
 * Convenience exports for specific tools
 */
export class WkHtmlToImageEngine extends WebKitNativeEngine {
  constructor(options = {}) {
    super({ ...options, tool: 'wkhtmltoimage' });
  }
}

export class WebKit2PngEngine extends WebKitNativeEngine {
  constructor(options = {}) {
    super({ ...options, tool: 'webkit2png' });
  }
}

export class CutyCaptEngine extends WebKitNativeEngine {
  constructor(options = {}) {
    super({ ...options, tool: 'cutycapt' });
  }
}
