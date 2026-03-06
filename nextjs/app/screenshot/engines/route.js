export async function GET() {
  return Response.json({
    engines: [
      { name: "playwright", description: "Playwright with Chromium (default)" },
    ],
  });
}
