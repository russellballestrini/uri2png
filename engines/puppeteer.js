import puppeteer from 'puppeteer';
import { BaseEngine } from '../lib/base-engine.js';

/**
 * Puppeteer engine - Chromium/Chrome focused
 */
export class PuppeteerEngine extends BaseEngine {
  constructor(options = {}) {
    super(options);
    this.browser = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
  }

  async capture(url, outputPath) {
    if (!this.browser) {
      await this.initialize();
    }

    const startTime = Date.now();
    const page = await this.browser.newPage();

    try {
      // Set viewport
      await page.setViewport(this.getViewport());

      // Set user agent if provided
      if (this.options.userAgent) {
        await page.setUserAgent(this.options.userAgent);
      }

      // Navigate to URL
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.options.timeout
      });

      // Additional delay if specified
      if (this.options.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.options.delay));
      }

      // Take screenshot
      await page.screenshot({
        path: outputPath,
        fullPage: this.options.fullPage,
        type: 'png'
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        engine: 'puppeteer',
        browserType: 'chromium',
        url,
        outputPath,
        duration,
        viewport: this.getViewport()
      };
    } finally {
      await page.close();
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  get name() {
    return 'Puppeteer (Chromium)';
  }
}
