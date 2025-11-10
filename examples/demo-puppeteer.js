#!/usr/bin/env node

import { PuppeteerEngine } from '../index.js';
import fs from 'fs';

async function demoPuppeteer() {
  console.log('\n🎪 Puppeteer Engine Demo\n');

  const url = 'https://example.com';
  const outputDir = 'screenshots';

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Standard screenshot
  console.log('📸 Capturing with Puppeteer...');
  const engine = new PuppeteerEngine({
    width: 1280,
    height: 1024,
    delay: 500
  });

  try {
    const result = await engine.capture(url, `${outputDir}/puppeteer-standard.png`);
    console.log(`   ✅ Success! Duration: ${result.duration}ms`);
    console.log(`   📁 Saved to: ${result.outputPath}\n`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
  } finally {
    await engine.cleanup();
  }

  // Full page screenshot
  console.log('📸 Capturing full page with Puppeteer...');
  const fullPageEngine = new PuppeteerEngine({
    width: 1280,
    height: 1024,
    fullPage: true
  });

  try {
    const result = await fullPageEngine.capture(url, `${outputDir}/puppeteer-fullpage.png`);
    console.log(`   ✅ Success! Duration: ${result.duration}ms`);
    console.log(`   📁 Saved to: ${result.outputPath}\n`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
  } finally {
    await fullPageEngine.cleanup();
  }

  // High DPI screenshot
  console.log('📸 Capturing with high DPI (2x)...');
  const highDpiEngine = new PuppeteerEngine({
    width: 1280,
    height: 1024,
    deviceScaleFactor: 2
  });

  try {
    const result = await highDpiEngine.capture(url, `${outputDir}/puppeteer-hidpi.png`);
    console.log(`   ✅ Success! Duration: ${result.duration}ms`);
    console.log(`   📁 Saved to: ${result.outputPath}\n`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
  } finally {
    await highDpiEngine.cleanup();
  }

  console.log('✨ Puppeteer demo completed!\n');
}

demoPuppeteer().catch(console.error);
