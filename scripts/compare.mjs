// 레퍼런스와 구현 스크린샷을 위/아래로 붙여 한 장의 비교 이미지를 만든다.
// 사용법: node scripts/compare.mjs <out.png> <label:이미지경로[:cropTopPx:cropHeightPx]> ...
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , out, ...items] = process.argv;
const W = 1440;

const blocks = items
  .map((item) => {
    const [label, file, top = "0", h = ""] = item.split("|");
    const b64 = readFileSync(resolve(file)).toString("base64");
    const box = h
      ? `height:${h}px;overflow:hidden;`
      : "";
    return `<section><h3>${label}</h3><div style="${box}border:1px solid #ccc">
      <img src="data:image/png;base64,${b64}" style="display:block;width:${W}px;margin-top:-${top}px"/></div></section>`;
  })
  .join("");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W + 48, height: 600 } });
await page.setContent(`<html><body style="margin:0;padding:24px;background:#fff;font-family:sans-serif">
<style>h3{margin:16px 0 8px;font-size:18px;color:#c2410c}</style>${blocks}</body></html>`);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log("saved", out);
