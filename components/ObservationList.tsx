import { Check, Info, Minus } from "lucide-react";
import type { Observation } from "@/lib/feedback";

export default function ObservationList({ items }: { items: Observation[] }) {
  return (
    <section className="rounded-card border border-border bg-bg px-[26px] pt-[30px] pb-[26px]">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-text">이번 수행에서 관찰된 것</h2>
        <span className="flex h-[30px] items-center rounded-tag bg-surface px-2.5 text-[13px] font-medium text-text-sub">
          평가 요소 아님
        </span>
      </div>

      <ul className="mt-5 space-y-[14px]">
        {items.map((o) => (
          <li key={o.key} className="flex items-center gap-3 text-[15px]">
            {o.met ? (
              <Check aria-label="관찰됨" size={18} strokeWidth={2.4} className="shrink-0 text-success" />
            ) : (
              <Minus aria-label="관찰되지 않음" size={18} strokeWidth={2} className="shrink-0 text-text-muted" />
            )}
            <span className={o.met ? "font-medium text-text" : "font-medium text-text-sub"}>
              {o.label}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 flex gap-2.5 rounded-btn bg-surface px-4 py-3.5 text-[13px] leading-[1.6] text-text-sub">
        <Info aria-hidden size={17} strokeWidth={1.8} className="mt-[2px] shrink-0" />
        <span>
          이 항목은 점수나 평가가 아니라 사용자가 이번 시뮬레이션 과정에서 수행한 내용을{" "}
          <strong className="font-bold text-text">객관적으로</strong> 정리한 것입니다.
        </span>
      </p>
    </section>
  );
}
