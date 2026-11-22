// 소요시간 계산·표시

export function elapsedSeconds(startedAt: number, endedAt: number = Date.now()) {
  return Math.max(0, Math.round((endedAt - startedAt) / 1000));
}

/** 582 → "9분 42초" */
export function formatDuration(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}초`;
  return `${m}분 ${s}초`;
}
