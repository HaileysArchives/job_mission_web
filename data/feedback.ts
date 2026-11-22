// 관찰 항목 루브릭과 "시뮬레이션 피드백" 템플릿 (명세 5-4, 6-2).
// 외부 AI 없이 규칙으로만 판정한다. 점수·등급은 만들지 않는다.
//
// 문구 원칙
// - 출처 표시: [스크린샷] reference/04_result.png 그대로, [명세] job_mission.md 표 그대로,
//   [확정] = 스크린샷·명세에 없어 초안을 쓴 뒤 6단계에서 확정한 문구 (출처 표시가 없는 문구)
// - 미충족 문구는 평가가 아니라 관찰로 쓴다. "부족합니다"(X) → "이번 답안에서는 … 보이지 않았습니다"(O)
// - 말투: 피드백 문단은 스크린샷과 같은 합니다체, 관찰 항목은 스크린샷과 같은 "~함 / ~되지 않음"

import type { MissionId } from "@/data/missions";

export type ObservationKey = "data" | "multi" | "compare" | "measure";

/** 굵게 표시할 부분을 나눠 담은 문단 */
export type RichText = { text: string; bold?: boolean }[];

export type Rubric = {
  /** 항목 1: 숫자 또는 지표명 */
  dataTerms: string[];
  dataPatterns: RegExp[];
  /** 항목 2: 서로 다른 계열이 minFamilies개 이상 등장. 각 계열의 첫 단어가 표시 이름 */
  families: string[][];
  minFamilies: number;
  /** 항목 3: 선택지별 키워드 (선택하지 않은 선택지의 키워드가 등장하면 충족) */
  optionKeywords: Record<string, string[]>;
  /** 항목 4: Step 3에 기간 + 지표 */
  periodPatterns: RegExp[];
  step3Metrics: string[];
  labels: Record<ObservationKey, { met: string; unmet: string }>;
  /** 항목 2 충족 문구에 감지된 지표 이름을 넣을지 (퍼포먼스: "복수 지표(ROAS·CPA)…") */
  multiLabelWithTerms: boolean;
  templates: {
    opener: Record<ObservationKey | "none", string>;
    gap: Record<ObservationKey, RichText>;
    tip: Record<ObservationKey, string>;
    allMet: { gap: RichText; tip: string };
  };
};

// 숫자+단위. "원단"의 "원"처럼 지표가 아닌 글자를 피하려고 숫자와 붙은 경우만 본다.
const NUMBER = /\d/;
const PERIOD_PATTERNS = [
  /(\d+|한|두|세|네|다섯|여섯|일곱|여덟|아홉|열)\s*(주일|주|일|개월|달|분기|년)/,
  /(주간|월간|분기|매주|매일|매월|격주)/,
];

const PERF_FAMILIES = [
  ["ROAS", "로아스"],
  ["CPA"],
  ["CTR", "클릭률"],
  ["전환율", "CVR", "전환"],
  ["CPC"],
  ["매출"],
  ["광고비"],
  ["노출점유율", "SoV", "점유율"],
  ["검색량"],
  ["노출수", "노출"],
];

const BRAND_FAMILIES = [
  ["인지 지표", "인지율", "인지도", "인지", "언급량", "언급", "도달"],
  ["구매 지표", "구매의향", "구매 의향", "구매", "전환", "매출", "판매"],
];

// 두 미션이 함께 쓰는 문구
const SHARED = {
  /** 관찰 항목 4 [스크린샷] */
  measure: { met: "성공 측정 기준을 구체적으로 정의함", unmet: "성공 측정 기준이 구체적으로 정의되지 않음" },
  /** 관찰 항목 1 충족 [명세] */
  dataMet: "데이터 근거를 명시적으로 언급함",
  /** 관찰 항목 1 미충족 */
  dataUnmet: "데이터 근거가 명시적으로 언급되지 않음",
  opener: {
    data: "판단 근거에 자료의 숫자와 지표를 직접 언급한 점이 좋았습니다.",
    measure: "성공 여부를 기간과 지표로 구체적으로 정의한 점이 좋았습니다.",
    none: "선택한 이유를 직접 글로 정리해 본 것 자체가 좋은 출발입니다.",
  },
  allMet: {
    gap: [
      { text: "이번 답안에서는 관찰 항목 네 가지가 모두 보였습니다. 현직자 참고 답안과 나란히 놓고 표현과 우선순위가 어떻게 다른지 살펴보세요." },
    ],
    tip: "다음 과제에서는 다른 세부 직무 미션도 해 보면서 직무마다 판단 기준이 어떻게 달라지는지 비교해 보세요.",
  },
};

export const RUBRICS: Record<MissionId, Rubric> = {
  "performance-marketing": {
    dataTerms: PERF_FAMILIES.flat(),
    dataPatterns: [NUMBER, /%/],
    families: PERF_FAMILIES,
    minFamilies: 2,
    optionKeywords: {
      Meta: ["Meta", "메타", "페이스북", "인스타"],
      "Google 검색": ["Google", "구글", "검색"],
      "네이버 GFA": ["네이버", "GFA"],
      카카오: ["카카오"],
    },
    periodPatterns: PERIOD_PATTERNS,
    step3Metrics: [...PERF_FAMILIES.flat(), "%"],
    multiLabelWithTerms: true,
    labels: {
      data: { met: SHARED.dataMet, unmet: SHARED.dataUnmet },
      multi: {
        met: "복수 지표를 함께 고려함", // [스크린샷] 화면에서는 "복수 지표(ROAS·CPA)를 함께 고려함"처럼 감지된 지표가 들어감
        unmet: "복수 지표가 함께 언급되지 않음",
      },
      compare: {
        met: "선택하지 않은 채널과의 비교 근거를 제시함",
        unmet: "선택하지 않은 채널과의 비교 근거는 제시되지 않음", // [스크린샷]
      },
      measure: SHARED.measure,
    },
    templates: {
      opener: {
        multi: "'{quote}'라고 쓰신 부분에서 두 지표를 함께 본 점이 좋았습니다.", // [스크린샷] 인용 부분만 답안 원문
        data: SHARED.opener.data,
        compare: "선택하지 않은 채널과 비교해 근거를 든 점이 좋았습니다.",
        measure: SHARED.opener.measure,
        none: SHARED.opener.none,
      },
      gap: {
        // [스크린샷]
        compare: [
          { text: "다만 '왜 다른 채널이 아닌가'에 대한 언급이 없었습니다. 퍼포먼스 마케팅에서는 " },
          { text: "선택한 채널의 근거만큼 배제한 채널의 근거도 함께 요구되는 경우가 많습니다.", bold: true },
        ],
        measure: [
          { text: "다만 이번 답안에서는 성공 여부를 언제, 어떤 지표로 확인할지가 보이지 않았습니다. 퍼포먼스 마케팅에서는 " },
          { text: "증액 전에 확인 기간과 판단 기준 지표를 미리 정해 두는 경우가 많습니다.", bold: true },
        ],
        multi: [
          { text: "다만 이번 답안에서는 한 가지 지표만 보였습니다. 퍼포먼스 마케팅에서는 " },
          { text: "ROAS 같은 효율 지표와 CPA 같은 비용 지표를 함께 보고 판단하는 경우가 많습니다.", bold: true },
        ],
        data: [
          { text: "다만 이번 답안에서는 자료 속 숫자나 지표가 보이지 않았습니다. 실무에서는 " },
          { text: "어떤 숫자를 보고 그렇게 판단했는지를 함께 말하는 경우가 많습니다.", bold: true },
        ],
      },
      tip: {
        // [스크린샷] 문장 끝이 잘려 있어 "고민해 보세요."로 마무리 — 끝맺음 확정
        compare: "다음 과제에서는 한정된 예산 안에서 타 채널의 기회비용을 어떻게 설명할지 고민해 보세요.",
        measure: "다음 과제에서는 'N주 동안 어떤 지표가 어느 수준을 유지하면 성공'처럼 기간과 기준을 함께 적어 보세요.",
        multi: "다음 과제에서는 효율(ROAS)·비용(CPA)·규모(매출) 지표를 하나씩 골라 채널끼리 비교해 보세요.",
        data: "다음 과제에서는 표에서 판단에 쓴 숫자를 한두 개 직접 인용해 보세요.",
      },
      allMet: SHARED.allMet,
    },
  },
  "brand-marketing": {
    dataTerms: ["인지율", "언급량", "구매의향", "구매 의향", "리뷰", "별점", "평점"],
    dataPatterns: [NUMBER, /%/, /\d+\s*건/],
    families: BRAND_FAMILIES,
    minFamilies: 2,
    optionKeywords: {
      "제품 품질(원단)": ["원단", "품질"],
      "광고와 실물의 차이": ["광고", "실물", "핏"],
      "브랜드 정체성 전달 부족": ["정체성", "지향"],
      "가격 경쟁력": ["가격"],
    },
    periodPatterns: PERIOD_PATTERNS,
    step3Metrics: [...BRAND_FAMILIES.flat(), "연상", "리뷰", "평점", "별점", "NPS", "재구매", "긍정", "%"],
    multiLabelWithTerms: false,
    labels: {
      data: { met: SHARED.dataMet, unmet: SHARED.dataUnmet },
      multi: {
        met: "인지 지표와 구매 지표를 함께 고려함", // [명세]
        unmet: "인지 지표와 구매 지표가 함께 언급되지 않음",
      },
      compare: {
        met: "선택하지 않은 문제와의 비교 근거를 제시함",
        unmet: "선택하지 않은 문제와의 비교 근거는 제시되지 않음",
      },
      measure: SHARED.measure,
    },
    templates: {
      opener: {
        multi: "'{quote}'라고 쓰신 부분에서 인지 지표와 구매 지표를 함께 본 점이 좋았습니다.",
        data: SHARED.opener.data,
        compare: "선택하지 않은 문제와 비교해 우선순위를 설명한 점이 좋았습니다.",
        measure: SHARED.opener.measure,
        none: SHARED.opener.none,
      },
      gap: {
        compare: [
          { text: "다만 이번 답안에서는 다른 문제보다 이 문제를 먼저 고른 이유가 보이지 않았습니다. 브랜드 마케팅에서는 " },
          { text: "여러 문제 중 무엇을 먼저 풀고 무엇을 뒤로 미룰지 근거를 함께 설명하는 경우가 많습니다.", bold: true },
        ],
        measure: [
          { text: "다만 이번 답안에서는 캠페인 효과를 언제, 어떤 지표로 확인할지가 보이지 않았습니다. 브랜드 마케팅에서는 " },
          { text: "캠페인 전에 확인 기간과 인지·구매 지표의 목표치를 미리 정해 두는 경우가 많습니다.", bold: true },
        ],
        multi: [
          { text: "다만 이번 답안에서는 인지 지표와 구매 지표 중 한쪽만 보였습니다. 브랜드 마케팅에서는 " },
          { text: "아는 사람이 늘어난 것과 사려는 사람이 늘어난 것을 나눠서 보는 경우가 많습니다.", bold: true },
        ],
        data: [
          { text: "다만 이번 답안에서는 조사 결과의 숫자나 리뷰 내용이 보이지 않았습니다. 실무에서는 " },
          { text: "어떤 숫자와 반응을 보고 그렇게 판단했는지를 함께 말하는 경우가 많습니다.", bold: true },
        ],
      },
      tip: {
        compare: "다음 과제에서는 리뷰에 나온 다른 불만(원단·핏·가격)을 왜 우선순위에서 뒤로 두었는지도 함께 적어 보세요.",
        measure: "다음 과제에서는 '캠페인 후 N주 동안 어떤 지표가 어느 수준으로 회복되면 성공'처럼 기간과 기준을 함께 적어 보세요.",
        multi: "다음 과제에서는 인지율·언급량과 구매의향의 변화를 나란히 놓고 비교해 보세요.",
        data: "다음 과제에서는 지표 변화나 리뷰 문장을 한두 개 직접 인용해 보세요.",
      },
      allMet: SHARED.allMet,
    },
  },
};
