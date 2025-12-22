"""
URI2PNG - Multi-Engine Web Screenshot Library (Python)

Supports: Playwright, Selenium, Native Tools (wkhtmltoimage, webkit2png, cutycapt)
"""

from .base import BaseEngine, ScreenshotOptions, ScreenshotResult
from .engines.playwright import (
    PlaywrightEngine,
    PlaywrightChromium,
    PlaywrightFirefox,
    PlaywrightWebKit,
)
from .engines.selenium import (
    SeleniumEngine,
    SeleniumChrome,
    SeleniumFirefox,
    SeleniumEdge,
)
from .engines.native import (
    NativeEngine,
    WkHtmlToImageEngine,
    CutyCaptEngine,
)

__version__ = "2.0.0"
__all__ = [
    # Base
    "BaseEngine",
    "ScreenshotOptions",
    "ScreenshotResult",
    # Playwright
    "PlaywrightEngine",
    "PlaywrightChromium",
    "PlaywrightFirefox",
    "PlaywrightWebKit",
    # Selenium
    "SeleniumEngine",
    "SeleniumChrome",
    "SeleniumFirefox",
    "SeleniumEdge",
    # Native
    "NativeEngine",
    "WkHtmlToImageEngine",
    "CutyCaptEngine",
    # Factory
    "create_engine",
    "get_available_engines",
]


def create_engine(engine_name: str, **options) -> BaseEngine:
    """Factory function to create engine by name."""
    engines = {
        # Playwright
        "playwright": PlaywrightEngine,
        "playwright-chromium": PlaywrightChromium,
        "playwright-firefox": PlaywrightFirefox,
        "playwright-webkit": PlaywrightWebKit,
        # Selenium
        "selenium": SeleniumEngine,
        "selenium-chrome": SeleniumChrome,
        "selenium-firefox": SeleniumFirefox,
        "selenium-edge": SeleniumEdge,
        # Native
        "wkhtmltoimage": WkHtmlToImageEngine,
        "cutycapt": CutyCaptEngine,
    }

    if engine_name not in engines:
        available = ", ".join(engines.keys())
        raise ValueError(f"Unknown engine: {engine_name}. Available: {available}")

    return engines[engine_name](**options)


def get_available_engines() -> list:
    """Get list of available engines."""
    return [
        {"name": "playwright", "description": "Playwright with Chromium (default)"},
        {"name": "playwright-chromium", "description": "Playwright with Chromium"},
        {"name": "playwright-firefox", "description": "Playwright with Firefox"},
        {"name": "playwright-webkit", "description": "Playwright with WebKit"},
        {"name": "selenium", "description": "Selenium WebDriver (Chrome default)"},
        {"name": "selenium-chrome", "description": "Selenium with Chrome"},
        {"name": "selenium-firefox", "description": "Selenium with Firefox"},
        {"name": "selenium-edge", "description": "Selenium with Edge"},
        {"name": "wkhtmltoimage", "description": "wkhtmltoimage native tool"},
        {"name": "cutycapt", "description": "CutyCapt native tool"},
    ]
