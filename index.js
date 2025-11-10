/**
 * URI2PNG - Multi-Engine Web Screenshot Library
 * Supports: Playwright, Puppeteer, Selenium, Chrome DevTools Protocol, WebKit Native
 */

// Base
export { BaseEngine } from './lib/base-engine.js';

// Playwright engines
export {
  PlaywrightEngine,
  PlaywrightChromium,
  PlaywrightFirefox,
  PlaywrightWebKit
} from './engines/playwright.js';

// Puppeteer engine
export { PuppeteerEngine } from './engines/puppeteer.js';

// Selenium engines
export {
  SeleniumEngine,
  SeleniumChrome,
  SeleniumFirefox,
  SeleniumEdge
} from './engines/selenium.js';

// Chrome DevTools Protocol
export { ChromeDevToolsEngine } from './engines/chrome-devtools.js';

// WebKit native tools
export {
  WebKitNativeEngine,
  WkHtmlToImageEngine,
  WebKit2PngEngine,
  CutyCaptEngine
} from './engines/webkit-native.js';

/**
 * Factory function to create engine by name
 */
export function createEngine(engineName, options = {}) {
  const engines = {
    // Playwright
    'playwright': () => new (await import('./engines/playwright.js')).PlaywrightEngine(options),
    'playwright-chromium': () => new (await import('./engines/playwright.js')).PlaywrightChromium(options),
    'playwright-firefox': () => new (await import('./engines/playwright.js')).PlaywrightFirefox(options),
    'playwright-webkit': () => new (await import('./engines/playwright.js')).PlaywrightWebKit(options),

    // Puppeteer
    'puppeteer': () => new (await import('./engines/puppeteer.js')).PuppeteerEngine(options),

    // Selenium
    'selenium': () => new (await import('./engines/selenium.js')).SeleniumEngine(options),
    'selenium-chrome': () => new (await import('./engines/selenium.js')).SeleniumChrome(options),
    'selenium-firefox': () => new (await import('./engines/selenium.js')).SeleniumFirefox(options),
    'selenium-edge': () => new (await import('./engines/selenium.js')).SeleniumEdge(options),

    // Chrome DevTools
    'chrome-devtools': () => new (await import('./engines/chrome-devtools.js')).ChromeDevToolsEngine(options),

    // WebKit Native
    'wkhtmltoimage': () => new (await import('./engines/webkit-native.js')).WkHtmlToImageEngine(options),
    'webkit2png': () => new (await import('./engines/webkit-native.js')).WebKit2PngEngine(options),
    'cutycapt': () => new (await import('./engines/webkit-native.js')).CutyCaptEngine(options)
  };

  if (!engines[engineName]) {
    throw new Error(`Unknown engine: ${engineName}. Available: ${Object.keys(engines).join(', ')}`);
  }

  return engines[engineName]();
}

/**
 * Get list of available engines
 */
export function getAvailableEngines() {
  return [
    { name: 'playwright', description: 'Playwright with Chromium (default)' },
    { name: 'playwright-chromium', description: 'Playwright with Chromium' },
    { name: 'playwright-firefox', description: 'Playwright with Firefox' },
    { name: 'playwright-webkit', description: 'Playwright with WebKit' },
    { name: 'puppeteer', description: 'Puppeteer (Chromium)' },
    { name: 'selenium', description: 'Selenium WebDriver (Chrome default)' },
    { name: 'selenium-chrome', description: 'Selenium with Chrome' },
    { name: 'selenium-firefox', description: 'Selenium with Firefox' },
    { name: 'selenium-edge', description: 'Selenium with Edge' },
    { name: 'chrome-devtools', description: 'Chrome DevTools Protocol' },
    { name: 'wkhtmltoimage', description: 'wkhtmltoimage native tool' },
    { name: 'webkit2png', description: 'webkit2png native tool' },
    { name: 'cutycapt', description: 'CutyCapt native tool' }
  ];
}
