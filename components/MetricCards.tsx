import { ChevronDown, ChevronUp } from "lucide-react";
import type { Metric } from "@/data/missions";

type Props = {
  title: string;
  metrics: Metric[];
};

export default function MetricCards({ title, metrics }: Props) {
  return (
    <section className="rounded-card border border-border bg-surface px-8 pt-[30px] pb-[30px]">
      <h2 className="text-card-title text-text">{title}</h2>

      <ul className="mt-[22px] grid grid-cols-3 gap-[14px]">
        {metrics.map((m) => {
          const up = m.trend === "up";
          return (
            <li
              key={m.label}
              className="rounded-[10px] border border-border bg-bg px-[19px] pt-[22px] pb-5"
            >
              <p className="text-[14px] font-medium text-text-sub">{m.label}</p>
              <div className="mt-4 flex items-end justify-between">
                <p className="flex items-baseline gap-2.5">
                  <span className="text-[15px] font-medium text-text-muted line-through">
                    <span className="sr-only">이전 </span>
                    {m.before}
                  </span>
                  <span className="text-[26px] leading-none font-bold tracking-[-0.02em] text-text">
                    <span className="sr-only">현재 </span>
                    {m.after}
                  </span>
                </p>
                <span
                  className={`flex h-[26px] items-center gap-0.5 rounded-tag px-2 text-[13px] font-semibold ${
                    up ? "bg-up-bg text-up-fg" : "bg-down-bg text-down-fg"
                  }`}
                >
                  {up ? (
                    <ChevronUp aria-hidden size={13} strokeWidth={2.4} />
                  ) : (
                    <ChevronDown aria-hidden size={13} strokeWidth={2.4} />
                  )}
                  {up ? "상승" : "하락"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
