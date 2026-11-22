"use client";

// 미션 진행 상태(답안·시간)를 localStorage에 저장한다. 새로고침해도 이어서 할 수 있다.
import { useMemo, useSyncExternalStore } from "react";

export type MissionProgress = {
  choice?: string;
  step2?: string;
  step3?: string;
  /** Step 1 최초 진입 시각 (ms) */
  startedAt?: number;
  submittedAt?: number;
  /** 제출까지 실제 경과 시간 (초) */
  durationSec?: number;
};

const key = (missionId: string) => `jm_progress_${missionId}`;
const CHANGE_EVENT = "jm-progress-change";

function readRaw(missionId: string): string | null {
  try {
    return window.localStorage.getItem(key(missionId));
  } catch {
    return null;
  }
}

function parse(raw: string | null): MissionProgress {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as MissionProgress;
  } catch {
    return {};
  }
}

export function readProgress(missionId: string): MissionProgress {
  return parse(readRaw(missionId));
}

export function writeProgress(missionId: string, patch: Partial<MissionProgress>): MissionProgress {
  const next = { ...readProgress(missionId), ...patch };
  try {
    window.localStorage.setItem(key(missionId), JSON.stringify(next));
  } catch {
    // 저장할 수 없는 환경에서는 기록되지 않는다.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return next;
}

export function clearProgress(missionId: string) {
  try {
    window.localStorage.removeItem(key(missionId));
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

/** 진행 상태 구독. hydrated=false인 동안(서버 렌더·첫 렌더)은 빈 상태다. */
export function useProgress(missionId: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(missionId) ?? "",
    () => null,
  );
  const progress = useMemo(() => parse(raw), [raw]);
  return { progress, hydrated: raw !== null };
}
