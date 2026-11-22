// 공고 → 브리프 → 미션 → 결과 → 다음 행동까지 전체 여정을 검증하고 6단계 화면을 캡처한다.
// 사용법: [VW=1440] node scripts/verify-journey.mjs
import { chromium } from "playwright";

const VW = Number(process.env.VW ?? 1440);
const BASE = "http://localhost:3100";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: VW, height: 900 } });
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)));
p.on("pageerror", (e) => errors.push("pageerror: " + e.message));
const shot = async (n) => {
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `shots/step6_${n}_${VW}.png`, fullPage: true });
};
const path = () => new URL(p.url()).pathname + new URL(p.url()).search;
const check = (label, ok) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
  return allOk && ok;
};
let allOk = true;

async function playThrough(choice, s2, s3) {
  await p.getByRole("radio", { name: choice }).click();
  await p.getByRole("button", { name: "다음" }).click();
  await p.waitForURL(/step=2/);
  await p.locator("textarea:visible").fill(s2);
  await p.getByRole("button", { name: "다음" }).click();
  await p.waitForURL(/step=3/);
  await p.locator("textarea:visible").fill(s3);
  await p.getByRole("button", { name: "제출하고 피드백 보기" }).click();
  await p.waitForURL(/result/);
  await p.getByText("이번 수행에서 관찰된 것").first().waitFor();
}

// 0. 직군 탐색
await p.goto(`${BASE}/missions`, { waitUntil: "networkidle" });
await p.evaluate(() => localStorage.clear());
await p.getByRole("heading", { name: "퍼포먼스 마케터" }).waitFor();
const active = await p.locator("main a[href*='/brief']").count();
const soon = await p.getByText("준비 중", { exact: true }).count();
allOk = check(`/missions: 활성 카드 ${active}개(기대 2), 준비 중 ${soon}개(기대 2)`, active === 2 && soon === 2);
await shot("missions");

// 1. 공고 → 10분 체험 → 브리프
await p.goto(`${BASE}/jobs/performance-marketing`, { waitUntil: "networkidle" });
await p.getByRole("link", { name: /10분 체험 시작/ }).click();
await p.waitForURL(/\/brief$/);
allOk = check(`공고 CTA → ${path()}`, path() === "/missions/performance-marketing/brief");
await p.getByRole("button", { name: "미션 시작" }).waitFor();
await shot("brief_performance");

// 2. 미션 시작 → 수행 → 결과
await p.getByRole("button", { name: "미션 시작" }).click();
await p.waitForURL(/play\?step=1/);
await playThrough(
  "Google 검색",
  "Google 검색이 ROAS가 가장 높고 CPA도 가장 낮아서 효율이 좋다고 판단했습니다.",
  "ROAS를 올린다",
);
allOk = check(`제출 → ${path()}`, path() === "/missions/performance-marketing/result");
await p.getByText("다른 세부 직무도 해볼래요?").first().waitFor();
await shot("result_performance");

// 3. 다음 행동: 다른 세부 직무 → 브랜드 브리프
await p.getByRole("link", { name: /브랜드 마케터 미션 해보기/ }).click();
await p.waitForURL(/brand-marketing\/brief/);
allOk = check(`다른 세부 직무 → ${path()}`, path() === "/missions/brand-marketing/brief");
await p.getByRole("button", { name: "미션 시작" }).waitFor();
await shot("brief_brand");
await p.getByRole("button", { name: "미션 시작" }).click();
await p.waitForURL(/play\?step=1/);
await playThrough(
  "브랜드 정체성 전달 부족",
  "인지율은 18%로 올랐지만 구매의향은 7%로 떨어져서 브랜드 정체성 전달이 문제라고 봤습니다.",
  "구매의향을 올린다",
);
await p.getByText("다른 세부 직무도 해볼래요?").first().waitFor();
const otherBtn = await p.getByRole("link", { name: /미션 해보기/ }).filter({ visible: true }).innerText();
allOk = check(`브랜드 결과의 다른 직무 버튼: "${otherBtn.trim()}"`, otherBtn.includes("퍼포먼스 마케터"));
await shot("result_brand");

// 4. 이 직무 공고 보기
await p.getByRole("link", { name: "이 직무 공고 보기" }).filter({ visible: true }).click();
await p.waitForURL(/\/jobs\//);
allOk = check(`이 직무 공고 보기 → ${path()}`, path() === "/jobs/brand-marketing");

// 5. 제출한 미션을 브리프에서 다시 시작하면 새 시도(답안 초기화)
await p.goto(`${BASE}/missions/performance-marketing/brief`, { waitUntil: "networkidle" });
await p.getByRole("button", { name: "미션 시작" }).click();
await p.waitForURL(/play\?step=1/);
const checked = await p.getByRole("radio", { checked: true }).count();
allOk = check(`제출 후 다시 시작 → 선택 초기화 (선택된 옵션 ${checked}개)`, checked === 0);

// 6. 진행 중에 브리프로 나갔다 오면 이어서 하기
await p.getByRole("radio", { name: "Meta" }).click();
await p.getByRole("button", { name: "이전" }).click();
await p.waitForURL(/\/brief$/);
await p.getByRole("button", { name: "미션 시작" }).click();
await p.waitForURL(/play\?step=1/);
const kept = await p.getByRole("radio", { checked: true }).filter({ visible: true }).innerText();
allOk = check(`진행 중 브리프 왕복 → 선택 유지 ("${kept}")`, kept === "Meta");

const events = await p.evaluate(() => JSON.parse(localStorage.getItem("jm_events") || "[]").map((e) => e.name));
const need = ["mission_impression", "mission_cta_click", "mission_start", "step_complete", "mission_submit", "feedback_view", "next_mission_click", "recommendation_click"];
const missing = need.filter((n) => !events.includes(n));
allOk = check(`퍼널 이벤트 모두 기록 ${missing.length ? "(누락: " + missing.join(", ") + ")" : ""}`, missing.length === 0);
allOk = check(`콘솔 오류 ${errors.length ? JSON.stringify(errors) : "없음"}`, errors.length === 0);

await b.close();
process.exit(allOk ? 0 : 1);
