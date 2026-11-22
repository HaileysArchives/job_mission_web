// 이벤트 → 퍼널 집계. 세션(브라우저 탭) 단위로 "그 단계에 도달했는지"를 센다.
// 같은 세션에서 같은 이벤트가 여러 번 기록돼도(새로고침, 이전/다음 왕복) 한 번으로 센다.

import type { EventName, TrackedEvent } from "@/lib/events";

export type FunnelStageKey =
  | "impression"
  | "cta"
  | "start"
  | "step1"
  | "step2"
  | "step3"
  | "submit"
  | "feedback"
  | "recommendation"
  | "action";

type StageDef = {
  key: FunnelStageKey;
  label: string;
  /** 화면에 함께 보여줄 이벤트 이름 */
  eventLabel: string;
  match: (e: TrackedEvent) => boolean;
};

const is = (name: EventName) => (e: TrackedEvent) => e.name === name;
const isStep = (step: number) => (e: TrackedEvent) =>
  e.name === "step_complete" && Number(e.props?.step) === step;

export const STAGES: StageDef[] = [
  { key: "impression", label: "CTA 노출", eventLabel: "mission_impression", match: is("mission_impression") },
  { key: "cta", label: "CTA 클릭", eventLabel: "mission_cta_click", match: is("mission_cta_click") },
  { key: "start", label: "미션 시작", eventLabel: "mission_start", match: is("mission_start") },
  { key: "step1", label: "Step 1 완료", eventLabel: "step_complete · 1", match: isStep(1) },
  { key: "step2", label: "Step 2 완료", eventLabel: "step_complete · 2", match: isStep(2) },
  { key: "step3", label: "Step 3 완료", eventLabel: "step_complete · 3", match: isStep(3) },
  { key: "submit", label: "제출", eventLabel: "mission_submit", match: is("mission_submit") },
  { key: "feedback", label: "피드백 확인", eventLabel: "feedback_view", match: is("feedback_view") },
  { key: "recommendation", label: "공고 다시 보기", eventLabel: "recommendation_click", match: is("recommendation_click") },
  {
    key: "action",
    label: "스크랩 · 지원 클릭",
    eventLabel: "scrap_click / apply_click",
    match: (e) => e.name === "scrap_click" || e.name === "apply_click",
  },
];

/** 이벤트가 어느 미션/공고에 속하는지 (공고 id와 미션 id는 같은 문자열을 쓴다) */
export function eventTarget(e: TrackedEvent): string | undefined {
  const p = e.props ?? {};
  return (p.missionId ?? p.jobId ?? p.from) as string | undefined;
}

export type FunnelRow = {
  key: FunnelStageKey;
  label: string;
  eventLabel: string;
  sessions: number;
  events: number;
  /** 전 단계 대비 전환율 (%) — 첫 단계는 null */
  fromPrev: number | null;
  /** 첫 단계 대비 (%) */
  fromFirst: number | null;
};

export type FunnelSummary = {
  rows: FunnelRow[];
  avgDurationSec: number | null;
  submitCount: number;
  nextMissionSessions: number;
};

const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : null);

export function computeFunnel(all: TrackedEvent[], filter: string): FunnelSummary {
  const events = filter === "all" ? all : all.filter((e) => eventTarget(e) === filter);

  const counts = STAGES.map((stage) => {
    const hits = events.filter(stage.match);
    return { stage, events: hits.length, sessions: new Set(hits.map((e) => e.sid)).size };
  });

  const first = counts[0]?.sessions ?? 0;
  const rows: FunnelRow[] = counts.map((c, i) => ({
    key: c.stage.key,
    label: c.stage.label,
    eventLabel: c.stage.eventLabel,
    sessions: c.sessions,
    events: c.events,
    fromPrev: i === 0 ? null : pct(c.sessions, counts[i - 1].sessions),
    fromFirst: i === 0 ? null : pct(c.sessions, first),
  }));

  const durations = events
    .filter((e) => e.name === "mission_submit" && typeof e.props?.durationSec === "number")
    .map((e) => e.props!.durationSec as number);
  const avgDurationSec = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : null;

  const nextMissionSessions = new Set(
    events.filter((e) => e.name === "next_mission_click").map((e) => e.sid),
  ).size;

  return { rows, avgDurationSec, submitCount: durations.length, nextMissionSessions };
}

// ── 데모 데이터 (가짜). 고정 시드와 단계별 고정 세션 수로 항상 같은 결과가 나온다. ──
// 전체: CTA 클릭률 약 3%, 완주율 약 30% (목표 범위 안)
// 브랜드: CTA 클릭률 1.9%, 완주율 24.2% (목표 2~4%, 25~35%에 조금 못 미치게)

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DEMO_PLAN = {
  "performance-marketing": {
    impression: 3000, cta: 108, start: 90, step1: 78, step2: 58, step3: 45,
    submit: 31, feedback: 29, next: 5, recommendation: 12, action: 5,
  },
  "brand-marketing": {
    impression: 2000, cta: 38, start: 33, step1: 27, step2: 18, step3: 13,
    submit: 9, feedback: 8, next: 2, recommendation: 3, action: 1,
  },
} as const;

export const DEMO_SESSIONS = Object.values(DEMO_PLAN).reduce((sum, p) => sum + p.impression, 0);

export function generateDemoEvents(now: number = Date.now()): TrackedEvent[] {
  const rand = mulberry32(20261122);
  const out: TrackedEvent[] = [];
  let index = 0;

  for (const [id, plan] of Object.entries(DEMO_PLAN)) {
    const other = id === "performance-marketing" ? "brand-marketing" : "performance-marketing";
    for (let i = 0; i < plan.impression; i++) {
      const sid = `demo-${String(index++).padStart(4, "0")}`;
      // 마지막 이벤트가 미래 시각이 되지 않도록 1시간 이전부터 시작한다
      let ts = now - 3_600_000 - Math.floor(rand() * 14 * 86_400_000);
      const push = (name: EventName, props: NonNullable<TrackedEvent["props"]>) => {
        ts += Math.floor(5_000 + rand() * 60_000);
        out.push({ name, ts, sid, props: { ...props, demo: true } });
      };

      push("mission_impression", { jobId: id });
      if (i < plan.cta) push("mission_cta_click", { jobId: id });
      if (i < plan.start) push("mission_start", { missionId: id });
      if (i < plan.step1) push("step_complete", { missionId: id, step: 1 });
      if (i < plan.step2) push("step_complete", { missionId: id, step: 2 });
      if (i < plan.step3) push("step_complete", { missionId: id, step: 3 });
      if (i < plan.submit) {
        push("mission_submit", { missionId: id, durationSec: Math.floor(240 + rand() * 540) });
      }
      if (i < plan.feedback) push("feedback_view", { missionId: id });
      if (i < plan.next) push("next_mission_click", { from: id, to: other });
      if (i < plan.recommendation) push("recommendation_click", { missionId: id, jobId: id });
      if (i < plan.action) push(rand() < 0.65 ? "scrap_click" : "apply_click", { jobId: id });
    }
  }
  return out.sort((a, b) => a.ts - b.ts);
}

export const isDemo = (e: TrackedEvent) => e.props?.demo === true;
