"use client";

import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { MARKETING_ROLES, MISSIONS, type Mission } from "@/data/missions";
import { JOBS, type JobId } from "@/data/jobs";
import { THEMES } from "@/lib/theme";
import { logEvent } from "@/lib/events";

// 결과 아래 다음 행동 영역 (명세 5-3). 레퍼런스가 없어 디자인 시스템을 따른다.
// [명세] "다른 세부 직무도 해볼래요?", "이 직무 공고 보기", "이 결과는 직무 적합성을 단정하지 않습니다"

export default function NextActions({ mission }: { mission: Mission }) {
  const other = Object.values(MISSIONS).find((m) => m.id !== mission.id)!;
  const otherTheme = THEMES[other.theme];
  const otherSummary = MARKETING_ROLES.find((r) => r.missionId === other.id)?.summary;
  const job = JOBS[mission.jobId as JobId];

  return (
    <section className="mt-12 border-t border-border pt-10">
      <div className="grid grid-cols-2 gap-6">
        {/* 다른 세부 직무 미션 */}
        <div className="flex flex-col rounded-card border border-border bg-bg px-[26px] pt-[28px] pb-[26px]">
          <h2 className="text-[18px] font-bold text-text">다른 세부 직무도 해볼래요?</h2>
          <div className="mt-4 flex items-center gap-2.5">
            <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${otherTheme.bg}`} />
            <p className="text-[16px] font-bold text-text">{other.roleName}</p>
          </div>
          <p className="mt-1.5 text-[15px] leading-[1.6] text-text-sub">{otherSummary}</p>
          <Link
            href={`/missions/${other.id}/brief`}
            onClick={() => logEvent("next_mission_click", { from: mission.id, to: other.id })}
            className={`mt-6 flex h-[50px] items-center justify-center gap-1.5 rounded-btn text-[16px] font-bold text-white transition-colors ${otherTheme.bg} ${otherTheme.bgHover}`}
          >
            {other.roleName} 미션 해보기
            <ArrowRight aria-hidden size={17} strokeWidth={2.2} />
          </Link>
        </div>

        {/* 이 직무 공고 */}
        <div className="flex flex-col rounded-card border border-border bg-surface px-[26px] pt-[28px] pb-[26px]">
          <p className="text-[14px] font-medium text-text-sub">{job.company}</p>
          <h2 className="mt-1 text-[18px] font-bold text-text">{job.title}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="flex h-[28px] items-center rounded-tag border border-border bg-bg px-2.5 text-[13px] font-medium text-text-sub"
              >
                {tag}
              </span>
            ))}
            <span className="flex h-[28px] items-center rounded-tag bg-navy px-2.5 text-[13px] font-bold text-white">
              {job.dday}
            </span>
          </div>
          <Link
            href={`/jobs/${job.id}`}
            onClick={() => logEvent("recommendation_click", { missionId: mission.id, jobId: job.id })}
            className="mt-auto flex h-[50px] items-center justify-center rounded-btn bg-navy text-[16px] font-bold text-white hover:bg-[#2A2E40]"
          >
            이 직무 공고 보기
          </Link>
        </div>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-[13px] font-medium text-text-muted">
        <Info aria-hidden size={14} strokeWidth={1.8} />
        이 결과는 직무 적합성을 단정하지 않습니다
      </p>
    </section>
  );
}
