#!/usr/bin/env node

import { SeleniumChrome, SeleniumFirefox } from '../index.js';
import fs from 'fs';

async function demoSelenium() {
  console.log('\n🔍 Selenium Engine Demo\n');

  const url = 'https://example.com';
  const outputDir = 'screenshots';

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Chrome
  console.log('📸 Capturing with Selenium Chrome...');
  const chromeEngine = new SeleniumChrome({
    width: 1280,
    height: 1024,
    delay: 500
  });

  try {
    const result = await chromeEngine.capture(url, `${outputDir}/selenium-chrome.png`);
    console.log(`   ✅ Success! Duration: ${result.duration}ms`);
    console.log(`   📁 Saved to: ${result.outputPath}\n`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
  } finally {
    await chromeEngine.cleanup();
  }

  // Firefox
  console.log('📸 Capturing with Selenium Firefox...');
  const firefoxEngine = new SeleniumFirefox({
    width: 1280,
    height: 1024,
    delay: 500
  });

  try {
    const result = await firefoxEngine.capture(url, `${outputDir}/selenium-firefox.png`);
    console.log(`   ✅ Success! Duration: ${result.duration}ms`);
    console.log(`   📁 Saved to: ${result.outputPath}\n`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
  } finally {
    await firefoxEngine.cleanup();
  }

  console.log('✨ Selenium demo completed!\n');
}

demoSelenium().catch(console.error);
