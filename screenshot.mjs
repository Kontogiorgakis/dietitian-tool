import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const url = process.argv[2];
const label = process.argv[3] || "";

if (!url) {
  console.error("Usage: node screenshot.mjs <url> [label]");
  process.exit(1);
}

const dir = "screenshots";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Auto-increment screenshot number
const existing = fs.readdirSync(dir).filter((f) => f.startsWith("screenshot-"));
let maxNum = 0;
for (const f of existing) {
  const match = f.match(/^screenshot-(\d+)/);
  if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
}
const num = maxNum + 1;
const filename = label
  ? `screenshot-${num}-${label}.png`
  : `screenshot-${num}.png`;
const filepath = path.join(dir, filename);

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
// SHOT_WIDTH=390 node screenshot.mjs <url> [label] captures the phone breakpoint.
const width = Number(process.env.SHOT_WIDTH) || 1280;
await page.setViewport({ width, height: width < 768 ? 844 : 800, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
await page.screenshot({ path: filepath, fullPage: process.env.SHOT_FULL === "1" });
await browser.close();

console.log(filepath);
