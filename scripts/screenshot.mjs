// 사용법: node scripts/screenshot.mjs <경로> <출력파일> [--full]
// 예: node scripts/screenshot.mjs /jobs/performance-marketing shots/01.png
import { chromium } from "playwright";

const [, , path = "/", out = "shots/out.png", flag] = process.argv;
const base = process.env.BASE_URL ?? "http://localhost:3100";

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(process.env.VW ?? 1440), height: Number(process.env.VH ?? 900) },
  deviceScaleFactor: 1,
});
await page.goto(base + path, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out, fullPage: flag === "--full" });
await browser.close();
console.log("saved", out);
