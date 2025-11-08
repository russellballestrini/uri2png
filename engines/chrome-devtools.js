import CDP from 'chrome-remote-interface';
import { spawn } from 'child_process';
import { BaseEngine } from '../lib/base-engine.js';
import fs from 'fs';

/**
 * Chrome DevTools Protocol engine - Low-level Chrome control
 */
export class ChromeDevToolsEngine extends BaseEngine {
  constructor(options = {}) {
    super(options);
    this.chromeProcess = null;
    this.client = null;
    this.port = options.port || 9222;
  }

  async initialize() {
    // Launch Chrome with remote debugging
    return new Promise((resolve, reject) => {
      this.chromeProcess = spawn('google-chrome', [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        `--remote-debugging-port=${this.port}`,
        '--disable-software-rasterizer',
        '--disable-extensions'
      ], {
        stdio: 'ignore'
      });

      // Give Chrome time to start
      setTimeout(resolve, 2000);

      this.chromeProcess.on('error', reject);
    });
  }

  async capture(url, outputPath) {
    if (!this.chromeProcess) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      // Connect to Chrome
      this.client = await CDP({ port: this.port });

      const { Page, Emulation, Network } = this.client;

      // Enable necessary domains
      await Promise.all([
        Page.enable(),
        Network.enable()
      ]);

      // Set device metrics (viewport)
      await Emulation.setDeviceMetricsOverride({
        width: this.options.width,
        height: this.options.height,
        deviceScaleFactor: this.options.deviceScaleFactor,
        mobile: false
      });

      // Set user agent if provided
      if (this.options.userAgent) {
        await Network.setUserAgentOverride({
          userAgent: this.options.userAgent
        });
      }

      // Navigate to URL
      await Page.navigate({ url });

      // Wait for page load
      await Page.loadEventFired();

      // Additional delay if specified
      if (this.options.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.options.delay));
      }

      // Capture screenshot
      const screenshot = await Page.captureScreenshot({
        format: 'png',
        captureBeyondViewport: this.options.fullPage
      });

      // Save to file
      fs.writeFileSync(outputPath, screenshot.data, 'base64');

      const duration = Date.now() - startTime;

      return {
        success: true,
        engine: 'chrome-devtools-protocol',
        browserType: 'chrome',
        url,
        outputPath,
        duration,
        viewport: this.getViewport()
      };
    } finally {
      if (this.client) {
        await this.client.close();
        this.client = null;
      }
    }
  }

  async cleanup() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    if (this.chromeProcess) {
      this.chromeProcess.kill();
      this.chromeProcess = null;
    }
  }

  get name() {
    return 'Chrome DevTools Protocol';
  }
}
