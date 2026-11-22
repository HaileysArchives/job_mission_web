import { chromium } from "playwright";
const VW = Number(process.env.VW ?? 1440);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: VW, height: 900 } });
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)));
p.on("pageerror", (e) => errors.push("pageerror: " + e.message));
const base = "http://localhost:3100/missions/performance-marketing";
const shot = (n, full = true) => p.screenshot({ path: `shots/step3_${n}_${VW}.png`, fullPage: full });

await p.goto(base + "/play?step=1", { waitUntil: "networkidle" });
await p.evaluate(() => { localStorage.clear(); });
// 건너뛰기 방지 확인
await p.goto(base + "/play?step=3", { waitUntil: "networkidle" });
await p.waitForTimeout(500);
console.log("skip guard ->", new URL(p.url()).search);

await p.evaluate(() => document.fonts.ready);
await shot("s1_empty");
await p.getByRole("radio", { name: "Google 검색" }).click();
await p.waitForTimeout(400);
await shot("s1_selected");
await p.reload({ waitUntil: "networkidle" });
await p.waitForTimeout(300);
console.log("choice after reload:", await p.getByRole("radio", { checked: true }).innerText());
await p.getByRole("button", { name: "다음" }).click();
await p.waitForURL(/step=2/);

const s2 = "Google 검색이 ROAS가 가장 높고 CPA도 가장 낮아서 효율이 좋다고 판단했습니다.";
await p.locator("textarea").fill("짧음");
console.log("next disabled (short):", await p.getByRole("button", { name: "다음" }).isDisabled());
await p.locator("textarea").fill(s2);
await p.waitForTimeout(300);
await shot("s2");
await p.getByRole("button", { name: "다음" }).click();
await p.waitForURL(/step=3/);
await p.locator("textarea").fill("ROAS를 올린다");
await shot("s3");
await p.getByRole("button", { name: "이전" }).click();
await p.waitForURL(/step=2/);
console.log("step2 kept after back:", (await p.locator("textarea").inputValue()) === s2);
await p.getByRole("button", { name: "다음" }).click();
await p.waitForURL(/step=3/);
await p.getByRole("button", { name: "제출하고 피드백 보기" }).click();
await p.waitForURL(/result/);

const data = await p.evaluate(() => ({
  progress: JSON.parse(localStorage.getItem("jm_progress_performance-marketing")),
  events: JSON.parse(localStorage.getItem("jm_events") || "[]").map((e) => e.name + (e.props?.step ? `(${e.props.step})` : "")),
}));
console.log("progress:", JSON.stringify(data.progress));
console.log("events:", data.events.join(", "));
console.log("errors:", errors.filter((e) => !e.includes("404")).length ? errors : "none (404 for result page expected)");
await b.close();
