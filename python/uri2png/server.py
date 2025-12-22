"""
FastAPI server for uri2png screenshot service.
"""

import hashlib
import os
import tempfile
from io import BytesIO
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, HttpUrl

from . import create_engine, get_available_engines

app = FastAPI(
    title="URI2PNG",
    description="Multi-engine web screenshot API",
    version="2.0.0",
)

# Directory for storing screenshots
SCREENSHOT_DIR = os.environ.get("URI2PNG_SCREENSHOT_DIR", "/tmp/uri2png")
Path(SCREENSHOT_DIR).mkdir(parents=True, exist_ok=True)


class CaptureRequest(BaseModel):
    """Request body for screenshot capture."""

    url: HttpUrl
    engine: str = "playwright"
    browser: str = "chromium"
    width: int = 1280
    height: int = 1024
    aspect_ratio: Optional[str] = None
    delay: int = 0
    timeout: int = 30000
    full_page: bool = False
    device_scale_factor: float = 1.0
    user_agent: Optional[str] = None


class CaptureResponse(BaseModel):
    """Response for screenshot capture."""

    success: bool
    engine: str
    browser_type: str
    url: str
    duration: int
    width: int
    height: int
    device_scale_factor: float = 1.0
    screenshot_url: Optional[str] = None
    error: Optional[str] = None


@app.get("/")
async def root():
    """API root with usage info."""
    return {
        "name": "URI2PNG",
        "version": "2.0.0",
        "endpoints": {
            "/capture": "POST - Capture screenshot (returns metadata + download URL)",
            "/capture/image": "GET - Capture and return PNG directly",
            "/engines": "GET - List available engines",
            "/health": "GET - Health check",
        },
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/engines")
async def list_engines():
    """List available screenshot engines."""
    return {"engines": get_available_engines()}


@app.post("/capture", response_model=CaptureResponse)
async def capture_screenshot(request: CaptureRequest):
    """
    Capture screenshot and return metadata with download URL.
    """
    # Generate unique filename based on URL and options
    url_hash = hashlib.md5(str(request.url).encode()).hexdigest()[:12]
    filename = f"{url_hash}_{request.width}x{request.height}.png"
    output_path = os.path.join(SCREENSHOT_DIR, filename)

    try:
        engine = create_engine(
            request.engine,
            browser_type=request.browser,
            width=request.width,
            height=request.height,
            aspect_ratio=request.aspect_ratio,
            delay=request.delay,
            timeout=request.timeout,
            full_page=request.full_page,
            device_scale_factor=request.device_scale_factor,
            user_agent=request.user_agent,
        )

        async with engine:
            result = await engine.capture(str(request.url), output_path)

        if result.success:
            return CaptureResponse(
                success=True,
                engine=result.engine,
                browser_type=result.browser_type,
                url=result.url,
                duration=result.duration,
                width=result.width,
                height=result.height,
                device_scale_factor=result.device_scale_factor,
                screenshot_url=f"/screenshots/{filename}",
            )
        else:
            return CaptureResponse(
                success=False,
                engine=result.engine,
                browser_type=result.browser_type,
                url=result.url,
                duration=result.duration,
                width=result.width,
                height=result.height,
                error=result.error,
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/capture/image")
async def capture_image(
    url: HttpUrl = Query(..., description="URL to capture"),
    engine: str = Query("playwright", description="Screenshot engine"),
    browser: str = Query("chromium", description="Browser type"),
    width: int = Query(1280, description="Viewport width"),
    height: int = Query(1024, description="Viewport height"),
    aspect_ratio: Optional[str] = Query(None, description="Aspect ratio (e.g., 16:9)"),
    delay: int = Query(0, description="Delay after page load (ms)"),
    timeout: int = Query(30000, description="Navigation timeout (ms)"),
    full_page: bool = Query(False, description="Capture full page"),
    device_scale_factor: float = Query(1.0, description="Device scale factor"),
    user_agent: Optional[str] = Query(None, description="Custom user agent"),
):
    """
    Capture screenshot and return PNG image directly.
    """
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        output_path = tmp.name

    try:
        eng = create_engine(
            engine,
            browser_type=browser,
            width=width,
            height=height,
            aspect_ratio=aspect_ratio,
            delay=delay,
            timeout=timeout,
            full_page=full_page,
            device_scale_factor=device_scale_factor,
            user_agent=user_agent,
        )

        async with eng:
            result = await eng.capture(str(url), output_path)

        if not result.success:
            raise HTTPException(status_code=500, detail=result.error)

        # Read and return image
        with open(output_path, "rb") as f:
            image_data = f.read()

        return Response(
            content=image_data,
            media_type="image/png",
            headers={
                "X-Screenshot-Engine": result.engine,
                "X-Screenshot-Browser": result.browser_type,
                "X-Screenshot-Duration": str(result.duration),
                "X-Screenshot-Width": str(result.width),
                "X-Screenshot-Height": str(result.height),
            },
        )

    finally:
        # Cleanup temp file
        try:
            os.unlink(output_path)
        except Exception:
            pass


@app.get("/screenshots/{filename}")
async def get_screenshot(filename: str):
    """Serve captured screenshot."""
    filepath = os.path.join(SCREENSHOT_DIR, filename)

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Screenshot not found")

    return FileResponse(
        filepath,
        media_type="image/png",
        filename=filename,
    )


def run_server(host: str = "0.0.0.0", port: int = 8080):
    """Run the FastAPI server."""
    import uvicorn

    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    run_server()
