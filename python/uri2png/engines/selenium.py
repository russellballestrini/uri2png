"""
Selenium-based screenshot engine.
Supports Chrome, Firefox, and Edge browsers.
"""

import asyncio
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from ..base import BaseEngine, ScreenshotResult


class SeleniumEngine(BaseEngine):
    """
    Selenium WebDriver engine - supports Chrome, Firefox, and Edge.
    """

    def __init__(self, browser_type: str = "chrome", **kwargs):
        super().__init__(browser_type=browser_type, **kwargs)
        self.driver = None
        self._executor = ThreadPoolExecutor(max_workers=1)

    def _create_driver(self):
        """Create WebDriver instance (sync)."""
        browser_type = self.options.browser_type

        if browser_type in ("chrome", "chromium"):
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.chrome.service import Service

            options = Options()
            options.add_argument("--headless")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-setuid-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument(f"--window-size={self.options.width},{self.options.height}")

            if self.options.user_agent:
                options.add_argument(f"--user-agent={self.options.user_agent}")

            self.driver = webdriver.Chrome(options=options)

        elif browser_type == "firefox":
            from selenium import webdriver
            from selenium.webdriver.firefox.options import Options

            options = Options()
            options.add_argument("--headless")
            options.add_argument(f"--width={self.options.width}")
            options.add_argument(f"--height={self.options.height}")

            self.driver = webdriver.Firefox(options=options)

        elif browser_type == "edge":
            from selenium import webdriver
            from selenium.webdriver.edge.options import Options

            options = Options()
            options.add_argument("--headless")
            options.add_argument("--no-sandbox")
            options.add_argument(f"--window-size={self.options.width},{self.options.height}")

            if self.options.user_agent:
                options.add_argument(f"--user-agent={self.options.user_agent}")

            self.driver = webdriver.Edge(options=options)

        else:
            raise ValueError(
                f"Invalid browser type: {browser_type}. "
                "Use: chrome, firefox, or edge"
            )

        # Set window size
        self.driver.set_window_size(self.options.width, self.options.height)

    async def initialize(self) -> None:
        """Initialize WebDriver."""
        if self._initialized:
            return

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(self._executor, self._create_driver)
        self._initialized = True

    def _capture_sync(self, url: str, output_path: str) -> dict:
        """Synchronous capture (runs in executor)."""
        start_time = time.time()

        try:
            # Set page load timeout
            self.driver.set_page_load_timeout(self.options.timeout / 1000)

            # Navigate to URL
            self.driver.get(url)

            # Additional delay if specified
            if self.options.delay > 0:
                time.sleep(self.options.delay / 1000.0)

            # Take screenshot
            if self.options.full_page:
                # For full page, we need to resize the window
                total_height = self.driver.execute_script(
                    "return document.body.scrollHeight"
                )
                self.driver.set_window_size(self.options.width, total_height)
                time.sleep(0.5)  # Let it render

            self.driver.save_screenshot(output_path)

            # Reset window size if changed
            if self.options.full_page:
                self.driver.set_window_size(self.options.width, self.options.height)

            duration = int((time.time() - start_time) * 1000)

            return {
                "success": True,
                "duration": duration,
                "error": None,
            }

        except Exception as e:
            duration = int((time.time() - start_time) * 1000)
            return {
                "success": False,
                "duration": duration,
                "error": str(e),
            }

    async def capture(self, url: str, output_path: str) -> ScreenshotResult:
        """Capture screenshot of URL."""
        if not self._initialized:
            await self.initialize()

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            self._executor,
            self._capture_sync,
            url,
            output_path,
        )

        return ScreenshotResult(
            success=result["success"],
            engine="selenium",
            browser_type=self.options.browser_type,
            url=url,
            output_path=output_path,
            duration=result["duration"],
            width=self.options.width,
            height=self.options.height,
            device_scale_factor=self.options.device_scale_factor,
            error=result["error"],
        )

    def _cleanup_sync(self):
        """Synchronous cleanup."""
        if self.driver:
            self.driver.quit()
            self.driver = None

    async def cleanup(self) -> None:
        """Close WebDriver."""
        if self.driver:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(self._executor, self._cleanup_sync)
        self._initialized = False

    @property
    def name(self) -> str:
        return f"Selenium ({self.options.browser_type})"


class SeleniumChrome(SeleniumEngine):
    """Selenium with Chrome browser."""

    def __init__(self, **kwargs):
        super().__init__(browser_type="chrome", **kwargs)


class SeleniumFirefox(SeleniumEngine):
    """Selenium with Firefox browser."""

    def __init__(self, **kwargs):
        super().__init__(browser_type="firefox", **kwargs)


class SeleniumEdge(SeleniumEngine):
    """Selenium with Edge browser."""

    def __init__(self, **kwargs):
        super().__init__(browser_type="edge", **kwargs)
