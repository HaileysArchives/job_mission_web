import { MessageSquare } from "lucide-react";
import type { RichText } from "@/data/feedback";

export default function FeedbackPanel({ paragraphs, tip }: { paragraphs: RichText[]; tip: string }) {
  return (
    <section className="rounded-card border border-border bg-surface px-[26px] pt-[30px] pb-[30px]">
      <h2 className="flex items-center gap-2.5 text-[18px] font-bold text-text">
        <MessageSquare aria-hidden size={20} strokeWidth={1.8} />
        시뮬레이션 피드백
      </h2>

      <div className="mt-5 space-y-4 text-[15px] leading-[1.75] text-text">
        {paragraphs.map((p, i) => (
          <p key={i}>
            {p.map((seg, j) =>
              seg.bold ? (
                <strong key={j} className="font-bold">
                  {seg.text}
                </strong>
              ) : (
                <span key={j}>{seg.text}</span>
              ),
            )}
          </p>
        ))}
      </div>

      <p className="mt-7 border-t border-border pt-5 text-[15px] leading-[1.7] text-text-sub">{tip}</p>
    </section>
  );
}
