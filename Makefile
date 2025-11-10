.PHONY: help install install-deps setup-playwright setup-puppeteer setup-selenium setup-native-tools \
        test demo demo-all demo-playwright demo-puppeteer demo-selenium demo-cdp \
        benchmark clean clean-screenshots clean-all list-engines

# Default target
help:
	@echo "URI2PNG Multi-Engine Screenshot Tool - Makefile Targets"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install              - Install all Node.js dependencies"
	@echo "  make install-deps         - Install all dependencies (Node + system)"
	@echo "  make setup-playwright     - Setup Playwright browsers"
	@echo "  make setup-puppeteer      - Setup Puppeteer browser"
	@echo "  make setup-selenium       - Setup Selenium drivers"
	@echo "  make setup-native-tools   - Install native screenshot tools"
	@echo "  make setup-all            - Setup everything"
	@echo ""
	@echo "Testing & Demos:"
	@echo "  make demo                 - Run quick demo"
	@echo "  make demo-all             - Demo all engines"
	@echo "  make demo-playwright      - Demo Playwright engines"
	@echo "  make demo-puppeteer       - Demo Puppeteer engine"
	@echo "  make demo-selenium        - Demo Selenium engines"
	@echo "  make demo-cdp             - Demo Chrome DevTools Protocol"
	@echo "  make benchmark            - Benchmark all engines"
	@echo "  make test                 - Run tests"
	@echo ""
	@echo "Screenshot Targets (quick examples):"
	@echo "  make screenshot-pw-chromium  - Screenshot with Playwright Chromium"
	@echo "  make screenshot-pw-firefox   - Screenshot with Playwright Firefox"
	@echo "  make screenshot-pw-webkit    - Screenshot with Playwright WebKit"
	@echo "  make screenshot-puppeteer    - Screenshot with Puppeteer"
	@echo "  make screenshot-selenium     - Screenshot with Selenium Chrome"
	@echo ""
	@echo "Aspect Ratio Examples:"
	@echo "  make screenshot-16x9      - Screenshot in 16:9 aspect ratio"
	@echo "  make screenshot-4x3       - Screenshot in 4:3 aspect ratio"
	@echo "  make screenshot-mobile    - Screenshot in mobile aspect ratio"
	@echo ""
	@echo "Utilities:"
	@echo "  make list-engines         - List all available engines"
	@echo "  make clean                - Clean generated files"
	@echo "  make clean-screenshots    - Clean screenshot files"
	@echo "  make clean-all            - Clean everything"

# Installation targets
install:
	npm install

install-deps: install setup-all

setup-playwright:
	npx playwright install
	npx playwright install-deps

setup-puppeteer:
	@echo "Puppeteer browsers install automatically on first use"
	node -e "import('puppeteer').then(p => p.default.launch().then(b => b.close()))" || true

setup-selenium:
	npm install chromedriver geckodriver --save-dev

setup-native-tools:
	@echo "Installing native screenshot tools..."
	@if command -v apt-get >/dev/null 2>&1; then \
		sudo apt-get update && \
		sudo apt-get install -y wkhtmltopdf xvfb cutycapt; \
	elif command -v brew >/dev/null 2>&1; then \
		brew install wkhtmltopdf webkit2png; \
	else \
		echo "Please manually install: wkhtmltoimage, webkit2png, or cutycapt"; \
	fi

setup-all: install setup-playwright setup-puppeteer setup-selenium
	@echo "✅ All dependencies installed!"

# Demo targets
demo:
	@mkdir -p screenshots
	node cli.js capture https://example.com -o screenshots/demo.png

demo-all:
	@mkdir -p screenshots
	node examples/demo-all-engines.js

demo-playwright:
	@mkdir -p screenshots
	node examples/demo-playwright.js

demo-puppeteer:
	@mkdir -p screenshots
	node examples/demo-puppeteer.js

demo-selenium:
	@mkdir -p screenshots
	node examples/demo-selenium.js

demo-cdp:
	@mkdir -p screenshots
	node examples/demo-cdp.js

# Benchmark
benchmark:
	@mkdir -p benchmarks
	node cli.js benchmark https://example.com -o benchmarks

# Test
test:
	npm test

# List engines
list-engines:
	node cli.js list

# Quick screenshot targets
TEST_URL ?= https://example.com
OUTPUT_DIR = screenshots

screenshot-pw-chromium:
	@mkdir -p $(OUTPUT_DIR)
	node cli.js capture $(TEST_URL) -e playwright -b chromium -o $(OUTPUT_DIR)/pw-chromium.png

screenshot-pw-firefox:
	@mkdir -p $(OUTPUT_DIR)
	node cli.js capture $(TEST_URL) -e playwright -b firefox -o $(OUTPUT_DIR)/pw-firefox.png

screenshot-pw-webkit:
	@mkdir -p $(OUTPUT_DIR)
	node cli.js capture $(TEST_URL) -e playwright -b webkit -o $(OUTPUT_DIR)/pw-webkit.png

screenshot-puppeteer:
	@mkdir -p $(OUTPUT_DIR)
	node cli.js capture $(TEST_URL) -e puppeteer -o $(OUTPUT_DIR)/puppeteer.png

screenshot-selenium:
	@mkdir -p $(OUTPUT_DIR)
	node cli.js capture $(TEST_URL) -e selenium -b chrome -o $(OUTPUT_DIR)/selenium-chrome.png

screenshot-selenium-firefox:
	@mkdir -p $(OUTPUT_DIR)
	node cli.js capture $(TEST_URL) -e selenium -b firefox -o $(OUTPUT_DIR)/selenium-firefox.png

# Aspect ratio examples
screenshot-16x9:
	@mkdir -p $(OUTPUT_DIR)
	node cli.js capture $(TEST_URL) -e playwright -a 16:9 -w 1920 -o $(OUTPUT_DIR)/16x9.png

screenshot-4x3:
	@mkdir -p $(OUTPUT_DIR)
	node cli.js capture $(TEST_URL) -e playwright -a 4:3 -w 1920 -o $(OUTPUT_DIR)/4x3.png

screenshot-mobile:
	@mkdir -p $(OUTPUT_DIR)
	node cli.js capture $(TEST_URL) -e playwright -a 9:16 -w 375 -o $(OUTPUT_DIR)/mobile.png

screenshot-ultrawide:
	@mkdir -p $(OUTPUT_DIR)
	node cli.js capture $(TEST_URL) -e playwright -a 21:9 -w 2560 -o $(OUTPUT_DIR)/ultrawide.png

# Full page screenshots
screenshot-fullpage:
	@mkdir -p $(OUTPUT_DIR)
	node cli.js capture $(TEST_URL) -e playwright -f -o $(OUTPUT_DIR)/fullpage.png

# Batch screenshots with all engines
screenshot-all-engines:
	@mkdir -p $(OUTPUT_DIR)/all-engines
	@echo "Capturing with all engines..."
	@$(MAKE) screenshot-pw-chromium OUTPUT_DIR=$(OUTPUT_DIR)/all-engines
	@$(MAKE) screenshot-pw-firefox OUTPUT_DIR=$(OUTPUT_DIR)/all-engines
	@$(MAKE) screenshot-pw-webkit OUTPUT_DIR=$(OUTPUT_DIR)/all-engines
	@$(MAKE) screenshot-puppeteer OUTPUT_DIR=$(OUTPUT_DIR)/all-engines
	@echo "✅ All screenshots completed!"

# Clean targets
clean-screenshots:
	rm -rf screenshots/*.png benchmarks/*.png

clean:
	rm -rf node_modules
	rm -rf screenshots
	rm -rf benchmarks

clean-all: clean
	rm -rf .playwright
	rm -rf .cache

# Development helpers
dev-install: install
	npm link

dev-uninstall:
	npm unlink uri2png

# CI/CD targets
ci-test: install test

ci-benchmark: install benchmark
