// 공고 상세 데이터. 문구는 reference/01_job_detail.png와 job_mission.md 5-1을 따른다.

export type JobId = "performance-marketing" | "brand-marketing";

export type Job = {
  id: JobId;
  /** 연결된 미션 id (/missions/[jobId]) */
  missionId: JobId;
  roleName: string; // CTA 설명의 "퍼포먼스 마케터"
  company: string;
  title: string;
  tags: string[];
  dday: string;
  summary: { label: string; value: string }[];
  duties: string[];
  companyInfo: { label: string; value: string }[];
  scrapCount: number;
  links: { label: string; count: string }[];
};

const COMMON = {
  company: "(주)에코브릿지",
  tags: ["신입", "정규직", "서울 송파구"],
  dday: "D-12",
  summary: [
    { label: "경력", value: "신입" },
    { label: "학력", value: "대졸 이상" },
    { label: "근무형태", value: "정규직" },
    { label: "마감일", value: "09.15 (금)" },
  ],
  companyInfo: [
    { label: "업종", value: "광고대행·마케팅" },
    { label: "사원수", value: "120명" },
    { label: "설립일", value: "2015년 (업력 11년)" },
  ],
  scrapCount: 42,
  links: [
    { label: "합격 자소서 보기", count: "12건" },
    { label: "면접 후기 보기", count: "8건" },
  ],
};

export const JOBS: Record<JobId, Job> = {
  "performance-marketing": {
    ...COMMON,
    id: "performance-marketing",
    missionId: "performance-marketing",
    roleName: "퍼포먼스 마케터",
    title: "퍼포먼스 마케팅 신입사원",
    duties: [
      "데이터 기반 디지털 마케팅 액션",
      "고객사 매출 증대를 위한 퍼포먼스 운영",
    ],
  },
  "brand-marketing": {
    ...COMMON,
    id: "brand-marketing",
    missionId: "brand-marketing",
    roleName: "브랜드 마케터",
    title: "브랜드 마케팅 신입사원",
    duties: [
      "브랜드 메시지·포지셔닝 기반 캠페인 기획",
      "고객 리뷰·브랜드 인지 조사 분석 및 지표 관리",
    ],
  },
};

export const JOB_IDS = Object.keys(JOBS) as JobId[];

export function getJob(id: string): Job | undefined {
  return JOBS[id as JobId];
}
