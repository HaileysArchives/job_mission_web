// 루브릭 판정 테스트. 실행: node scripts/test-rubric.mts
import { generateFeedback } from "../lib/feedback.ts";
import { RUBRICS } from "../data/feedback.ts";

type Case = {
  name: string;
  mission: keyof typeof RUBRICS;
  answers: { choice: string; step2: string; step3: string };
  expect: string; // data, multi, compare, measure 순서의 ✓/–
};

const cases: Case[] = [
  {
    name: "퍼포먼스 — 명세 9장 테스트 답안",
    mission: "performance-marketing",
    answers: {
      choice: "Google 검색",
      step2: "Google 검색이 ROAS가 가장 높고 CPA도 가장 낮아서 효율이 좋다고 판단했습니다.",
      step3: "ROAS를 올린다",
    },
    expect: "✓✓––",
  },
  {
    name: "브랜드 — 요청하신 테스트 답안",
    mission: "brand-marketing",
    answers: {
      choice: "브랜드 정체성 전달 부족",
      step2: "인지율은 18%로 올랐지만 구매의향은 7%로 떨어져서 브랜드 정체성 전달이 문제라고 봤습니다.",
      step3: "구매의향을 올린다",
    },
    expect: "✓✓––",
  },
  // 아래는 규칙이 반대 방향으로도 동작하는지 보는 보조 케이스
  {
    name: "퍼포먼스 — 현직자 참고 답안 수준",
    mission: "performance-marketing",
    answers: {
      choice: "Google 검색",
      step2: "Google 검색은 ROAS 550%, CPA 15,000원으로 효율이 가장 좋지만, Meta 같은 상단 채널 없이는 검색량이 늘지 않습니다.",
      step3: "증액 후 2주간 CPA 유지 여부와 검색 노출점유율(SoV) 변화를 봅니다.",
    },
    expect: "✓✓✓✓",
  },
  {
    name: "퍼포먼스 — 노출점유율 한 단어는 지표 1개로만",
    mission: "performance-marketing",
    answers: { choice: "Google 검색", step2: "노출점유율이 중요하다고 생각합니다.", step3: "잘 되는지 본다" },
    expect: "✓–––",
  },
  {
    name: "브랜드 — 근거 없는 짧은 답",
    mission: "brand-marketing",
    answers: { choice: "가격 경쟁력", step2: "그냥 그렇게 느껴졌기 때문에 가장 시급하다고 봤어요.", step3: "잘 팔리는지 본다" },
    expect: "––––",
  },
];

let failed = 0;
for (const c of cases) {
  const r = generateFeedback(c.answers, RUBRICS[c.mission]);
  const got = r.observations.map((o) => (o.met ? "✓" : "–")).join("");
  const ok = got === c.expect;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${c.name}  기대 ${c.expect} / 결과 ${got}`);
  if (c.expect === "✓✓––") {
    r.observations.forEach((o) => console.log(`      ${o.met ? "✓" : "–"} ${o.label}`));
    r.paragraphs.forEach((p) => console.log("      ¶ " + p.map((s) => (s.bold ? `**${s.text}**` : s.text)).join("")));
    console.log("      ─ " + r.tip);
  }
}
console.log(failed ? `\n${failed}건 실패` : "\n전체 통과");
process.exit(failed ? 1 : 0);
