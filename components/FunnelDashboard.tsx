"use client";

import { useMemo, useState } from "react";
import { Database, Info, RotateCcw } from "lucide-react";
import { appendEvents, clearEvents, readEvents, useEvents, type TrackedEvent } from "@/lib/events";
import { computeFunnel, eventTarget, generateDemoEvents, isDemo, type FunnelRow } from "@/lib/funnel";
import { formatDuration } from "@/lib/timer";
import { KPI_TARGETS, SEGMENT_TARGETS, formatTarget } from "@/data/kpi";
import { MISSIONS } from "@/data/missions";

// 이벤트 퍼널 대시보드 (명세 5-5). 단일 계열 막대라 범례 없이 제목이 계열을 설명한다.
// 막대 색은 서비스 코랄(#E3704F) — 데이터 시각화 팔레트 검증 통과.

const FILTERS = [
  { id: "all", label: "전체" },
  ...Object.values(MISSIONS).map((m) => ({ id: m.id, label: m.roleName })),
];

const fmtPct = (v: number | null) => (v === null ? "–" : `${v.toFixed(1)}%`);

function fmtTime(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function StatTile({
  label,
  value,
  sub,
  target,
}: {
  label: string;
  value: string;
  sub: string;
  /** 구간 목표 (회색으로 표시) */
  target?: string;
}) {
  return (
    <div className="rounded-card border border-border bg-bg px-[22px] pt-5 pb-[18px]">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-text-muted">{label}</p>
        {target && <p className="text-[13px] text-text-muted tabular-nums">{target}</p>}
      </div>
      <p className="mt-2 text-[28px] leading-none font-bold tracking-[-0.02em] text-text">{value}</p>
      <p className="mt-2.5 text-[13px] text-text-sub">{sub}</p>
    </div>
  );
}

function FunnelBar({ row, max }: { row: FunnelRow; max: number }) {
  const width = max > 0 ? (row.sessions / max) * 100 : 0;
  const target = KPI_TARGETS[row.key];
  return (
    <li
      tabIndex={0}
      className="group relative grid grid-cols-[190px_1fr_72px_96px_96px] items-center gap-4 rounded-btn px-3 py-2 outline-none hover:bg-surface focus-visible:bg-surface"
    >
      <div>
        <p className="text-[15px] font-semibold text-text">{row.label}</p>
        <p className="text-[12px] text-text-muted">{row.eventLabel}</p>
      </div>

      <div className="relative h-5 border-l border-border">
        <div
          className="h-5 rounded-r-[4px] bg-accent"
          style={{ width: `${width}%`, minWidth: row.sessions > 0 ? 2 : 0 }}
        />
        {/* 호버·포커스 툴팁 */}
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-[calc(100%+8px)] z-10 hidden w-max rounded-btn bg-navy px-3 py-2 text-[12px] leading-[1.6] text-white group-hover:block group-focus-visible:block"
          style={{ left: `min(${width}%, calc(100% - 200px))` }}
        >
          <p className="font-bold">{row.label}</p>
          <p>
            세션 {row.sessions} · 이벤트 {row.events}건
          </p>
          <p>
            전 단계 대비 {fmtPct(row.fromPrev)} · 첫 단계 대비 {fmtPct(row.fromFirst)}
          </p>
        </div>
      </div>

      <p className="text-right text-[15px] font-bold text-text tabular-nums">{row.sessions}</p>
      <p className="text-right text-[15px] font-medium text-text-sub tabular-nums">{fmtPct(row.fromPrev)}</p>
      <p className="text-right text-[13px] text-text-muted tabular-nums">
        {row.key === "impression" ? "기준" : formatTarget(target)}
      </p>
    </li>
  );
}

function RecentEvents({ events }: { events: TrackedEvent[] }) {
  const recent = [...events].sort((a, b) => b.ts - a.ts).slice(0, 15);
  const roleName = (id?: string) =>
    id ? (Object.values(MISSIONS).find((m) => m.id === id)?.roleName ?? id) : "–";
  return (
    <section className="mt-6 rounded-card border border-border bg-bg px-[26px] pt-[26px] pb-5">
      <h2 className="text-card-title text-text">최근 이벤트</h2>
      <p className="mt-1 text-[13px] text-text-sub">가장 최근 15건 · 방금 한 체험이 여기에 바로 나타납니다</p>
      <table className="mt-4 w-full text-left text-[14px]">
        <thead>
          <tr className="border-b border-border text-[13px] text-text-muted">
            <th className="py-2.5 font-semibold">시각</th>
            <th className="py-2.5 font-semibold">이벤트</th>
            <th className="py-2.5 font-semibold">직무</th>
            <th className="py-2.5 font-semibold">세션</th>
            <th className="py-2.5 font-semibold">상세</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((e, i) => (
            <tr key={`${e.ts}-${i}`} className="border-b border-border last:border-0">
              <td className="py-2.5 text-text-sub tabular-nums">{fmtTime(e.ts)}</td>
              <td className="py-2.5 font-medium text-text">{e.name}</td>
              <td className="py-2.5 text-text-sub">{roleName(eventTarget(e))}</td>
              <td className="py-2.5 text-text-sub">
                {e.sid}
                {isDemo(e) && (
                  <span className="ml-2 rounded-tag bg-surface px-1.5 py-0.5 text-[11px] font-semibold text-text-muted">
                    데모
                  </span>
                )}
              </td>
              <td className="py-2.5 text-text-sub">
                {e.props?.step !== undefined && `Step ${e.props.step}`}
                {typeof e.props?.durationSec === "number" && `소요 ${formatDuration(e.props.durationSec)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function FunnelDashboard() {
  const { events, hydrated } = useEvents();
  const [filter, setFilter] = useState("all");
  const summary = useMemo(() => computeFunnel(events, filter), [events, filter]);
  const demoCount = events.filter(isDemo).length;
  const max = Math.max(1, ...summary.rows.map((r) => r.sessions));
  const byKey = Object.fromEntries(summary.rows.map((r) => [r.key, r]));
  const rate = (a: string, b: string) =>
    byKey[b]?.sessions ? (byKey[a].sessions / byKey[b].sessions) * 100 : null;

  const fillDemo = () => {
    const real = readEvents().filter((e) => !isDemo(e));
    clearEvents();
    appendEvents([...real, ...generateDemoEvents()]);
  };
  const reset = () => {
    if (window.confirm("이 브라우저에 쌓인 이벤트 기록을 모두 지울까요?")) clearEvents();
  };

  return (
    <main className="mx-auto w-full max-w-mission px-6 pt-12 pb-24">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[14px] font-semibold text-text-muted">포트폴리오용 대시보드</p>
          <h1 className="mt-1.5 text-job-title tracking-[-0.03em] text-text">이벤트 퍼널</h1>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={fillDemo}
            className="flex h-11 items-center gap-2 rounded-btn border border-border bg-bg px-4 text-[14px] font-bold text-text hover:bg-surface"
          >
            <Database aria-hidden size={16} strokeWidth={1.8} />
            데모 데이터 채우기
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex h-11 items-center gap-2 rounded-btn border border-border bg-bg px-4 text-[14px] font-bold text-text hover:bg-surface"
          >
            <RotateCcw aria-hidden size={16} strokeWidth={1.8} />
            데이터 초기화
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2.5 rounded-card border border-border bg-surface px-5 py-4 text-[14px] leading-[1.6] text-text-sub">
        <Info aria-hidden size={18} strokeWidth={1.8} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-bold text-text">이 페이지는 이 브라우저의 체험 기록만 보여주는 데모입니다</p>
          <p>퍼널은 브라우저 탭(세션) 단위로 셉니다. 같은 세션에서 같은 이벤트가 여러 번 기록돼도 한 번으로 셉니다.</p>
          {demoCount > 0 && (
            <p className="mt-1.5 font-semibold text-text">
              지금 데모 데이터(가짜 데이터) {demoCount}건이 함께 표시되고 있습니다. 실제 체험 기록이 아닙니다.
            </p>
          )}
        </div>
      </div>

      <div role="tablist" aria-label="직무 필터" className="mt-8 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`h-[36px] rounded-full px-4 text-[14px] font-bold ${
              filter === f.id ? "bg-navy text-white" : "border border-border bg-bg text-text-sub hover:bg-surface"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {hydrated && (
        <>
          <div className="mt-5 grid grid-cols-4 gap-4">
            <StatTile label="CTA 노출 세션" value={String(byKey.impression.sessions)} sub="공고에서 미션 카드를 본 세션" />
            <StatTile label="체험 시작률" value={fmtPct(rate("start", "impression"))} sub="CTA 노출 → 미션 시작" />
            <StatTile
              label="완주율"
              value={fmtPct(rate("feedback", "start"))}
              sub="미션 시작 → 피드백 확인"
              target={formatTarget(SEGMENT_TARGETS.completion)}
            />
            <StatTile
              label="평균 소요시간"
              value={summary.avgDurationSec === null ? "–" : formatDuration(summary.avgDurationSec)}
              sub={`Step 1 진입 → 제출 · 제출 ${summary.submitCount}건 기준`}
            />
          </div>

          <section className="mt-6 rounded-card border border-border bg-bg px-[14px] pt-[26px] pb-4">
            <div className="flex items-baseline justify-between px-3">
              <h2 className="text-card-title text-text">단계별 도달 세션</h2>
              <p className="text-[13px] text-text-sub">
                다른 세부 직무 미션 클릭: <strong className="font-bold text-text">{summary.nextMissionSessions}</strong> 세션
              </p>
            </div>
            <div className="mt-4 grid grid-cols-[190px_1fr_72px_96px_96px] gap-4 border-b border-border px-3 pb-2.5 text-[12px] font-semibold text-text-muted">
              <span>단계</span>
              <span>도달 세션</span>
              <span className="text-right">세션</span>
              <span className="text-right">전 단계 대비</span>
              <span className="text-right">목표 (가설)</span>
            </div>
            {byKey.impression.sessions === 0 && summary.rows.every((r) => r.sessions === 0) ? (
              <p className="px-3 py-12 text-center text-[15px] text-text-sub">
                아직 기록된 체험이 없습니다. 공고 화면에서 10분 체험을 해 보거나 데모 데이터를 채워 보세요.
              </p>
            ) : (
              <ol className="mt-2 space-y-0.5">
                {summary.rows.map((row) => (
                  <FunnelBar key={row.key} row={row} max={max} />
                ))}
              </ol>
            )}
          </section>

          {events.length > 0 && <RecentEvents events={events} />}
        </>
      )}
    </main>
  );
}
