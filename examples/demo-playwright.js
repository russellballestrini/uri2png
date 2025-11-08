#!/usr/bin/env node

import { PlaywrightChromium, PlaywrightFirefox, PlaywrightWebKit } from '../index.js';
import fs from 'fs';

async function demoPlaywright() {
  console.log('\n🎭 Playwright Engine Demo\n');

  const url = 'https://example.com';
  const outputDir = 'screenshots';

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Test with different browsers
  const browsers = [
    { name: 'Chromium', Engine: PlaywrightChromium },
    { name: 'Firefox', Engine: PlaywrightFirefox },
    { name: 'WebKit', Engine: PlaywrightWebKit }
  ];

  for (const { name, Engine } of browsers) {
    console.log(`📸 Capturing with Playwright ${name}...`);

    const engine = new Engine({
      width: 1280,
      height: 1024,
      delay: 500
    });

    try {
      const result = await engine.capture(url, `${outputDir}/playwright-${name.toLowerCase()}.png`);
      console.log(`   ✅ Success! Duration: ${result.duration}ms`);
      console.log(`   📁 Saved to: ${result.outputPath}\n`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    } finally {
      await engine.cleanup();
    }
  }

  // Test with aspect ratio
  console.log('📸 Testing aspect ratio support (16:9)...');
  const engine = new PlaywrightChromium({
    width: 1920,
    aspectRatio: '16:9'
  });

  try {
    const result = await engine.capture(url, `${outputDir}/playwright-16x9.png`);
    console.log(`   ✅ Success! Viewport: ${result.viewport.width}x${result.viewport.height}`);
    console.log(`   📁 Saved to: ${result.outputPath}\n`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
  } finally {
    await engine.cleanup();
  }

  console.log('✨ Playwright demo completed!\n');
}

demoPlaywright().catch(console.error);
