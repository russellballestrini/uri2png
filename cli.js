#!/usr/bin/env node

import { Command } from 'commander';
import { getAvailableEngines } from './index.js';
import { PlaywrightEngine } from './engines/playwright.js';
import { PuppeteerEngine } from './engines/puppeteer.js';
import { SeleniumEngine } from './engines/selenium.js';
import { ChromeDevToolsEngine } from './engines/chrome-devtools.js';
import { WebKitNativeEngine } from './engines/webkit-native.js';
import path from 'path';

const program = new Command();

program
  .name('uri2png')
  .description('Multi-engine web screenshot tool')
  .version('1.0.0');

program
  .command('capture')
  .description('Capture screenshot of a URL')
  .argument('<url>', 'URL to capture')
  .option('-o, --output <path>', 'Output file path', 'screenshot.png')
  .option('-e, --engine <engine>', 'Screenshot engine to use', 'playwright')
  .option('-b, --browser <browser>', 'Browser type for engine (chromium, firefox, webkit, chrome, edge)', 'chromium')
  .option('-w, --width <pixels>', 'Viewport width', '1280')
  .option('-h, --height <pixels>', 'Viewport height', '1024')
  .option('-a, --aspect-ratio <ratio>', 'Aspect ratio (e.g., 16:9, 4:3)')
  .option('-d, --delay <ms>', 'Delay after page load (ms)', '0')
  .option('-f, --full-page', 'Capture full page', false)
  .option('-u, --user-agent <string>', 'Custom user agent')
  .option('-s, --scale <factor>', 'Device scale factor', '1')
  .option('-t, --timeout <ms>', 'Navigation timeout (ms)', '30000')
  .action(async (url, options) => {
    try {
      console.log(`\n🚀 Capturing ${url} with ${options.engine}...\n`);

      // Parse options
      const engineOptions = {
        width: parseInt(options.width),
        height: parseInt(options.height),
        aspectRatio: options.aspectRatio,
        delay: parseInt(options.delay),
        fullPage: options.fullPage,
        userAgent: options.userAgent,
        deviceScaleFactor: parseFloat(options.scale),
        timeout: parseInt(options.timeout),
        browserType: options.browser
      };

      // Create engine
      let engine;
      const engineName = options.engine.toLowerCase();

      if (engineName.startsWith('playwright')) {
        engine = new PlaywrightEngine(engineOptions);
      } else if (engineName === 'puppeteer') {
        engine = new PuppeteerEngine(engineOptions);
      } else if (engineName.startsWith('selenium')) {
        engine = new SeleniumEngine(engineOptions);
      } else if (engineName === 'chrome-devtools') {
        engine = new ChromeDevToolsEngine(engineOptions);
      } else if (['wkhtmltoimage', 'webkit2png', 'cutycapt'].includes(engineName)) {
        engine = new WebKitNativeEngine({ ...engineOptions, tool: engineName });
      } else {
        throw new Error(`Unknown engine: ${engineName}`);
      }

      // Capture screenshot
      const result = await engine.capture(url, options.output);
      await engine.cleanup();

      console.log('✅ Screenshot captured successfully!\n');
      console.log(`   Engine: ${result.engine}`);
      console.log(`   Browser: ${result.browserType}`);
      console.log(`   Viewport: ${result.viewport.width}x${result.viewport.height}`);
      console.log(`   Duration: ${result.duration}ms`);
      console.log(`   Output: ${path.resolve(result.outputPath)}\n`);
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}\n`);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available screenshot engines')
  .action(() => {
    console.log('\n📋 Available Screenshot Engines:\n');
    const engines = getAvailableEngines();
    engines.forEach(engine => {
      console.log(`   ${engine.name.padEnd(25)} - ${engine.description}`);
    });
    console.log('');
  });

program
  .command('benchmark')
  .description('Benchmark all available engines')
  .argument('<url>', 'URL to test')
  .option('-o, --output-dir <path>', 'Output directory for screenshots', './benchmarks')
  .action(async (url, options) => {
    console.log(`\n🏁 Benchmarking all engines with ${url}...\n`);

    const engines = [
      { name: 'playwright-chromium', engine: new PlaywrightEngine({ browserType: 'chromium' }) },
      { name: 'playwright-firefox', engine: new PlaywrightEngine({ browserType: 'firefox' }) },
      { name: 'playwright-webkit', engine: new PlaywrightEngine({ browserType: 'webkit' }) },
      { name: 'puppeteer', engine: new PuppeteerEngine() },
    ];

    const results = [];

    for (const { name, engine } of engines) {
      try {
        console.log(`   Testing ${name}...`);
        const outputPath = path.join(options.outputDir, `${name}.png`);
        const result = await engine.capture(url, outputPath);
        await engine.cleanup();
        results.push({ name, ...result });
        console.log(`   ✅ ${name}: ${result.duration}ms`);
      } catch (error) {
        console.log(`   ❌ ${name}: ${error.message}`);
      }
    }

    console.log('\n📊 Benchmark Results:\n');
    results.sort((a, b) => a.duration - b.duration);
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.name.padEnd(25)} ${result.duration}ms`);
    });
    console.log('');
  });

program.parse();
