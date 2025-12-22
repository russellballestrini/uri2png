#!/usr/bin/env python3
"""
URI2PNG CLI - Multi-engine web screenshot tool.
"""

import argparse
import asyncio
import os
import sys
import time
from pathlib import Path

from . import create_engine, get_available_engines


def parse_args():
    parser = argparse.ArgumentParser(
        description="URI2PNG - Multi-engine web screenshot tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic screenshot with Playwright
  uri2png capture https://example.com -o screenshot.png

  # Use specific engine and browser
  uri2png capture https://example.com -e playwright -b firefox -o output.png

  # Custom viewport with aspect ratio
  uri2png capture https://example.com -a 16:9 -w 1920 -o output.png

  # Full page screenshot with delay
  uri2png capture https://example.com -f -d 2000 -o output.png

  # List available engines
  uri2png list

  # Start API server
  uri2png serve --host 0.0.0.0 --port 8080
""",
    )

    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # Capture command
    capture_parser = subparsers.add_parser("capture", help="Capture screenshot")
    capture_parser.add_argument("url", help="URL to capture")
    capture_parser.add_argument(
        "-o", "--output",
        default="screenshot.png",
        help="Output file path (default: screenshot.png)",
    )
    capture_parser.add_argument(
        "-e", "--engine",
        default="playwright",
        help="Screenshot engine (default: playwright)",
    )
    capture_parser.add_argument(
        "-b", "--browser",
        default="chromium",
        help="Browser type: chromium, firefox, webkit, chrome, edge (default: chromium)",
    )
    capture_parser.add_argument(
        "-w", "--width",
        type=int,
        default=1280,
        help="Viewport width (default: 1280)",
    )
    capture_parser.add_argument(
        "-H", "--height",
        type=int,
        default=1024,
        help="Viewport height (default: 1024)",
    )
    capture_parser.add_argument(
        "-a", "--aspect-ratio",
        help="Aspect ratio (e.g., 16:9, 4:3) - auto-calculates height",
    )
    capture_parser.add_argument(
        "-d", "--delay",
        type=int,
        default=0,
        help="Delay after page load in ms (default: 0)",
    )
    capture_parser.add_argument(
        "-t", "--timeout",
        type=int,
        default=30000,
        help="Navigation timeout in ms (default: 30000)",
    )
    capture_parser.add_argument(
        "-f", "--full-page",
        action="store_true",
        help="Capture full scrollable page",
    )
    capture_parser.add_argument(
        "-s", "--scale",
        type=float,
        default=1.0,
        help="Device scale factor (default: 1.0)",
    )
    capture_parser.add_argument(
        "-u", "--user-agent",
        help="Custom user agent string",
    )

    # List command
    list_parser = subparsers.add_parser("list", help="List available engines")

    # Serve command
    serve_parser = subparsers.add_parser("serve", help="Start API server")
    serve_parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="Host to bind (default: 0.0.0.0)",
    )
    serve_parser.add_argument(
        "--port",
        type=int,
        default=8080,
        help="Port to bind (default: 8080)",
    )

    # Benchmark command
    benchmark_parser = subparsers.add_parser("benchmark", help="Benchmark engines")
    benchmark_parser.add_argument("url", help="URL to test")
    benchmark_parser.add_argument(
        "-o", "--output-dir",
        default="./benchmarks",
        help="Output directory (default: ./benchmarks)",
    )

    return parser.parse_args()


async def cmd_capture(args):
    """Capture screenshot."""
    print(f"\n🚀 Capturing {args.url} with {args.engine}...\n")

    try:
        engine = create_engine(
            args.engine,
            browser_type=args.browser,
            width=args.width,
            height=args.height,
            aspect_ratio=args.aspect_ratio,
            delay=args.delay,
            timeout=args.timeout,
            full_page=args.full_page,
            device_scale_factor=args.scale,
            user_agent=args.user_agent,
        )

        async with engine:
            result = await engine.capture(args.url, args.output)

        if result.success:
            print("✅ Screenshot captured successfully!\n")
            print(f"   Engine: {result.engine}")
            print(f"   Browser: {result.browser_type}")
            print(f"   Viewport: {result.width}x{result.height}")
            print(f"   Duration: {result.duration}ms")
            print(f"   Output: {os.path.abspath(result.output_path)}\n")
            return 0
        else:
            print(f"❌ Screenshot failed: {result.error}\n")
            return 1

    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        return 1


def cmd_list(args):
    """List available engines."""
    print("\n📋 Available Screenshot Engines:\n")
    for engine in get_available_engines():
        print(f"   {engine['name']:<25} - {engine['description']}")
    print()


def cmd_serve(args):
    """Start API server."""
    print(f"\n🚀 Starting URI2PNG API server on {args.host}:{args.port}...\n")
    from .server import run_server
    run_server(host=args.host, port=args.port)


async def cmd_benchmark(args):
    """Benchmark all engines."""
    print(f"\n🏁 Benchmarking engines with {args.url}...\n")

    Path(args.output_dir).mkdir(parents=True, exist_ok=True)

    engines_to_test = [
        ("playwright-chromium", {"browser_type": "chromium"}),
        ("playwright-firefox", {"browser_type": "firefox"}),
        ("playwright-webkit", {"browser_type": "webkit"}),
    ]

    results = []

    for engine_name, options in engines_to_test:
        try:
            print(f"   Testing {engine_name}...")
            output_path = os.path.join(args.output_dir, f"{engine_name}.png")

            engine = create_engine(engine_name, **options)
            async with engine:
                result = await engine.capture(args.url, output_path)

            if result.success:
                results.append((engine_name, result.duration))
                print(f"   ✅ {engine_name}: {result.duration}ms")
            else:
                print(f"   ❌ {engine_name}: {result.error}")

        except Exception as e:
            print(f"   ❌ {engine_name}: {e}")

    if results:
        print("\n📊 Benchmark Results:\n")
        results.sort(key=lambda x: x[1])
        for i, (name, duration) in enumerate(results, 1):
            print(f"   {i}. {name:<25} {duration}ms")
        print()


def main():
    args = parse_args()

    if args.command == "capture":
        return asyncio.run(cmd_capture(args))
    elif args.command == "list":
        cmd_list(args)
        return 0
    elif args.command == "serve":
        cmd_serve(args)
        return 0
    elif args.command == "benchmark":
        return asyncio.run(cmd_benchmark(args))
    else:
        print("Usage: uri2png <command> [options]")
        print("Commands: capture, list, serve, benchmark")
        print("Run 'uri2png <command> --help' for more info")
        return 1


if __name__ == "__main__":
    sys.exit(main())
