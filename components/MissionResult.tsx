"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock } from "lucide-react";
import type { Mission } from "@/data/missions";
import { RUBRICS } from "@/data/feedback";
import { THEMES } from "@/lib/theme";
import { logEvent } from "@/lib/events";
import { useProgress } from "@/lib/progress";
import { generateFeedback } from "@/lib/feedback";
import { formatDuration } from "@/lib/timer";
import AnswerCompare from "@/components/AnswerCompare";
import ObservationList from "@/components/ObservationList";
import FeedbackPanel from "@/components/FeedbackPanel";
import NextActions from "@/components/NextActions";

export default function MissionResult({ mission }: { mission: Mission }) {
  const router = useRouter();
  const theme = THEMES[mission.theme];
  const { progress, hydrated } = useProgress(mission.id);
  const submitted = hydrated && !!progress.submittedAt;
  const logged = useRef(false);

  // 제출 전이면 미션으로 돌려보내고, 제출했으면 feedback_view를 화면 진입당 1회 기록
  useEffect(() => {
    if (!hydrated) return;
    if (!progress.submittedAt) {
      router.replace(`/missions/${mission.id}/play?step=1`);
      return;
    }
    if (!logged.current) {
      logged.current = true;
      logEvent("feedback_view", { missionId: mission.id });
    }
  }, [hydrated, progress.submittedAt, mission.id, router]);

  const feedback = useMemo(
    () => generateFeedback(progress, RUBRICS[mission.id]),
    [progress, mission.id],
  );

  if (!submitted) return <main className="min-h-[80vh]" />;

  return (
    <>
      <div className="w-full border-b border-border bg-bg">
        <div className="mx-auto flex h-[72px] max-w-mission items-center justify-between px-6">
          <h1 className="flex items-center gap-3.5 text-[20px] font-bold text-text">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-success-bg text-success">
              <Check aria-hidden size={17} strokeWidth={2.6} />
            </span>
            미션 완료
          </h1>
          <span className="flex h-[38px] items-center gap-2 rounded-full border border-border bg-surface px-4 text-[15px] font-medium text-text-sub">
            <Clock aria-hidden size={16} strokeWidth={1.8} />
            소요시간
            <strong className="ml-1 font-bold text-text">
              {formatDuration(progress.durationSec ?? 0)}
            </strong>
          </span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-mission px-6 pt-9 pb-20">
        <p className="mb-4 text-[15px] text-text-sub">
          Step 1 선택: <strong className="font-bold text-text">{progress.choice}</strong>
          <span aria-hidden className="mx-2 text-text-muted">·</span>
          현직자 선택: <strong className={`font-bold ${theme.text}`}>{mission.reference.step1}</strong>
        </p>

        <AnswerCompare
          mine={{ step2: progress.step2 ?? "", step3: progress.step3 ?? "" }}
          reference={{ step2: mission.reference.step2, step3: mission.reference.step3 }}
          theme={theme}
        />

        <div className="mt-6 grid grid-cols-2 items-start gap-6">
          <ObservationList items={feedback.observations} />
          <FeedbackPanel paragraphs={feedback.paragraphs} tip={feedback.tip} />
        </div>

        <NextActions mission={mission} />
      </main>
    </>
  );
}
