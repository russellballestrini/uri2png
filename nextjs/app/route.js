export async function GET() {
  return Response.json({
    name: "uri2png",
    version: "2.0.0",
    endpoints: {
      "/screenshot/capture/image": "GET - Capture and return PNG directly",
      "/screenshot/engines": "GET - List available engines",
      "/health": "GET - Health check",
    },
  });
}
