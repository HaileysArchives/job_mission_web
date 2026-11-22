"use client";

// localStorage 이벤트 로깅. /admin/funnel에서 읽어 퍼널로 보여준다.
import { useMemo, useSyncExternalStore } from "react";

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
  /** 세션 id: 브라우저 탭 단위(sessionStorage). 퍼널은 세션 기준으로 센다. */
  sid: string;
  props?: Record<string, string | number | boolean>;
};

const KEY = "jm_events";
const SID_KEY = "jm_sid";
const CHANGE_EVENT = "jm-events-change";

function sessionId(): string {
  try {
    let sid = window.sessionStorage.getItem(SID_KEY);
    if (!sid) {
      sid = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      window.sessionStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return "s-unknown";
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): TrackedEvent[] {
  if (!raw) return [];
  try {
    // 세션 id가 없던 초기 기록은 하나의 세션으로 본다.
    return (JSON.parse(raw) as TrackedEvent[]).map((e) => ({ ...e, sid: e.sid ?? "s-legacy" }));
  } catch {
    return [];
  }
}

function save(events: TrackedEvent[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(events));
  } catch {
    // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 기록을 건너뛴다.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function readEvents(): TrackedEvent[] {
  return parse(readRaw());
}

export function logEvent(name: EventName, props?: TrackedEvent["props"]) {
  const events = readEvents();
  events.push({ name, ts: Date.now(), sid: sessionId(), ...(props ? { props } : {}) });
  save(events);
}

export function appendEvents(extra: TrackedEvent[]) {
  save([...readEvents(), ...extra]);
}

export function clearEvents() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** 이벤트 목록 구독. 다른 탭에서 체험해도 바로 반영된다. */
export function useEvents() {
  const raw = useSyncExternalStore(subscribe, () => readRaw() ?? "", () => null);
  const events = useMemo(() => parse(raw), [raw]);
  return { events, hydrated: raw !== null };
}
