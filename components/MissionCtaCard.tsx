"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, CircleCheck } from "lucide-react";
import { logEvent } from "@/lib/events";

type Props = {
  jobId: string;
  missionId: string;
  roleName: string;
};

export default function MissionCtaCard({ jobId, missionId, roleName }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // 카드가 화면에 절반 이상 보이면 페이지 방문당 1회 mission_impression 기록
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          logEvent("mission_impression", { jobId });
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [jobId]);

  return (
    <div
      ref={ref}
      className="flex items-center justify-between gap-6 rounded-card border border-accent/70 bg-bg px-7 py-[26px]"
    >
      <div>
        <span className="inline-flex h-5 items-center rounded-[4px] bg-accent px-2 text-[11px] font-extrabold tracking-[0.02em] text-white">
          NEW
        </span>
        <h3 className="mt-3.5 text-[20px] font-bold leading-snug text-text">
          이 공고의 업무, 10분 만에 직접 해보세요
        </h3>
        <p className="mt-2.5 text-[14.5px] leading-relaxed tracking-[-0.02em] text-text-sub">
          {roleName}가 실제로 다루는 과제를 수행하고 현직자 기준 피드백을
          받아보세요.
        </p>
        <p className="mt-3.5 flex items-center gap-1.5 text-caption font-medium text-text-muted">
          <CircleCheck size={14} strokeWidth={1.8} />
          무료 · 약 10분 · 로그인 불필요
        </p>
      </div>

      <Link
        href={`/missions/${missionId}/brief`}
        onClick={() => logEvent("mission_cta_click", { jobId })}
        className="flex h-[54px] w-[168px] shrink-0 items-center justify-center gap-1.5 rounded-btn bg-accent text-[17px] font-bold text-white transition-colors hover:bg-[#D9653F]"
      >
        10분 체험 시작
        <ArrowRight size={18} strokeWidth={2.2} />
      </Link>
    </div>
  );
}
