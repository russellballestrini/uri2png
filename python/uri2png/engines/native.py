"""
Native tool-based screenshot engines.
Supports wkhtmltoimage and CutyCapt.
"""

import asyncio
import shutil
import time
from typing import Optional

from ..base import BaseEngine, ScreenshotResult


class NativeEngine(BaseEngine):
    """
    Base class for native screenshot tools.
    """

    tool_name: str = ""
    tool_command: str = ""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._available = None

    async def initialize(self) -> None:
        """Check if native tool is available."""
        if self._initialized:
            return

        self._available = shutil.which(self.tool_command) is not None

        if not self._available:
            raise RuntimeError(
                f"{self.tool_name} not found. "
                f"Please install {self.tool_command}."
            )

        self._initialized = True

    def _build_command(self, url: str, output_path: str) -> list:
        """Build command arguments. Override in subclasses."""
        raise NotImplementedError

    async def capture(self, url: str, output_path: str) -> ScreenshotResult:
        """Capture screenshot using native tool."""
        if not self._initialized:
            await self.initialize()

        start_time = time.time()

        try:
            cmd = self._build_command(url, output_path)

            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            try:
                stdout, stderr = await asyncio.wait_for(
                    proc.communicate(),
                    timeout=self.options.timeout / 1000,
                )
            except asyncio.TimeoutError:
                proc.kill()
                await proc.wait()
                raise RuntimeError("Screenshot capture timed out")

            duration = int((time.time() - start_time) * 1000)

            if proc.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown error"
                return ScreenshotResult(
                    success=False,
                    engine=self.tool_name.lower(),
                    browser_type="native",
                    url=url,
                    output_path=output_path,
                    duration=duration,
                    width=self.options.width,
                    height=self.options.height,
                    error=error_msg,
                )

            return ScreenshotResult(
                success=True,
                engine=self.tool_name.lower(),
                browser_type="native",
                url=url,
                output_path=output_path,
                duration=duration,
                width=self.options.width,
                height=self.options.height,
            )

        except Exception as e:
            duration = int((time.time() - start_time) * 1000)
            return ScreenshotResult(
                success=False,
                engine=self.tool_name.lower(),
                browser_type="native",
                url=url,
                output_path=output_path,
                duration=duration,
                width=self.options.width,
                height=self.options.height,
                error=str(e),
            )

    async def cleanup(self) -> None:
        """No cleanup needed for native tools."""
        self._initialized = False

    @property
    def name(self) -> str:
        return self.tool_name


class WkHtmlToImageEngine(NativeEngine):
    """
    wkhtmltoimage screenshot engine.
    Install: apt-get install wkhtmltopdf (includes wkhtmltoimage)
    """

    tool_name = "wkhtmltoimage"
    tool_command = "wkhtmltoimage"

    def _build_command(self, url: str, output_path: str) -> list:
        cmd = [
            self.tool_command,
            "--format", "png",
            "--width", str(self.options.width),
            "--height", str(self.options.height),
            "--quality", "100",
        ]

        if self.options.delay > 0:
            cmd.extend(["--javascript-delay", str(self.options.delay)])

        if self.options.user_agent:
            cmd.extend(["--custom-header", "User-Agent", self.options.user_agent])

        cmd.extend([url, output_path])
        return cmd


class CutyCaptEngine(NativeEngine):
    """
    CutyCapt screenshot engine.
    Install: apt-get install cutycapt
    """

    tool_name = "CutyCapt"
    tool_command = "cutycapt"

    def _build_command(self, url: str, output_path: str) -> list:
        cmd = [
            self.tool_command,
            f"--url={url}",
            f"--out={output_path}",
            f"--min-width={self.options.width}",
            f"--min-height={self.options.height}",
            "--out-format=png",
        ]

        if self.options.delay > 0:
            cmd.append(f"--delay={self.options.delay}")

        if self.options.user_agent:
            cmd.append(f"--user-agent={self.options.user_agent}")

        return cmd
