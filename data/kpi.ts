// 퍼널 목표 가설치 (명세 5-5). 값은 기획자가 확정해서 채운다.
// null이면 대시보드에 "목표 미정"으로 표시된다.

import type { FunnelStageKey } from "@/lib/funnel";

/** 목표 범위 (%) */
export type TargetRange = { min: number; max: number };

/** 단계별 목표: "전 단계 대비 전환율(%)". 첫 단계(CTA 노출)는 기준이라 목표가 없다. */
export const KPI_TARGETS: Record<FunnelStageKey, TargetRange | null> = {
  impression: null, // 기준 단계
  cta: { min: 2, max: 4 }, // CTA 노출 → CTA 클릭
  start: null, // CTA 클릭 → 미션 시작
  step1: null, // 미션 시작 → Step 1 완료
  step2: null, // Step 1 → Step 2 완료
  step3: null, // Step 2 → Step 3 완료
  submit: null, // Step 3 → 제출
  feedback: null, // 제출 → 피드백 확인
  recommendation: null, // 피드백 확인 → 공고 다시 보기
  action: null, // 공고 다시 보기 → 스크랩·지원 클릭
};

/** 구간 목표: 여러 단계를 건너뛴 전체 비율. 요약 숫자 영역에 표시한다. */
export const SEGMENT_TARGETS = {
  /** 완주율: 미션 시작 → 피드백 확인 */
  completion: { min: 25, max: 35 } as TargetRange | null,
};

export const formatTarget = (t: TargetRange | null) =>
  t === null ? "목표 미정" : `목표 ${t.min}~${t.max}%`;
