// localStorage 이벤트 로깅. 퍼널 대시보드(/admin/funnel)는 7단계에서 만든다.

export type EventName =
  | "mission_impression"
  | "mission_cta_click"
  | "mission_start"
  | "step_complete"
  | "mission_submit"
  | "feedback_view"
  | "next_mission_click"
  | "recommendation_click"
  | "scrap_click"
  | "apply_click";

export type TrackedEvent = {
  name: EventName;
  ts: number;
  props?: Record<string, string | number | boolean>;
};

const KEY = "jm_events";

export function readEvents(): TrackedEvent[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TrackedEvent[]) : [];
  } catch {
    return [];
  }
}

export function logEvent(name: EventName, props?: TrackedEvent["props"]) {
  try {
    const events = readEvents();
    events.push({ name, ts: Date.now(), ...(props ? { props } : {}) });
    window.localStorage.setItem(KEY, JSON.stringify(events));
  } catch {
    // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 기록을 건너뛴다.
  }
}
