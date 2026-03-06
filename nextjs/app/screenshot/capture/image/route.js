import { capture } from "../../../../lib/capture.js";

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const url = params.get("url");

  if (!url) {
    return Response.json({ error: "url parameter is required" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return Response.json({ error: "invalid url" }, { status: 400 });
  }

  const width = parseInt(params.get("width") || "1280", 10);
  const height = parseInt(params.get("height") || "1024", 10);
  const aspectRatio = params.get("aspect_ratio") || null;
  const delay = parseInt(params.get("delay") || "0", 10);
  const timeout = parseInt(params.get("timeout") || "30000", 10);
  const fullPage = params.get("full_page") === "true";
  const deviceScaleFactor = parseFloat(params.get("device_scale_factor") || "1");
  const userAgent = params.get("user_agent") || null;

  try {
    const result = await capture({
      url,
      width,
      height,
      aspectRatio,
      delay,
      timeout,
      fullPage,
      deviceScaleFactor,
      userAgent,
    });

    return new Response(result.buffer, {
      headers: {
        "Content-Type": "image/png",
        "X-Screenshot-Engine": "playwright",
        "X-Screenshot-Browser": "chromium",
        "X-Screenshot-Duration": String(result.duration),
        "X-Screenshot-Width": String(result.width),
        "X-Screenshot-Height": String(result.height),
      },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
