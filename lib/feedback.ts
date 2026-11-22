// 루브릭 판정 + 피드백 조합 (명세 5-4).
// 나중에 실제 LLM으로 바꿀 때는 generateFeedback의 구현만 교체하면 된다.

import type { ObservationKey, RichText, Rubric } from "@/data/feedback";

export type Answers = { choice?: string; step2?: string; step3?: string };

export type Observation = { key: ObservationKey; met: boolean; label: string };

export type FeedbackResult = {
  observations: Observation[];
  /** 시뮬레이션 피드백 본문 문단 (굵게 표시 구간 포함) */
  paragraphs: RichText[];
  /** 구분선 아래 "다음 과제에서는 …" 한 문장 */
  tip: string;
};

const ORDER: ObservationKey[] = ["data", "multi", "compare", "measure"];
/** 좋았던 점으로 먼저 언급할 순서 */
const OPENER_PRIORITY: ObservationKey[] = ["multi", "data", "measure", "compare"];
/** 보완점으로 먼저 언급할 순서 */
const GAP_PRIORITY: ObservationKey[] = ["compare", "measure", "multi", "data"];

const lower = (s: string) => s.toLowerCase();
const hasTerm = (text: string, term: string) => lower(text).includes(lower(term));

type Hit = { family: number; term: string; start: number; end: number };

/** 계열별 첫 등장 위치. 긴 단어부터 자리를 차지해 한 단어가 두 계열로 세어지지 않게 한다. */
function findFamilies(text: string, families: string[][]): Hit[] {
  const src = lower(text);
  const candidates: Hit[] = [];
  families.forEach((terms, family) => {
    for (const term of terms) {
      const t = lower(term);
      let from = 0;
      for (;;) {
        const i = src.indexOf(t, from);
        if (i < 0) break;
        candidates.push({ family, term, start: i, end: i + t.length });
        from = i + 1;
      }
    }
  });
  candidates.sort((a, b) => b.term.length - a.term.length || a.start - b.start);

  const taken: Hit[] = [];
  for (const c of candidates) {
    if (taken.some((t) => c.start < t.end && t.start < c.end)) continue;
    taken.push(c);
  }
  const firstByFamily = new Map<number, Hit>();
  for (const h of taken.sort((a, b) => a.start - b.start)) {
    if (!firstByFamily.has(h.family)) firstByFamily.set(h.family, h);
  }
  return [...firstByFamily.values()].sort((a, b) => a.start - b.start);
}

/** 두 지표가 처음 함께 나오는 구절을 답안에서 그대로 인용한다. 예: "ROAS가 가장 높고 CPA도 가장 낮아서" */
function quoteClause(text: string, first: Hit, second: Hit): string | null {
  const rest = text.slice(second.end);
  const m = rest.match(/^[^.!?\n]*?(서|고|며|지만|는데|니까)(?=[\s,.]|$)/);
  const stop = rest.search(/[,.!?\n]/);
  const endOffset = m ? m[0].length : stop >= 0 ? stop : rest.length;
  let quote = text.slice(first.start, second.end + endOffset).trim();
  if (!quote) return null;
  if (quote.length > 48) quote = quote.slice(0, 47).trimEnd() + "…";
  return quote;
}

export function generateFeedback(answers: Answers, rubric: Rubric): FeedbackResult {
  const step2 = answers.step2 ?? "";
  const step3 = answers.step3 ?? "";
  const both = `${step2}\n${step3}`;

  // 1. 데이터 근거
  const data =
    rubric.dataPatterns.some((re) => re.test(both)) ||
    rubric.dataTerms.some((t) => hasTerm(both, t));

  // 2. 복수 지표 / 계열
  const families = findFamilies(both, rubric.families);
  const multi = families.length >= rubric.minFamilies;

  // 3. 선택하지 않은 선택지와의 비교
  const chosenKeywords = (answers.choice && rubric.optionKeywords[answers.choice]) || [];
  const compare = Object.entries(rubric.optionKeywords)
    .filter(([option]) => option !== answers.choice)
    .some(([, keywords]) =>
      keywords
        .filter((k) => !chosenKeywords.some((c) => lower(c) === lower(k)))
        .some((k) => hasTerm(both, k)),
    );

  // 4. Step 3에 기간 + 지표
  const measure =
    rubric.periodPatterns.some((re) => re.test(step3)) &&
    rubric.step3Metrics.some((t) => hasTerm(step3, t));

  const met: Record<ObservationKey, boolean> = { data, multi, compare, measure };

  const observations: Observation[] = ORDER.map((key) => {
    let label = met[key] ? rubric.labels[key].met : rubric.labels[key].unmet;
    if (key === "multi" && met.multi && rubric.multiLabelWithTerms) {
      const names = families.slice(0, 2).map((h) => rubric.families[h.family][0]);
      label = label.replace("복수 지표", `복수 지표(${names.join("·")})`);
    }
    return { key, met: met[key], label };
  });

  // 피드백 문단 조합: 좋았던 점 1문단 + 보완점 1문단 + 다음 과제 한 문장
  const t = rubric.templates;
  const openerKey = OPENER_PRIORITY.find((k) => met[k]) ?? "none";
  let opener = t.opener[openerKey];
  if (openerKey === "multi") {
    const step2Families = findFamilies(step2, rubric.families);
    const quote =
      step2Families.length >= 2 ? quoteClause(step2, step2Families[0], step2Families[1]) : null;
    opener = quote
      ? opener.replace("{quote}", quote)
      : opener.replace(/'\{quote\}'라고 쓰신 부분에서 /, "답안에서 ");
  }

  const gapKey = GAP_PRIORITY.find((k) => !met[k]);
  const paragraphs: RichText[] = [
    [{ text: opener }],
    gapKey ? t.gap[gapKey] : t.allMet.gap,
  ];
  const tip = gapKey ? t.tip[gapKey] : t.allMet.tip;

  return { observations, paragraphs, tip };
}
