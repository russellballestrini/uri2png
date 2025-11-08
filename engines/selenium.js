import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import edge from 'selenium-webdriver/edge.js';
import { BaseEngine } from '../lib/base-engine.js';
import fs from 'fs';

/**
 * Selenium WebDriver engine - supports Chrome, Firefox, Edge, Safari
 */
export class SeleniumEngine extends BaseEngine {
  constructor(options = {}) {
    super(options);
    this.browserType = options.browserType || 'chrome'; // chrome, firefox, edge, safari
    this.driver = null;
  }

  async initialize() {
    const builder = new Builder().forBrowser(this.browserType);

    // Configure browser-specific options
    if (this.browserType === 'chrome') {
      const chromeOptions = new chrome.Options();
      chromeOptions.addArguments('--headless=new');
      chromeOptions.addArguments('--no-sandbox');
      chromeOptions.addArguments('--disable-dev-shm-usage');
      chromeOptions.addArguments('--disable-gpu');
      chromeOptions.addArguments(`--window-size=${this.options.width},${this.options.height}`);

      if (this.options.userAgent) {
        chromeOptions.addArguments(`--user-agent=${this.options.userAgent}`);
      }

      builder.setChromeOptions(chromeOptions);
    } else if (this.browserType === 'firefox') {
      const firefoxOptions = new firefox.Options();
      firefoxOptions.addArguments('-headless');
      firefoxOptions.windowSize({ width: this.options.width, height: this.options.height });

      if (this.options.userAgent) {
        firefoxOptions.setPreference('general.useragent.override', this.options.userAgent);
      }

      builder.setFirefoxOptions(firefoxOptions);
    } else if (this.browserType === 'edge') {
      const edgeOptions = new edge.Options();
      edgeOptions.addArguments('--headless=new');
      edgeOptions.addArguments('--no-sandbox');
      edgeOptions.addArguments('--disable-dev-shm-usage');
      edgeOptions.addArguments(`--window-size=${this.options.width},${this.options.height}`);

      builder.setEdgeOptions(edgeOptions);
    }

    this.driver = await builder.build();
  }

  async capture(url, outputPath) {
    if (!this.driver) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      // Set window size
      await this.driver.manage().window().setRect({
        width: this.options.width,
        height: this.options.height
      });

      // Navigate to URL
      await this.driver.get(url);

      // Wait for page load
      await this.driver.wait(async () => {
        const readyState = await this.driver.executeScript('return document.readyState');
        return readyState === 'complete';
      }, this.options.timeout);

      // Additional delay if specified
      if (this.options.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.options.delay));
      }

      // Take screenshot
      const screenshot = await this.driver.takeScreenshot();
      fs.writeFileSync(outputPath, screenshot, 'base64');

      const duration = Date.now() - startTime;

      return {
        success: true,
        engine: 'selenium',
        browserType: this.browserType,
        url,
        outputPath,
        duration,
        viewport: this.getViewport()
      };
    } catch (error) {
      throw new Error(`Selenium capture failed: ${error.message}`);
    }
  }

  async cleanup() {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
    }
  }

  get name() {
    return `Selenium (${this.browserType})`;
  }
}

/**
 * Convenience exports for specific browsers
 */
export class SeleniumChrome extends SeleniumEngine {
  constructor(options = {}) {
    super({ ...options, browserType: 'chrome' });
  }
}

export class SeleniumFirefox extends SeleniumEngine {
  constructor(options = {}) {
    super({ ...options, browserType: 'firefox' });
  }
}

export class SeleniumEdge extends SeleniumEngine {
  constructor(options = {}) {
    super({ ...options, browserType: 'edge' });
  }
}
