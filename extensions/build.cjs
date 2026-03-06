#!/usr/bin/env node

// uri2png browser toy build script
// Copies shared files into each browser directory, creates zips and checksums.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname);
const SHARED = path.join(ROOT, "shared");
const DIST = path.join(ROOT, "dist");

const BROWSERS = ["chrome", "firefox", "safari"];
const SHARED_FILES = ["background.js", "popup.html", "popup.js"];
const ICON_SIZES = [16, 32, 48, 128];

if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST, { recursive: true });
}

const checksums = { sha256: [], md5: [] };

for (const browser of BROWSERS) {
  const dest = path.join(ROOT, browser);

  for (const file of SHARED_FILES) {
    fs.copyFileSync(path.join(SHARED, file), path.join(dest, file));
  }

  const iconDir = path.join(dest, "icons");
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }
  for (const size of ICON_SIZES) {
    const iconFile = `icon-${size}.png`;
    const src = path.join(SHARED, iconFile);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(iconDir, iconFile));
    }
  }

  const zipName = `uri2png-${browser}.zip`;
  const zipPath = path.join(DIST, zipName);

  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  execSync(`cd "${dest}" && zip -r "${zipPath}" .`, { stdio: "pipe" });

  const zipData = fs.readFileSync(zipPath);
  const sha256 = crypto.createHash("sha256").update(zipData).digest("hex");
  const md5 = crypto.createHash("md5").update(zipData).digest("hex");

  checksums.sha256.push(`${sha256}  ${zipName}`);
  checksums.md5.push(`${md5}  ${zipName}`);

  console.log(`Built: ${zipName}`);
  console.log(`  SHA-256: ${sha256}`);
}

fs.writeFileSync(path.join(DIST, "SHA256SUMS"), checksums.sha256.join("\n") + "\n");
fs.writeFileSync(path.join(DIST, "MD5SUMS"), checksums.md5.join("\n") + "\n");

console.log("\nAll extensions built in extensions/dist/");
