// 1024px에서 모든 화면이 가로 스크롤·겹침 없이 보이는지, 1023px 이하에서는 "PC에서 이용해 주세요" 안내가 덮는지 확인한다.
// 사용법: node scripts/verify-responsive.mjs
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const PAGES = [
  ["job", "/jobs/performance-marketing"],
  ["missions", "/missions"],
  ["brief", "/missions/brand-marketing/brief"],
  ["play_perf", "/missions/performance-marketing/play?step=1"],
  ["play_brand", "/missions/brand-marketing/play?step=1"],
  ["result", "/missions/performance-marketing/result"],
  ["funnel", "/admin/funnel"],
];

const b = await chromium.launch();
let allOk = true;
const check = (label, ok) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
  allOk = allOk && ok;
};

for (const width of [1024, 1023, 768]) {
  const p = await b.newPage({ viewport: { width, height: 800 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  // 결과 화면을 볼 수 있도록 제출한 상태를 미리 넣어 둔다
  await p.goto(BASE + "/missions", { waitUntil: "networkidle" });
  await p.evaluate(() => {
    localStorage.setItem(
      "jm_progress_performance-marketing",
      JSON.stringify({
        choice: "Google 검색",
        step2: "Google 검색이 ROAS가 가장 높고 CPA도 가장 낮아서 효율이 좋다고 판단했습니다.",
        step3: "ROAS를 올린다",
        startedAt: Date.now() - 582000,
        submittedAt: Date.now(),
        durationSec: 582,
      }),
    );
  });

  for (const [name, path] of PAGES) {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    const notice = await p.getByText("PC에서 이용해 주세요").isVisible();
    if (width >= 1024) {
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(`${width}px ${name}: 안내 숨김, 가로 넘침 ${overflow}px`, !notice && overflow <= 0);
      await p.screenshot({ path: `shots/step8_${name}_${width}.png`, fullPage: true });
    } else {
      check(`${width}px ${name}: "PC에서 이용해 주세요" 표시`, notice);
      if (name === "job") await p.screenshot({ path: `shots/step8_notice_${width}.png` });
    }
  }
  if (errors.length) check(`${width}px 페이지 오류 ${JSON.stringify(errors)}`, false);
  await p.close();
}
await b.close();
process.exit(allOk ? 0 : 1);
