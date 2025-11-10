import { chromium, firefox, webkit } from 'playwright';
import { BaseEngine } from '../lib/base-engine.js';

/**
 * Playwright engine - supports Chromium, Firefox, and WebKit
 */
export class PlaywrightEngine extends BaseEngine {
  constructor(options = {}) {
    super(options);
    this.browserType = options.browserType || 'chromium'; // chromium, firefox, webkit
    this.browser = null;
    this.context = null;
  }

  async initialize() {
    const browsers = { chromium, firefox, webkit };

    if (!browsers[this.browserType]) {
      throw new Error(`Invalid browser type: ${this.browserType}. Use: chromium, firefox, or webkit`);
    }

    // Launch browser
    this.browser = await browsers[this.browserType].launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Create context with viewport settings
    const contextOptions = {
      viewport: this.getViewport(),
      deviceScaleFactor: this.options.deviceScaleFactor,
      userAgent: this.options.userAgent
    };

    this.context = await this.browser.newContext(contextOptions);
  }

  async capture(url, outputPath) {
    if (!this.browser) {
      await this.initialize();
    }

    const startTime = Date.now();
    const page = await this.context.newPage();

    try {
      // Navigate to URL with timeout
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.options.timeout
      });

      // Additional delay if specified
      if (this.options.delay > 0) {
        await page.waitForTimeout(this.options.delay);
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
        engine: 'playwright',
        browserType: this.browserType,
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
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  get name() {
    return `Playwright (${this.browserType})`;
  }
}

/**
 * Convenience exports for specific browsers
 */
export class PlaywrightChromium extends PlaywrightEngine {
  constructor(options = {}) {
    super({ ...options, browserType: 'chromium' });
  }
}

export class PlaywrightFirefox extends PlaywrightEngine {
  constructor(options = {}) {
    super({ ...options, browserType: 'firefox' });
  }
}

export class PlaywrightWebKit extends PlaywrightEngine {
  constructor(options = {}) {
    super({ ...options, browserType: 'webkit' });
  }
}
