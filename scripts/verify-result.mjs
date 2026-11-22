// 두 미션을 테스트 답안으로 끝까지 수행하고 결과 화면의 관찰 항목을 확인한다.
// 사용법: [VW=1280] node scripts/verify-result.mjs
import { chromium } from "playwright";

const VW = Number(process.env.VW ?? 1440);
const BASE = "http://localhost:3100";
const CASES = [
  {
    id: "performance-marketing",
    choice: "Google 검색",
    step2: "Google 검색이 ROAS가 가장 높고 CPA도 가장 낮아서 효율이 좋다고 판단했습니다.",
    step3: "ROAS를 올린다",
  },
  {
    id: "brand-marketing",
    choice: "브랜드 정체성 전달 부족",
    step2: "인지율은 18%로 올랐지만 구매의향은 7%로 떨어져서 브랜드 정체성 전달이 문제라고 봤습니다.",
    step3: "구매의향을 올린다",
  },
];

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: VW, height: 900 } });
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)));
p.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await p.goto(`${BASE}/missions/performance-marketing/play?step=1`, { waitUntil: "networkidle" });
await p.evaluate(() => localStorage.clear());

// 제출 전 결과 화면 접근 → 미션으로 돌려보내는지
await p.goto(`${BASE}/missions/performance-marketing/result`, { waitUntil: "networkidle" });
await p.waitForURL(/play\?step=1/, { timeout: 5000 }).catch(() => {});
console.log("제출 전 결과 접근 →", new URL(p.url()).pathname + new URL(p.url()).search);

let allOk = true;
for (const c of CASES) {
  await p.goto(`${BASE}/missions/${c.id}/play?step=1`, { waitUntil: "networkidle" });
  await p.getByRole("radio", { name: c.choice }).click();
  await p.getByRole("button", { name: "다음" }).click();
  await p.waitForURL(/step=2/);
  await p.locator("textarea").fill(c.step2);
  await p.getByRole("button", { name: "다음" }).click();
  await p.waitForURL(/step=3/);
  await p.locator("textarea").fill(c.step3);
  await p.waitForTimeout(1200); // 소요시간이 0초가 아니게
  await p.getByRole("button", { name: "제출하고 피드백 보기" }).click();
  await p.waitForURL(/result/);
  await p.getByText("이번 수행에서 관찰된 것").waitFor();

  const marks = await p
    .locator("section", { hasText: "이번 수행에서 관찰된 것" })
    .locator("li svg")
    .filter({ visible: true })
    .evaluateAll((els) =>
    els.map((el) => (el.getAttribute("aria-label") === "관찰됨" ? "✓" : "–")).join(""),
  );
  const duration = await p.locator("strong").filter({ hasText: /초$/, visible: true }).first().innerText();
  const ok = marks === "✓✓––";
  allOk &&= ok;
  console.log(`${ok ? "PASS" : "FAIL"} ${c.id}: 관찰 항목 ${marks} (기대 ✓✓––), 실제 측정 소요시간 ${duration}`);

  // 새로고침해도 결과 유지
  await p.reload({ waitUntil: "networkidle" });
  await p.getByText("이번 수행에서 관찰된 것").waitFor();
  console.log("   새로고침 후 결과 유지: OK");

  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `shots/step5_${c.id}_${VW}.png`, fullPage: true });

  // 레퍼런스와 같은 "9분 42초"로 맞춘 비교용 캡처 (화면 비교 전용)
  await p.evaluate((id) => {
    const k = `jm_progress_${id}`;
    const v = JSON.parse(localStorage.getItem(k));
    v.durationSec = 582;
    localStorage.setItem(k, JSON.stringify(v));
  }, c.id);
  await p.reload({ waitUntil: "networkidle" });
  await p.getByText("이번 수행에서 관찰된 것").waitFor();
  await p.screenshot({ path: `shots/step5_${c.id}_${VW}_ref.png`, fullPage: true });
}

const events = await p.evaluate(() =>
  JSON.parse(localStorage.getItem("jm_events") || "[]").map((e) => e.name).filter((n) => n === "mission_submit" || n === "feedback_view"),
);
console.log("제출·결과 이벤트:", events.join(", "));
console.log("콘솔 오류:", errors.length ? errors : "없음");
await b.close();
process.exit(allOk ? 0 : 1);
