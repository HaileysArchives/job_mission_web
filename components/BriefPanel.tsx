import { Mail } from "lucide-react";
import type { Brief } from "@/data/missions";

export default function BriefPanel({ brief }: { brief: Brief }) {
  const last = brief.paragraphs.length - 1;
  return (
    <aside className="rounded-card border border-border bg-surface px-[27px] pt-[27px] pb-10">
      <div className="flex items-center gap-3.5 border-b border-border pb-[26px]">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-btn border border-border bg-bg text-text-sub">
          <Mail size={21} strokeWidth={1.7} />
        </span>
        <div>
          <p className="text-[12px] font-medium text-text-muted">발신</p>
          <p className="mt-0.5 text-[16px] font-bold text-text">{brief.sender}</p>
        </div>
      </div>

      <h2 className="mt-[34px] text-[18px] font-bold leading-snug text-text">
        제목: {brief.subject}
      </h2>
      <div className="mt-5 space-y-[27px] text-[16px] leading-[1.7] text-text">
        {brief.paragraphs.map((p, i) => (
          <p key={i}>
            {i === 0 && "\""}
            {p}
            {i === last && "\""}
          </p>
        ))}
      </div>
    </aside>
  );
}
