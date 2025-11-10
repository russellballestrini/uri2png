# URI2PNG - Multi-Engine Web Screenshot Tool

**Universal web page screenshot tool supporting multiple browser engines with aspect ratio configuration.**

## 🚀 Features

- **Multiple Browser Engines**: Playwright (Chromium/Firefox/WebKit), Puppeteer, Selenium, Chrome DevTools Protocol
- **Aspect Ratio Support**: Easy 16:9, 4:3, 21:9, and custom aspect ratio configurations
- **Cross-Browser**: Chromium, Chrome, Firefox, WebKit, Safari, Edge
- **Flexible Configuration**: Viewport size, delays, full-page captures, custom user agents
- **CLI & Library**: Use as command-line tool or Node.js library
- **Native Tools Support**: wkhtmltoimage, webkit2png, CutyCapt wrappers
- **Comprehensive Makefile**: Streamlined setup and execution

## 📦 Installation

### Quick Start

```bash
# Install dependencies
make install

# Setup all engines
make setup-all

# Run demo
make demo
```

### Manual Installation

```bash
# Install Node.js dependencies
npm install

# Install Playwright browsers
npx playwright install
npx playwright install-deps

# Install Selenium drivers (optional)
npm install chromedriver geckodriver --save-dev

# Install native tools (optional, Linux)
sudo apt-get install wkhtmltopdf cutycapt

# Or on macOS
brew install wkhtmltopdf webkit2png
```

## 🎯 Quick Usage

### Command Line

```bash
# Basic screenshot with Playwright
node cli.js capture https://example.com -o screenshot.png

# Use specific engine
node cli.js capture https://example.com -e puppeteer -o output.png

# Use specific browser
node cli.js capture https://example.com -e playwright -b firefox -o output.png

# Custom viewport size
node cli.js capture https://example.com -w 1920 -h 1080 -o output.png

# With aspect ratio (16:9)
node cli.js capture https://example.com -a 16:9 -w 1920 -o output.png

# Full page screenshot
node cli.js capture https://example.com -f -o output.png

# With delay (wait 2 seconds after page load)
node cli.js capture https://example.com -d 2000 -o output.png

# List available engines
node cli.js list

# Benchmark all engines
node cli.js benchmark https://example.com
```

### Makefile Shortcuts

```bash
# Quick screenshots with different engines
make screenshot-pw-chromium TEST_URL=https://github.com
make screenshot-pw-firefox TEST_URL=https://github.com
make screenshot-pw-webkit TEST_URL=https://github.com
make screenshot-puppeteer TEST_URL=https://github.com
make screenshot-selenium TEST_URL=https://github.com

# Aspect ratio examples
make screenshot-16x9 TEST_URL=https://example.com
make screenshot-4x3 TEST_URL=https://example.com
make screenshot-mobile TEST_URL=https://example.com

# Capture with all engines
make screenshot-all-engines TEST_URL=https://example.com

# Full page
make screenshot-fullpage TEST_URL=https://example.com

# Run demos
make demo-all
make demo-playwright
make demo-puppeteer
make demo-selenium
```

### As Library

```javascript
import { PlaywrightChromium, PuppeteerEngine } from 'uri2png';

// Using Playwright with Chromium
const engine = new PlaywrightChromium({
  width: 1920,
  height: 1080,
  aspectRatio: '16:9',  // Optional: auto-calculate height
  delay: 500,           // Wait 500ms after page load
  fullPage: false,
  deviceScaleFactor: 2  // 2x for retina displays
});

const result = await engine.capture(
  'https://example.com',
  'screenshot.png'
);

console.log(result);
// {
//   success: true,
//   engine: 'playwright',
//   browserType: 'chromium',
//   url: 'https://example.com',
//   outputPath: 'screenshot.png',
//   duration: 1234,
//   viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 }
// }

await engine.cleanup();
```

## 🎭 Available Engines

| Engine | Browser(s) | Description |
|--------|-----------|-------------|
| `playwright` | Chromium (default) | Modern cross-browser automation |
| `playwright-chromium` | Chromium | Playwright with Chromium |
| `playwright-firefox` | Firefox | Playwright with Firefox |
| `playwright-webkit` | WebKit | Playwright with WebKit |
| `puppeteer` | Chromium | Google's Chromium automation |
| `selenium` | Chrome (default) | Industry-standard WebDriver |
| `selenium-chrome` | Chrome | Selenium with Chrome |
| `selenium-firefox` | Firefox | Selenium with Firefox |
| `selenium-edge` | Edge | Selenium with Edge |
| `chrome-devtools` | Chrome | Low-level Chrome DevTools Protocol |
| `wkhtmltoimage` | WebKit | Native wkhtmltoimage tool |
| `webkit2png` | WebKit | Native webkit2png tool |
| `cutycapt` | WebKit | Native CutyCapt tool |

## 📐 Aspect Ratio Support

All engines support automatic aspect ratio calculation:

```javascript
// Specify width and aspect ratio - height auto-calculated
const engine = new PlaywrightChromium({
  width: 1920,
  aspectRatio: '16:9'  // Height becomes 1080
});

// Common aspect ratios
// 16:9  - Widescreen (1920x1080, 2560x1440)
// 4:3   - Traditional (1600x1200, 1024x768)
// 21:9  - Ultrawide (2560x1080)
// 9:16  - Mobile portrait (375x667, 414x896)
// 1:1   - Square (1080x1080)
```

### CLI Examples

```bash
# 16:9 aspect ratio
node cli.js capture https://example.com -a 16:9 -w 1920 -o screenshot.png

# 4:3 aspect ratio
node cli.js capture https://example.com -a 4:3 -w 1600 -o screenshot.png

# Mobile portrait (9:16)
node cli.js capture https://example.com -a 9:16 -w 375 -o mobile.png

# Ultrawide (21:9)
node cli.js capture https://example.com -a 21:9 -w 2560 -o ultrawide.png
```

## 🔧 Engine-Specific Examples

### Playwright (Recommended)

```javascript
import { PlaywrightFirefox } from 'uri2png';

const engine = new PlaywrightFirefox({
  width: 1280,
  height: 1024,
  fullPage: true,
  delay: 1000,
  userAgent: 'Custom User Agent'
});

await engine.capture('https://example.com', 'output.png');
await engine.cleanup();
```

### Puppeteer

```javascript
import { PuppeteerEngine } from 'uri2png';

const engine = new PuppeteerEngine({
  width: 1920,
  aspectRatio: '16:9',
  deviceScaleFactor: 2,  // Retina
  fullPage: false
});

await engine.capture('https://example.com', 'output.png');
await engine.cleanup();
```

### Selenium

```javascript
import { SeleniumChrome } from 'uri2png';

const engine = new SeleniumChrome({
  width: 1280,
  height: 1024,
  delay: 500
});

await engine.capture('https://example.com', 'output.png');
await engine.cleanup();
```

### Chrome DevTools Protocol

```javascript
import { ChromeDevToolsEngine } from 'uri2png';

const engine = new ChromeDevToolsEngine({
  width: 1920,
  height: 1080,
  port: 9222  // Custom debugging port
});

await engine.capture('https://example.com', 'output.png');
await engine.cleanup();
```

## 🧪 Testing & Demos

```bash
# Run all demos
make demo-all

# Run specific engine demos
make demo-playwright
make demo-puppeteer
make demo-selenium

# Benchmark all engines
make benchmark

# Run tests
make test
```

## 📊 Benchmarking

Compare performance of all engines:

```bash
# CLI benchmark
node cli.js benchmark https://example.com

# Makefile
make benchmark TEST_URL=https://example.com
```

Output shows capture time for each engine, sorted by speed.

## ⚙️ Configuration Options

All engines support these options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | number | 1280 | Viewport width in pixels |
| `height` | number | 1024 | Viewport height in pixels |
| `aspectRatio` | string | null | Aspect ratio (e.g., "16:9", "4:3") |
| `delay` | number | 0 | Delay after page load (ms) |
| `timeout` | number | 30000 | Navigation timeout (ms) |
| `fullPage` | boolean | false | Capture full scrollable page |
| `deviceScaleFactor` | number | 1 | Device pixel ratio (1, 2, 3) |
| `userAgent` | string | null | Custom user agent string |

Engine-specific options:

**Playwright/Selenium:**
- `browserType`: 'chromium', 'firefox', 'webkit', 'chrome', 'edge'

**Chrome DevTools:**
- `port`: Remote debugging port (default: 9222)

**WebKit Native:**
- `tool`: 'wkhtmltoimage', 'webkit2png', 'cutycapt'

## 🛠️ Makefile Targets

### Setup & Installation
```bash
make install              # Install Node.js dependencies
make install-deps         # Install all dependencies
make setup-playwright     # Setup Playwright browsers
make setup-puppeteer      # Setup Puppeteer
make setup-selenium       # Setup Selenium drivers
make setup-native-tools   # Install native tools
make setup-all            # Setup everything
```

### Testing & Demos
```bash
make demo                 # Quick demo
make demo-all             # Demo all engines
make demo-playwright      # Demo Playwright
make demo-puppeteer       # Demo Puppeteer
make demo-selenium        # Demo Selenium
make benchmark            # Benchmark all engines
```

### Screenshot Targets
```bash
make screenshot-pw-chromium   # Playwright Chromium
make screenshot-pw-firefox    # Playwright Firefox
make screenshot-pw-webkit     # Playwright WebKit
make screenshot-puppeteer     # Puppeteer
make screenshot-selenium      # Selenium Chrome
make screenshot-16x9          # 16:9 aspect ratio
make screenshot-4x3           # 4:3 aspect ratio
make screenshot-mobile        # Mobile aspect ratio
make screenshot-all-engines   # All engines
```

### Utilities
```bash
make list-engines         # List available engines
make clean                # Clean generated files
make clean-screenshots    # Clean screenshots
make clean-all            # Clean everything
```

## 📝 Examples

Check the `examples/` directory for more examples:

- `demo-playwright.js` - Playwright examples with all browsers
- `demo-puppeteer.js` - Puppeteer examples
- `demo-selenium.js` - Selenium examples
- `demo-all-engines.js` - Test all engines and aspect ratios

## 🐛 Troubleshooting

### Playwright browsers not installed
```bash
npx playwright install
npx playwright install-deps
```

### Selenium drivers missing
```bash
npm install chromedriver geckodriver --save-dev
```

### Chrome/Firefox not found
Make sure browsers are installed on your system:
```bash
# Ubuntu/Debian
sudo apt-get install chromium-browser firefox

# macOS
brew install --cask google-chrome firefox
```

### Native tools not found
```bash
# Ubuntu/Debian
sudo apt-get install wkhtmltopdf cutycapt

# macOS
brew install wkhtmltopdf webkit2png
```

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📄 License

Apache-2.0

## 🙏 Credits

This tool is brought to you by [LinkPeek web page snapshots as a service](https://linkpeek.com).

Built with:
- [Playwright](https://playwright.dev/) - Cross-browser automation
- [Puppeteer](https://pptr.dev/) - Headless Chrome automation
- [Selenium WebDriver](https://www.selenium.dev/) - Browser automation
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) - Low-level Chrome control

## 🔗 Related Projects

- Original Python implementation using WebKit GTK: `uri2png/uri2png.py`
- [LinkPeek](https://linkpeek.com) - Web page snapshot service
