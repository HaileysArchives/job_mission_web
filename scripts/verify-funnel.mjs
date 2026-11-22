// 실제 체험 1회 → /admin/funnel에 단계별로 잡히는지, 데모 데이터·필터·초기화가 동작하는지 검증한다.
// 사용법: [VW=1440] node scripts/verify-funnel.mjs
import { chromium } from "playwright";

const VW = Number(process.env.VW ?? 1440);
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: VW, height: 900 } });
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)));
p.on("pageerror", (e) => errors.push("pageerror: " + e.message));
let allOk = true;
const check = (label, ok) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
  allOk = allOk && ok;
};
const shot = async (n) => {
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `shots/step7_${n}_${VW}.png`, fullPage: true });
};
/** 퍼널 표에서 단계별 세션 수 읽기 */
const readFunnel = () =>
  p.locator("ol > li").filter({ visible: true }).evaluateAll((lis) =>
    lis.map((li) => {
      const label = li.querySelector("p")?.textContent ?? "";
      const nums = [...li.querySelectorAll(":scope > p")].map((x) => x.textContent);
      return { label, sessions: Number(nums[0]) };
    }),
  );

// 0. 초기화 후 빈 상태
await p.goto(`${BASE}/admin/funnel`, { waitUntil: "networkidle" });
await p.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
await p.reload({ waitUntil: "networkidle" });
check("빈 상태 안내 표시", await p.getByText("아직 기록된 체험이 없습니다").isVisible());
check("상단 데모 안내 문구", await p.getByText("이 페이지는 이 브라우저의 체험 기록만 보여주는 데모입니다").isVisible());
await shot("empty");

// 1. 실제 체험: 공고 → CTA → 브리프 → 수행(이전/다음 왕복 포함) → 결과 → 공고 → 지원
await p.goto(`${BASE}/jobs/performance-marketing`, { waitUntil: "networkidle" });
await p.mouse.wheel(0, 600);
await p.waitForTimeout(500);
await p.getByRole("link", { name: /10분 체험 시작/ }).click();
await p.getByRole("button", { name: "미션 시작" }).click();
await p.waitForURL(/step=1/);
await p.getByRole("radio", { name: "Google 검색" }).click();
await p.getByRole("button", { name: "다음" }).click();
await p.waitForURL(/step=2/);
await p.locator("textarea:visible").fill("Google 검색이 ROAS가 가장 높고 CPA도 가장 낮아서 효율이 좋다고 판단했습니다.");
await p.getByRole("button", { name: "다음" }).click();
await p.waitForURL(/step=3/);
await p.getByRole("button", { name: "이전" }).click(); // 왕복해도 세션 기준 1회로 세는지
await p.waitForURL(/step=2/);
await p.getByRole("button", { name: "다음" }).click();
await p.waitForURL(/step=3/);
await p.locator("textarea:visible").fill("ROAS를 올린다");
await p.getByRole("button", { name: "제출하고 피드백 보기" }).click();
await p.waitForURL(/result/);
await p.reload({ waitUntil: "networkidle" }); // feedback_view 중복
await p.getByRole("link", { name: "이 직무 공고 보기" }).filter({ visible: true }).click();
await p.waitForURL(/\/jobs\//);
await p.getByRole("button", { name: "입사지원 하기" }).click();

// 2. 대시보드에 단계별 1세션씩
await p.goto(`${BASE}/admin/funnel`, { waitUntil: "networkidle" });
await p.getByText("단계별 도달 세션").waitFor();
const mine = await readFunnel();
console.log("   " + mine.map((r) => `${r.label}:${r.sessions}`).join(" → "));
check("방금 한 체험이 10개 단계 모두 1세션으로 집계", mine.length === 10 && mine.every((r) => r.sessions === 1));
const rawStep2 = await p.evaluate(() =>
  JSON.parse(localStorage.getItem("jm_events")).filter((e) => e.name === "step_complete" && e.props.step === 2).length,
);
check(`step_complete(2) 이벤트 ${rawStep2}건이어도 세션은 1로 셈`, rawStep2 >= 2);
check("최근 이벤트 표에 apply_click 표시", await p.getByRole("cell", { name: "apply_click" }).first().isVisible());
await shot("mine");

// 3. 데모 데이터
await p.getByRole("button", { name: "데모 데이터 채우기" }).click();
await p.getByText(/데모 데이터\(가짜 데이터\) \d+건/).waitFor();
const demo = await readFunnel();
console.log("   " + demo.map((r) => `${r.label}:${r.sessions}`).join(" → "));
const monotone = demo.every((r, i) => i === 0 || r.sessions <= demo[i - 1].sessions);
check(`데모 채우기 → CTA 노출 ${demo[0].sessions}세션 (기대 5001 = 데모 5000 + 내 체험 1), 단계별 감소`, demo[0].sessions === 5001 && monotone);
const ctaRate = (demo[1].sessions / demo[0].sessions) * 100;
const completion = (demo[7].sessions / demo[2].sessions) * 100;
check(`전체 CTA 클릭률 ${ctaRate.toFixed(1)}% (3% 안팎), 완주율 ${completion.toFixed(1)}% (30% 안팎)`, ctaRate >= 2.5 && ctaRate <= 3.5 && completion >= 27 && completion <= 33);
check("가짜 데이터 안내 유지", await p.getByText("데모 데이터(가짜 데이터)").isVisible());
await p.getByRole("button", { name: "데모 데이터 채우기" }).click(); // 두 번 눌러도 중복되지 않는지
await p.waitForTimeout(300);
check("데모 채우기를 다시 눌러도 중복 없음", (await readFunnel())[0].sessions === 5001);
await shot("demo");

// 호버 툴팁
await p.locator("ol > li").nth(3).hover();
await p.waitForTimeout(200);
check("막대 호버 시 툴팁", await p.getByRole("tooltip").filter({ visible: true }).count() === 1);
await p.screenshot({ path: `shots/step7_tooltip_${VW}.png`, clip: { x: 0, y: 380, width: VW, height: 520 } });

// 4. 직무 필터
await p.getByRole("tab", { name: "브랜드 마케터" }).click();
const brand = await readFunnel();
const brandCta = (brand[1].sessions / brand[0].sessions) * 100;
const brandDone = (brand[7].sessions / brand[2].sessions) * 100;
check(`브랜드 필터 → ${brand[0].sessions}세션, CTA ${brandCta.toFixed(1)}%(목표 2~4% 미달), 완주율 ${brandDone.toFixed(1)}%(목표 25~35% 미달)`, brand[0].sessions === 2000 && brandCta < 2 && brandCta > 1.5 && brandDone < 25 && brandDone > 22);
await shot("demo_brand");

// 5. 초기화 (확인창 수락)
p.once("dialog", (d) => d.accept());
await p.getByRole("button", { name: "데이터 초기화" }).click();
await p.getByText("아직 기록된 체험이 없습니다").waitFor();
check("데이터 초기화 → 빈 상태", true);

check(`콘솔 오류 ${errors.length ? JSON.stringify(errors) : "없음"}`, errors.length === 0);
await b.close();
process.exit(allOk ? 0 : 1);
