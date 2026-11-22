// 미션 콘텐츠. 문구는 reference 02·03 스크린샷과 job_mission.md 6장을 따른다.

export type MissionId = "performance-marketing" | "brand-marketing";
export type ThemeKey = "coral" | "green";

export type Brief = {
  sender: string;
  subject: string;
  /** 문단 단위. 첫 문단은 여는 따옴표, 마지막 문단은 닫는 따옴표로 감싼다. */
  paragraphs: string[];
};

export type ChannelRow = {
  channel: string;
  spend: string;
  revenue: string;
  roas: string;
  cpa: string;
  highlight?: boolean;
};

export type Review = { stars: number; text: string };
export type Metric = {
  label: string;
  before: string;
  after: string;
  trend: "up" | "down";
};

export type MissionData =
  | {
      kind: "table";
      title: string;
      chip: string;
      rows: ChannelRow[];
      footnote: { avg: string; target: string };
    }
  | {
      kind: "brand";
      reviews: { title: string; caption: string; items: Review[] };
      survey: { title: string; metrics: Metric[] };
    };

export type Mission = {
  id: MissionId;
  jobId: string;
  roleName: string;
  theme: ThemeKey;
  stepLabels: [string, string, string];
  estimatedTime: string;
  brief: Brief;
  data: MissionData;
  questions: {
    step1: string;
    options: string[];
    step2: string;
    step3: string;
  };
  minLength: { step2: number; step3: number };
  reference: {
    step1: string;
    step2: string;
    step3: string;
  };
};

export const MISSIONS: Record<MissionId, Mission> = {
  "performance-marketing": {
    id: "performance-marketing",
    jobId: "performance-marketing",
    roleName: "퍼포먼스 마케터",
    theme: "coral",
    stepLabels: ["데이터 해석", "판단 근거", "KPI 정의"],
    estimatedTime: "소요시간 약 3분",
    brief: {
      sender: "마케팅팀 이지현 팀장",
      subject: "다음 달 예산 배분 검토 부탁드려요",
      paragraphs: [
        "무브먼트(MOVEMENT) 론칭 8개월차입니다.",
        "Q3에 광고비를 30% 늘렸는데 매출 성장은 오히려 둔화됐어요.",
        "채널별 성과 정리해뒀으니 보시고, 다음 달 예산을 어디에 더 쓸지 의견 주세요.",
      ],
    },
    data: {
      kind: "table",
      title: "8월 채널별 광고 성과",
      chip: "내부 대외비 문서",
      rows: [
        { channel: "Meta", spend: "4,200만원", revenue: "1억 2,600만원", roas: "300%", cpa: "28,000원" },
        { channel: "Google 검색", spend: "1,800만원", revenue: "9,900만원", roas: "550%", cpa: "15,000원", highlight: true },
        { channel: "네이버 GFA", spend: "2,600만원", revenue: "6,240만원", roas: "240%", cpa: "34,000원" },
        { channel: "카카오", spend: "1,400만원", revenue: "3,080만원", roas: "220%", cpa: "38,000원" },
      ],
      // 표 합계 기준 318% (명세 6-1)
      footnote: { avg: "전체 평균 ROAS 318%", target: "목표 ROAS 350%" },
    },
    questions: {
      step1: "다음 달 광고 예산을 추가 배분한다면 어느 채널을 선택하시겠습니까?",
      options: ["Meta", "Google 검색", "네이버 GFA", "카카오"],
      step2: "왜 그 선택을 했나요? 판단 근거를 적어주세요.",
      step3: "이 결정이 성공했는지 무엇으로 확인하시겠어요? KPI와 확인 방법을 적어주세요.",
    },
    // Step 3은 일부러 5자로 낮게 둔다. 짧은 답도 제출되게 하고, 부족한 점은 결과 화면의 관찰 항목(보완점)에서 드러나게 하려는 의도.
    minLength: { step2: 20, step3: 5 },
    reference: {
      step1: "Google 검색 (+ 상단 채널 병행)",
      step2:
        "Google 검색의 효율이 가장 높지만, 검색 광고는 기존 수요를 회수하는 채널이라 증액해도 볼륨 확장에 한계가 있습니다. 실무에서는 검색을 증액하되 동시에 검색량 자체를 늘릴 상단 채널을 함께 봅니다.",
      step3: "증액 후 2주간 CPA 유지 여부와, 검색 노출점유율(SoV) 변화를 함께 봅니다.",
    },
  },
  "brand-marketing": {
    id: "brand-marketing",
    jobId: "brand-marketing",
    roleName: "브랜드 마케터",
    theme: "green",
    stepLabels: ["자료 해석", "판단 근거", "KPI 정의"],
    estimatedTime: "소요시간 약 3분",
    brief: {
      sender: "브랜드팀 이지현 팀장",
      subject: "다음 분기 브랜드 캠페인 방향 검토",
      paragraphs: [
        "무브먼트 론칭 8개월차입니다.",
        "소셜 언급량은 늘었는데 구매의향은 오히려 떨어졌어요.",
        "리뷰랑 조사 결과 보시고, 지금 가장 시급한 문제가 뭐라고 보시는지 의견 주세요.",
      ],
    },
    data: {
      kind: "brand",
      reviews: {
        title: "고객 리뷰 발췌",
        caption: "최근 1개월 기준 주요 피드백",
        items: [
          { stars: 3, text: "디자인은 예쁜데 생각보다 원단이 얇아요" },
          { stars: 2, text: "광고에서 본 핏이랑 실물이 좀 달라요" },
          { stars: 4, text: "가격 대비 괜찮아요. 근데 이 브랜드가 뭘 지향하는지는 잘 모르겠어요" },
          { stars: 4, text: "친구가 어디 거냐고 물어봤는데 설명하기가 애매했어요" },
        ],
      },
      survey: {
        title: "브랜드 인지 조사",
        metrics: [
          { label: "브랜드 인지율", before: "12%", after: "18%", trend: "up" },
          { label: "소셜 언급량 (월)", before: "340건", after: "890건", trend: "up" },
          { label: "구매 의향", before: "8%", after: "7%", trend: "down" },
        ],
      },
    },
    questions: {
      step1: "지금 이 브랜드에서 가장 시급한 문제는 무엇이라고 보십니까?",
      options: ["제품 품질(원단)", "광고와 실물의 차이", "브랜드 정체성 전달 부족", "가격 경쟁력"],
      step2: "왜 그 문제가 가장 시급하다고 보셨나요? 판단 근거를 적어주세요.",
      step3: "다음 분기 캠페인이 이 문제를 해결했는지 무엇으로 확인하시겠어요? KPI와 확인 방법을 적어주세요.",
    },
    // Step 3은 일부러 5자로 낮게 둔다. 짧은 답도 제출되게 하고, 부족한 점은 결과 화면의 관찰 항목(보완점)에서 드러나게 하려는 의도.
    minLength: { step2: 20, step3: 5 },
    reference: {
      step1: "브랜드 정체성 전달 부족 (+ 광고-실물 차이 별도 점검)",
      step2:
        "인지율(12→18%)과 언급량(340→890건)은 늘었는데 구매의향은 8→7%로 떨어졌습니다. 브랜드를 아는 사람은 늘었지만 살 이유는 전달되지 않았다는 뜻입니다. 리뷰에서도 '무엇을 지향하는지 모르겠다', '설명하기 애매하다'는 반응이 나와, 노출을 더 늘리기보다 브랜드가 무엇인지 한 문장으로 정의하고 전달하는 게 먼저라고 봤습니다. 원단·핏 불만은 제품팀과 광고 소재 담당에 따로 공유합니다.",
      step3:
        "캠페인 후 4주간 구매의향이 8% 이상으로 회복되는지와, 브랜드 연상 조사에서 핵심 메시지를 떠올리는 응답 비율을 함께 봅니다. 언급량은 총량보다 브랜드 메시지와 관련된 긍정 언급의 비중을 봅니다.",
    },
  },
};

export const MISSION_IDS = Object.keys(MISSIONS) as MissionId[];

export function getMission(id: string): Mission | undefined {
  return MISSIONS[id as MissionId];
}

// ── 직군 탐색(/missions)과 브리프 화면용 안내 문구 ──
// 레퍼런스가 없는 화면의 문구 (6단계에서 확정)

export type MarketingRole = {
  name: string;
  /** 활성 미션이면 id, 준비 중이면 없음 */
  missionId?: MissionId;
  summary: string;
};

export const MARKETING_ROLES: MarketingRole[] = [
  {
    name: "퍼포먼스 마케터",
    missionId: "performance-marketing",
    summary: "채널별 광고 성과를 보고 다음 달 예산을 어디에 더 쓸지 제안해요.",
  },
  {
    name: "브랜드 마케터",
    missionId: "brand-marketing",
    summary: "고객 리뷰와 인지 조사를 보고 지금 가장 시급한 브랜드 문제를 짚어요.",
  },
  {
    name: "콘텐츠 마케터",
    summary: "콘텐츠 기획·성과 분석 과제를 준비하고 있어요.",
  },
  {
    name: "CRM 마케터",
    summary: "고객 데이터 기반 리텐션 과제를 준비하고 있어요.",
  },
];

/** 브리프 화면의 과제 안내 (Step별 한 줄) */
export const BRIEF_GUIDE: Record<MissionId, [string, string, string]> = {
  "performance-marketing": [
    "채널별 성과표를 보고 예산을 더 쓸 채널 하나를 고릅니다.",
    "그렇게 고른 이유를 자료 속 근거와 함께 적습니다.",
    "이 결정이 성공했는지 확인할 KPI와 방법을 적습니다.",
  ],
  "brand-marketing": [
    "고객 리뷰와 인지 조사를 보고 가장 시급한 문제 하나를 고릅니다.",
    "그렇게 본 이유를 자료 속 근거와 함께 적습니다.",
    "캠페인이 문제를 해결했는지 확인할 KPI와 방법을 적습니다.",
  ],
};
