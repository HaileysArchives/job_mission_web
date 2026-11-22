"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheck, Clock } from "lucide-react";
import { BRIEF_GUIDE, type Mission } from "@/data/missions";
import { THEMES } from "@/lib/theme";
import { clearProgress, readProgress } from "@/lib/progress";
import BriefPanel from "@/components/BriefPanel";

// 미션 브리프: 팀장 메시지 + 과제 안내 + "미션 시작"

export default function MissionBrief({ mission }: { mission: Mission }) {
  const router = useRouter();
  const theme = THEMES[mission.theme];
  const guide = BRIEF_GUIDE[mission.id];

  const start = () => {
    // 이미 제출한 미션을 다시 시작하면 새 시도로 본다. 진행 중이면 이어서 한다.
    if (readProgress(mission.id).submittedAt) clearProgress(mission.id);
    router.push(`/missions/${mission.id}/play?step=1`);
  };

  return (
    <>
      <div className="w-full border-b border-border bg-bg">
        <div className="mx-auto flex h-[72px] max-w-mission items-center justify-between px-6">
          <h1 className="flex items-center gap-2.5 text-[20px] font-bold text-text">
            <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${theme.bg}`} />
            {mission.roleName} 직무 미션
          </h1>
          <span className="flex h-[38px] items-center gap-2 rounded-full border border-border bg-surface px-4 text-[15px] font-medium text-text-sub">
            <Clock aria-hidden size={16} strokeWidth={1.8} />
            {mission.estimatedTime}
          </span>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-mission grid-cols-[30%_1fr] items-start gap-7 px-6 pt-9 pb-20">
        <BriefPanel brief={mission.brief} />

        <section className="rounded-card border border-border bg-surface px-8 pt-[30px] pb-8">
          <h2 className="text-card-title text-text">미션 안내</h2>

          <ol className="mt-5 space-y-3">
            {guide.map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-[10px] border border-border bg-bg px-5 py-[18px]"
              >
                <span
                  className={`mt-px flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${theme.soft} ${theme.text}`}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-[16px] font-bold text-text">
                    Step {i + 1} {mission.stepLabels[i]}
                  </p>
                  <p className="mt-1 text-[15px] leading-[1.6] text-text-sub">{line}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-5 flex items-center gap-1.5 text-caption font-medium text-text-muted">
            <CircleCheck aria-hidden size={14} strokeWidth={1.8} />
            무료 · 로그인 불필요 · 답안은 이 브라우저에만 저장돼요
          </p>

          <button
            type="button"
            onClick={start}
            className={`mt-7 h-14 w-full rounded-btn text-[17px] font-bold text-white transition-colors ${theme.bg} ${theme.bgHover}`}
          >
            미션 시작
          </button>
          <Link
            href="/missions"
            className="mt-4 block text-center text-[14px] font-medium text-text-sub underline underline-offset-[3px] hover:text-text"
          >
            다른 세부 직무 보기
          </Link>
        </section>
      </main>
    </>
  );
}
