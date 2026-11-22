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

// ── 데모 데이터 (가짜). 같은 결과가 나오도록 고정 시드 난수를 쓴다. ──

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEMO_SESSIONS = 240;

export function generateDemoEvents(now: number = Date.now()): TrackedEvent[] {
  const rand = mulberry32(20261122);
  const out: TrackedEvent[] = [];
  for (let i = 0; i < DEMO_SESSIONS; i++) {
    const sid = `demo-${String(i).padStart(3, "0")}`;
    const id = rand() < 0.6 ? "performance-marketing" : "brand-marketing";
    let ts = now - Math.floor(rand() * 14 * 86_400_000);
    const push = (name: EventName, props: TrackedEvent["props"] = {}) => {
      ts += Math.floor(5_000 + rand() * 60_000);
      out.push({ name, ts, sid, props: { ...props, demo: true } });
    };

    push("mission_impression", { jobId: id });
    const goNext = (p: number) => rand() < p;
    if (goNext(0.3)) {
      push("mission_cta_click", { jobId: id });
      if (goNext(0.85)) {
        push("mission_start", { missionId: id });
        let reached = 0;
        for (const [step, p] of [[1, 0.92], [2, 0.78], [3, 0.9]] as const) {
          if (!goNext(p)) break;
          push("step_complete", { missionId: id, step });
          reached = step;
        }
        if (reached === 3 && goNext(0.95)) {
          push("mission_submit", { missionId: id, durationSec: Math.floor(240 + rand() * 540) });
          push("feedback_view", { missionId: id });
          if (goNext(0.2)) push("next_mission_click", { from: id, to: id === "performance-marketing" ? "brand-marketing" : "performance-marketing" });
          if (goNext(0.4)) {
            push("recommendation_click", { missionId: id, jobId: id });
            if (goNext(0.45)) push(rand() < 0.65 ? "scrap_click" : "apply_click", { jobId: id });
          }
        }
      }
    }
  }
  return out.sort((a, b) => a.ts - b.ts);
}

export const isDemo = (e: TrackedEvent) => e.props?.demo === true;
