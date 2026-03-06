import { chromium } from "playwright";

let browser = null;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
}

export async function capture({
  url,
  width = 1280,
  height = 1024,
  aspectRatio = null,
  delay = 0,
  timeout = 30000,
  fullPage = false,
  deviceScaleFactor = 1,
  userAgent = null,
}) {
  if (aspectRatio) {
    const match = aspectRatio.match(/^(\d+):(\d+)$/);
    if (match) {
      height = Math.round(width * Number(match[2]) / Number(match[1]));
    }
  }

  const b = await getBrowser();
  const context = await b.newContext({
    viewport: { width, height },
    deviceScaleFactor,
    userAgent: userAgent || undefined,
  });

  const page = await context.newPage();
  const startTime = Date.now();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout });

    if (delay > 0) {
      await page.waitForTimeout(delay);
    }

    const buffer = await page.screenshot({ fullPage, type: "png" });
    const duration = Date.now() - startTime;

    return { buffer, width, height, duration };
  } finally {
    await page.close();
    await context.close();
  }
}
