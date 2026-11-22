"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Mission } from "@/data/missions";
import { THEMES } from "@/lib/theme";
import { logEvent } from "@/lib/events";
import { useProgress, writeProgress, readProgress } from "@/lib/progress";
import { elapsedSeconds } from "@/lib/timer";
import StepBar from "@/components/StepBar";
import BriefPanel from "@/components/BriefPanel";
import DataTable from "@/components/DataTable";
import QuestionCard from "@/components/QuestionCard";
import OptionButton from "@/components/OptionButton";
import ReviewCards from "@/components/ReviewCards";
import MetricCards from "@/components/MetricCards";

type Step = 1 | 2 | 3;

function toStep(value: string | null): Step {
  const n = Number(value);
  return n === 2 || n === 3 ? n : 1;
}

export default function MissionPlay({ mission }: { mission: Mission }) {
  const router = useRouter();
  const step = toStep(useSearchParams().get("step"));
  const theme = THEMES[mission.theme];
  const { progress, hydrated } = useProgress(mission.id);
  const base = `/missions/${mission.id}`;

  const step2Len = (progress.step2 ?? "").trim().length;
  const step3Len = (progress.step3 ?? "").trim().length;
  const canProceed =
    step === 1
      ? !!progress.choice
      : step === 2
        ? step2Len >= mission.minLength.step2
        : step3Len >= mission.minLength.step3;

  // 진입 처리: 앞 단계를 건너뛰면 되돌리고, Step 1 최초 진입 시 시작 시각·mission_start 기록
  useEffect(() => {
    if (!hydrated) return;
    const p = readProgress(mission.id);
    if (step >= 2 && !p.choice) {
      router.replace(`${base}/play?step=1`);
      return;
    }
    if (step === 3 && (p.step2 ?? "").trim().length < mission.minLength.step2) {
      router.replace(`${base}/play?step=2`);
      return;
    }
    if (step === 1 && !p.startedAt) {
      writeProgress(mission.id, { startedAt: Date.now() });
      logEvent("mission_start", { missionId: mission.id });
    }
  }, [hydrated, step, mission.id, mission.minLength.step2, base, router]);

  const goPrev = () => {
    router.push(step === 1 ? `${base}/brief` : `${base}/play?step=${step - 1}`);
  };

  const goNext = () => {
    if (!canProceed) return;
    logEvent("step_complete", { missionId: mission.id, step });
    if (step < 3) {
      router.push(`${base}/play?step=${step + 1}`);
      return;
    }
    const now = Date.now();
    const startedAt = readProgress(mission.id).startedAt ?? now;
    const durationSec = elapsedSeconds(startedAt, now);
    writeProgress(mission.id, { submittedAt: now, durationSec });
    logEvent("mission_submit", { missionId: mission.id, durationSec });
    router.push(`${base}/result`);
  };

  const questionText =
    step === 1
      ? mission.questions.step1
      : step === 2
        ? mission.questions.step2
        : mission.questions.step3;

  const textField = step === 2 ? "step2" : "step3";
  const minLen = step === 2 ? mission.minLength.step2 : mission.minLength.step3;
  const textValue = (step === 2 ? progress.step2 : progress.step3) ?? "";

  return (
    <>
      <StepBar
        labels={mission.stepLabels}
        current={step}
        theme={theme}
        timeLabel={mission.estimatedTime}
      />

      <main className="mx-auto grid w-full max-w-mission grid-cols-[30%_1fr] gap-7 px-6 pt-9 pb-20">
        <BriefPanel brief={mission.brief} />

        <div className="flex min-w-0 flex-col gap-6">
          {mission.data.kind === "table" && (
            <DataTable
              title={mission.data.title}
              chip={mission.data.chip}
              rows={mission.data.rows}
              footnote={mission.data.footnote}
              theme={theme}
            />
          )}
          {mission.data.kind === "brand" && (
            <>
              <ReviewCards
                title={mission.data.reviews.title}
                caption={mission.data.reviews.caption}
                items={mission.data.reviews.items}
                theme={theme}
              />
              <MetricCards
                title={mission.data.survey.title}
                metrics={mission.data.survey.metrics}
              />
            </>
          )}

          <QuestionCard question={questionText} theme={theme}>
            {step === 1 ? (
              <div role="radiogroup" aria-label={questionText} className="grid grid-cols-2 gap-[14px]">
                {mission.questions.options.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    theme={theme}
                    selected={progress.choice === opt}
                    onSelect={() => writeProgress(mission.id, { choice: opt })}
                  />
                ))}
              </div>
            ) : (
              <div>
                <textarea
                  key={textField}
                  rows={5}
                  value={textValue}
                  onChange={(e) => writeProgress(mission.id, { [textField]: e.target.value })}
                  placeholder="자료에서 근거가 된 숫자나 내용을 함께 적어주세요"
                  className={`block min-h-[132px] w-full resize-y rounded-[10px] border border-border bg-bg px-5 py-4 text-[16px] leading-[1.65] text-text outline-none placeholder:text-text-muted ${theme.ring}`}
                />
                <p className="mt-2.5 text-right text-[13px] font-medium text-text-muted">
                  <span className={textValue.trim().length >= minLen ? theme.text : "text-text-sub"}>
                    {textValue.trim().length}자
                  </span>{" "}
                  / 최소 {minLen}자
                </p>
              </div>
            )}
          </QuestionCard>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goPrev}
              className="h-[52px] rounded-btn border border-border bg-bg px-7 text-[16px] font-bold text-text hover:bg-[#FAFAFB]"
            >
              이전
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className={`h-[52px] rounded-btn px-8 text-[16px] font-bold text-white transition-opacity ${theme.bg} ${
                canProceed ? theme.bgHover : "cursor-not-allowed opacity-40"
              }`}
            >
              {step === 3 ? "제출하고 피드백 보기" : "다음"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
