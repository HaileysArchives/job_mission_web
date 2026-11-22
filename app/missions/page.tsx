import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import Header from "@/components/Header";
import { MARKETING_ROLES, MISSIONS, type MarketingRole } from "@/data/missions";
import { THEMES } from "@/lib/theme";

// 직군 탐색 → 세부 직무 선택. 레퍼런스가 없어 3장 디자인 시스템을 따른다.

function RoleCard({ role }: { role: MarketingRole }) {
  if (!role.missionId) {
    return (
      <div className="flex h-full flex-col rounded-card border border-border bg-surface px-7 pt-7 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-text-muted">{role.name}</h2>
          <span className="flex h-[26px] items-center rounded-tag border border-border bg-bg px-2.5 text-[13px] font-semibold text-text-muted">
            준비 중
          </span>
        </div>
        <p className="mt-3 text-[15px] leading-[1.6] text-text-muted">{role.summary}</p>
      </div>
    );
  }

  const mission = MISSIONS[role.missionId];
  const theme = THEMES[mission.theme];
  return (
    <Link
      href={`/missions/${mission.id}/brief`}
      className={`group flex h-full flex-col rounded-card border border-border bg-bg px-7 pt-7 pb-6 transition-colors ${theme.hoverBorder}`}
    >
      <div className="flex items-center gap-2.5">
        <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${theme.bg}`} />
        <h2 className="text-[20px] font-bold text-text">{role.name}</h2>
      </div>
      <p className="mt-3 text-[15px] leading-[1.6] text-text-sub">{role.summary}</p>
      <div className="mt-auto flex items-center justify-between pt-7">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted">
          <Clock aria-hidden size={14} strokeWidth={1.8} />
          {mission.estimatedTime.replace("소요시간 ", "")} · 3단계
        </span>
        <span className={`flex items-center gap-1 text-[15px] font-bold ${theme.text}`}>
          미션 보기
          <ArrowRight aria-hidden size={16} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default function MissionsPage() {
  return (
    <>
      <Header variant="mission" />
      <main className="mx-auto w-full max-w-mission px-6 pt-14 pb-24">
        <p className="text-[14px] font-semibold text-text-muted">직무 미션</p>
        <h1 className="mt-2 text-job-title tracking-[-0.03em] text-text">
          마케팅, 어떤 일을 하는지 직접 해보세요
        </h1>
        <p className="mt-3 text-[16px] text-text-sub">
          세부 직무를 골라 실제 과제를 짧게 수행하고 현직자 기준 피드백을 받아보세요.
        </p>

        <div className="mt-9 flex items-center gap-3">
          <span className="text-[14px] font-medium text-text-muted">직군</span>
          <span className="flex h-[34px] items-center rounded-full bg-navy px-4 text-[14px] font-bold text-white">
            마케팅
          </span>
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-5">
          {MARKETING_ROLES.map((role) => (
            <li key={role.name}>
              <RoleCard role={role} />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
