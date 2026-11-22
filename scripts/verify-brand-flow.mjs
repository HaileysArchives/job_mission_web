// 브랜드 마케터 미션 흐름 검증 + 스크린샷. 사용법: [VW=1280] node scripts/verify-brand-flow.mjs
import { chromium } from "playwright";
const VW = Number(process.env.VW ?? 1440);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: VW, height: 900 } });
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)));
p.on("pageerror", (e) => errors.push("pageerror: " + e.message));
const id = "brand-marketing";
const base = `http://localhost:3100/missions/${id}`;
const shot = (n) => p.screenshot({ path: `shots/step4_${n}_${VW}.png`, fullPage: true });

await p.goto(base + "/play?step=1", { waitUntil: "networkidle" });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await shot("s1_empty");

await p.getByRole("radio", { name: "브랜드 정체성 전달 부족" }).click();
await p.waitForTimeout(400);
await shot("s1_selected");
const chosen = await p.getByRole("radio", { checked: true }).evaluate((el) => getComputedStyle(el).borderTopColor);
console.log("selected border color:", chosen, "(기대값 rgb(58, 155, 130))");

await p.getByRole("button", { name: "다음" }).click();
await p.waitForURL(/step=2/);
await p.locator("textarea").fill("인지율은 12%에서 18%로 올랐지만 구매의향은 8%에서 7%로 떨어졌고, 리뷰에서 브랜드가 뭘 지향하는지 모르겠다는 반응이 있습니다.");
await p.waitForTimeout(300);
await shot("s2");
await p.getByRole("button", { name: "다음" }).click();
await p.waitForURL(/step=3/);
await p.locator("textarea").fill("4주간 구매의향 회복 여부");
await shot("s3");
await p.getByRole("button", { name: "제출하고 피드백 보기" }).click();
await p.waitForURL(/result/);

const data = await p.evaluate((id) => ({
  progress: JSON.parse(localStorage.getItem(`jm_progress_${id}`)),
  events: JSON.parse(localStorage.getItem("jm_events") || "[]").map((e) => e.name + (e.props?.step ? `(${e.props.step})` : "")),
}), id);
console.log("progress:", JSON.stringify(data.progress));
console.log("events:", data.events.join(", "));
console.log("errors:", errors.filter((e) => !e.includes("404")).length ? errors : "없음 (result 404는 5단계 전이라 예상됨)");
await b.close();
