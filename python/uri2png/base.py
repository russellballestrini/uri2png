"""
Base class for all screenshot engines.
"""

import re
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ScreenshotOptions:
    """Configuration options for screenshot capture."""

    width: int = 1280
    height: int = 1024
    aspect_ratio: Optional[str] = None  # e.g., "16:9", "4:3"
    delay: int = 0  # ms after page load
    timeout: int = 30000  # navigation timeout ms
    full_page: bool = False
    device_scale_factor: float = 1.0
    user_agent: Optional[str] = None
    browser_type: str = "chromium"  # chromium, firefox, webkit, chrome, edge

    def __post_init__(self):
        """Apply aspect ratio if provided."""
        if self.aspect_ratio:
            self._apply_aspect_ratio()

    def _apply_aspect_ratio(self):
        """Calculate dimensions from aspect ratio."""
        match = re.match(r"^(\d+):(\d+)$", self.aspect_ratio)
        if not match:
            raise ValueError(
                f"Invalid aspect ratio format: {self.aspect_ratio}. "
                'Use format like "16:9" or "4:3"'
            )

        width_ratio = int(match.group(1))
        height_ratio = int(match.group(2))

        # Calculate height from width and ratio
        self.height = round(self.width * height_ratio / width_ratio)


@dataclass
class ScreenshotResult:
    """Result of a screenshot capture."""

    success: bool
    engine: str
    browser_type: str
    url: str
    output_path: str
    duration: int  # ms
    width: int
    height: int
    device_scale_factor: float = 1.0
    error: Optional[str] = None


class BaseEngine(ABC):
    """
    Abstract base class for all screenshot engines.
    """

    def __init__(
        self,
        width: int = 1280,
        height: int = 1024,
        aspect_ratio: Optional[str] = None,
        delay: int = 0,
        timeout: int = 30000,
        full_page: bool = False,
        device_scale_factor: float = 1.0,
        user_agent: Optional[str] = None,
        browser_type: str = "chromium",
        **kwargs,
    ):
        self.options = ScreenshotOptions(
            width=width,
            height=height,
            aspect_ratio=aspect_ratio,
            delay=delay,
            timeout=timeout,
            full_page=full_page,
            device_scale_factor=device_scale_factor,
            user_agent=user_agent,
            browser_type=browser_type,
        )
        self._initialized = False

    @property
    def name(self) -> str:
        """Engine name."""
        return self.__class__.__name__

    @abstractmethod
    async def initialize(self) -> None:
        """Initialize the engine (launch browser, etc.)."""
        pass

    @abstractmethod
    async def capture(self, url: str, output_path: str) -> ScreenshotResult:
        """
        Capture screenshot of a URL.

        Args:
            url: URL to capture
            output_path: Path to save screenshot

        Returns:
            ScreenshotResult with metadata
        """
        pass

    @abstractmethod
    async def cleanup(self) -> None:
        """Cleanup resources (close browser, etc.)."""
        pass

    def get_viewport(self) -> dict:
        """Get viewport configuration."""
        return {
            "width": self.options.width,
            "height": self.options.height,
            "device_scale_factor": self.options.device_scale_factor,
        }

    async def __aenter__(self):
        """Async context manager entry."""
        await self.initialize()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.cleanup()
