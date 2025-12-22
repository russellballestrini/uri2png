"""
Playwright-based screenshot engine.
Supports Chromium, Firefox, and WebKit browsers.
"""

import asyncio
import time
from typing import Optional

from ..base import BaseEngine, ScreenshotResult


class PlaywrightEngine(BaseEngine):
    """
    Playwright engine - supports Chromium, Firefox, and WebKit.
    """

    def __init__(self, browser_type: str = "chromium", **kwargs):
        super().__init__(browser_type=browser_type, **kwargs)
        self.browser = None
        self.context = None
        self._playwright = None

    async def initialize(self) -> None:
        """Launch browser and create context."""
        if self._initialized:
            return

        from playwright.async_api import async_playwright

        self._playwright = await async_playwright().start()

        # Get browser launcher
        browsers = {
            "chromium": self._playwright.chromium,
            "firefox": self._playwright.firefox,
            "webkit": self._playwright.webkit,
        }

        browser_type = self.options.browser_type
        if browser_type not in browsers:
            raise ValueError(
                f"Invalid browser type: {browser_type}. "
                "Use: chromium, firefox, or webkit"
            )

        # Launch browser
        self.browser = await browsers[browser_type].launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"],
        )

        # Create context with viewport settings
        context_options = {
            "viewport": {
                "width": self.options.width,
                "height": self.options.height,
            },
            "device_scale_factor": self.options.device_scale_factor,
        }

        if self.options.user_agent:
            context_options["user_agent"] = self.options.user_agent

        self.context = await self.browser.new_context(**context_options)
        self._initialized = True

    async def capture(self, url: str, output_path: str) -> ScreenshotResult:
        """Capture screenshot of URL."""
        if not self._initialized:
            await self.initialize()

        start_time = time.time()
        page = await self.context.new_page()

        try:
            # Navigate to URL
            await page.goto(
                url,
                wait_until="networkidle",
                timeout=self.options.timeout,
            )

            # Additional delay if specified
            if self.options.delay > 0:
                await asyncio.sleep(self.options.delay / 1000.0)

            # Take screenshot
            await page.screenshot(
                path=output_path,
                full_page=self.options.full_page,
                type="png",
            )

            duration = int((time.time() - start_time) * 1000)

            return ScreenshotResult(
                success=True,
                engine="playwright",
                browser_type=self.options.browser_type,
                url=url,
                output_path=output_path,
                duration=duration,
                width=self.options.width,
                height=self.options.height,
                device_scale_factor=self.options.device_scale_factor,
            )

        except Exception as e:
            duration = int((time.time() - start_time) * 1000)
            return ScreenshotResult(
                success=False,
                engine="playwright",
                browser_type=self.options.browser_type,
                url=url,
                output_path=output_path,
                duration=duration,
                width=self.options.width,
                height=self.options.height,
                error=str(e),
            )

        finally:
            await page.close()

    async def cleanup(self) -> None:
        """Close browser and cleanup."""
        if self.context:
            await self.context.close()
            self.context = None
        if self.browser:
            await self.browser.close()
            self.browser = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None
        self._initialized = False

    @property
    def name(self) -> str:
        return f"Playwright ({self.options.browser_type})"


class PlaywrightChromium(PlaywrightEngine):
    """Playwright with Chromium browser."""

    def __init__(self, **kwargs):
        super().__init__(browser_type="chromium", **kwargs)


class PlaywrightFirefox(PlaywrightEngine):
    """Playwright with Firefox browser."""

    def __init__(self, **kwargs):
        super().__init__(browser_type="firefox", **kwargs)


class PlaywrightWebKit(PlaywrightEngine):
    """Playwright with WebKit browser."""

    def __init__(self, **kwargs):
        super().__init__(browser_type="webkit", **kwargs)
