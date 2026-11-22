"use client";

import { Bookmark, ChevronRight, Share2 } from "lucide-react";
import type { Job } from "@/data/jobs";
import { logEvent } from "@/lib/events";
import { useToast } from "@/components/Toast";
import MissionCtaCard from "@/components/MissionCtaCard";

const PROTOTYPE_TOAST = "프로토타입에서는 지원이 실제로 접수되지 않아요";
const SHARE_TOAST = "링크가 복사되었어요";

export default function JobDetailView({ job }: { job: Job }) {
  const { show, toast } = useToast();

  const onScrap = () => {
    logEvent("scrap_click", { jobId: job.id });
    show(PROTOTYPE_TOAST);
  };
  const onApply = () => {
    logEvent("apply_click", { jobId: job.id });
    show(PROTOTYPE_TOAST);
  };
  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // clipboard API를 쓸 수 없는 환경(비보안 컨텍스트 등) 대비
      const input = document.createElement("textarea");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    show(SHARE_TOAST);
  };

  return (
    <main className="mx-auto flex w-full max-w-job items-start gap-10 px-6 pt-11 pb-24">
      {/* ── 좌측 본문 ── */}
      <section className="min-w-0 flex-1">
        <div className="flex items-start gap-5">
          <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[10px] border border-border bg-surface text-[13px] font-semibold tracking-[0.04em] text-text-sub">
            LOGO
          </div>

          <div className="min-w-0 flex-1">
            <a
              href="#"
              className="text-[14px] font-medium text-text-sub underline underline-offset-[3px]"
            >
              {job.company}
            </a>
            <h1 className="mt-1.5 text-job-title tracking-[-0.03em] text-text">
              {job.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex h-[31px] items-center rounded-tag border border-border bg-surface px-3 text-[14px] font-medium text-text-sub"
                >
                  {tag}
                </span>
              ))}
              <span className="flex h-[31px] items-center rounded-tag bg-navy px-3 text-[14px] font-bold text-white">
                {job.dday}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 gap-2.5">
            <button
              type="button"
              aria-label="스크랩"
              onClick={onScrap}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-border bg-bg text-text-sub hover:bg-surface"
            >
              <Bookmark size={18} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="공유"
              onClick={onShare}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-border bg-bg text-text-sub hover:bg-surface"
            >
              <Share2 size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* 4칸 정보 박스 */}
        <dl className="mt-11 grid grid-cols-4 overflow-hidden rounded-card border border-border bg-surface">
          {job.summary.map((item, i) => (
            <div
              key={item.label}
              className={`px-[22px] py-[22px] ${i > 0 ? "border-l border-border" : ""}`}
            >
              <dt className="text-[13px] font-medium text-text-muted">{item.label}</dt>
              <dd className="mt-2 text-[16px] font-bold text-text">{item.value}</dd>
            </div>
          ))}
        </dl>

        {/* 담당업무 */}
        <h2 className="mt-[54px] inline-block border-b-2 border-text pb-3 text-[20px] font-bold text-text">
          담당업무
        </h2>
        <ul className="mt-6 space-y-2 pl-1">
          {job.duties.map((duty) => (
            <li
              key={duty}
              className="flex items-center gap-3 text-[16px] font-medium text-text"
            >
              <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-text" />
              {duty}
            </li>
          ))}
        </ul>

        <div className="mt-[66px]">
          <MissionCtaCard
            jobId={job.id}
            missionId={job.missionId}
            roleName={job.roleName}
          />
        </div>
      </section>

      {/* ── 우측 사이드바 ── */}
      <aside className="sticky top-6 flex w-[370px] shrink-0 flex-col gap-5">
        <div className="rounded-card border border-border bg-bg px-[26px] pt-[26px] pb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-text">지원 접수</h2>
            <span className="flex h-[30px] items-center rounded-tag bg-surface px-2.5 text-[15px] font-bold text-text">
              {job.dday}
            </span>
          </div>
          <button
            type="button"
            onClick={onApply}
            className="mt-6 h-[60px] w-full rounded-btn bg-navy text-[18px] font-bold text-white hover:bg-[#2A2E40]"
          >
            입사지원 하기
          </button>
          <div className="mt-[22px] flex items-center justify-center">
            <button
              type="button"
              onClick={onScrap}
              className="flex w-[84px] flex-col items-center gap-2 text-[13px] font-medium text-text-sub"
            >
              <Bookmark size={20} strokeWidth={1.8} className="text-text" />
              스크랩 {job.scrapCount}
            </button>
            <span aria-hidden className="h-7 w-px bg-border" />
            <button
              type="button"
              onClick={onShare}
              className="flex w-[84px] flex-col items-center gap-2 text-[13px] font-medium text-text-sub"
            >
              <Share2 size={20} strokeWidth={1.8} className="text-text" />
              공유하기
            </button>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface px-[26px] py-[30px]">
          <h2 className="text-[16px] font-bold text-text">기업정보</h2>
          <dl className="mt-5 space-y-3">
            {job.companyInfo.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-[14px]">
                <dt className="font-medium text-text-muted">{row.label}</dt>
                <dd className="font-semibold text-text">{row.value}</dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            className="mt-7 h-[45px] w-full rounded-btn border border-border bg-bg text-[15px] font-bold text-text hover:bg-[#FAFAFB]"
          >
            기업 상세정보 보기
          </button>
        </div>

        <div className="overflow-hidden rounded-card border border-border bg-bg">
          {job.links.map((link, i) => (
            <a
              key={link.label}
              href="#"
              className={`flex h-[58px] items-center justify-between px-[18px] hover:bg-[#FAFAFB] ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <span className="text-[16px] font-bold text-text">{link.label}</span>
              <span className="flex items-center gap-1 text-[15px] font-medium text-text-sub">
                {link.count}
                <ChevronRight size={16} strokeWidth={2} />
              </span>
            </a>
          ))}
        </div>
      </aside>

      {toast}
    </main>
  );
}
