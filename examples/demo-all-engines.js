#!/usr/bin/env node

import {
  PlaywrightChromium,
  PlaywrightFirefox,
  PlaywrightWebKit,
  PuppeteerEngine
} from '../index.js';
import fs from 'fs';

async function demoAllEngines() {
  console.log('\n🚀 Demo All Screenshot Engines\n');

  const url = 'https://example.com';
  const outputDir = 'screenshots';

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const engines = [
    { name: 'Playwright Chromium', engine: new PlaywrightChromium({ width: 1280, height: 1024 }), filename: 'playwright-chromium.png' },
    { name: 'Playwright Firefox', engine: new PlaywrightFirefox({ width: 1280, height: 1024 }), filename: 'playwright-firefox.png' },
    { name: 'Playwright WebKit', engine: new PlaywrightWebKit({ width: 1280, height: 1024 }), filename: 'playwright-webkit.png' },
    { name: 'Puppeteer', engine: new PuppeteerEngine({ width: 1280, height: 1024 }), filename: 'puppeteer.png' }
  ];

  const results = [];

  for (const { name, engine, filename } of engines) {
    console.log(`📸 Testing ${name}...`);

    try {
      const startTime = Date.now();
      const result = await engine.capture(url, `${outputDir}/${filename}`);
      await engine.cleanup();

      const duration = Date.now() - startTime;
      results.push({ name, duration, success: true });

      console.log(`   ✅ Success! Duration: ${duration}ms\n`);
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}\n`);
      results.push({ name, error: error.message, success: false });
    }
  }

  // Print summary
  console.log('📊 Summary:\n');
  console.log('Engine                        Status      Duration');
  console.log('─'.repeat(60));

  for (const result of results) {
    const status = result.success ? '✅ Success' : '❌ Failed';
    const duration = result.success ? `${result.duration}ms` : result.error;
    console.log(`${result.name.padEnd(30)} ${status.padEnd(12)} ${duration}`);
  }

  console.log('\n✨ All engines tested!\n');

  // Test different aspect ratios
  console.log('📐 Testing Aspect Ratios...\n');

  const aspectRatios = [
    { ratio: '16:9', width: 1920 },
    { ratio: '4:3', width: 1600 },
    { ratio: '21:9', width: 2560 },
    { ratio: '9:16', width: 375 }
  ];

  for (const { ratio, width } of aspectRatios) {
    console.log(`   Testing ${ratio} aspect ratio...`);
    const engine = new PlaywrightChromium({ width, aspectRatio: ratio });

    try {
      const result = await engine.capture(url, `${outputDir}/aspect-${ratio.replace(':', 'x')}.png`);
      console.log(`   ✅ ${result.viewport.width}x${result.viewport.height}\n`);
      await engine.cleanup();
    } catch (error) {
      console.error(`   ❌ ${error.message}\n`);
    }
  }

  console.log('✅ All demos completed!\n');
}

demoAllEngines().catch(console.error);
