import { ChevronRight, Clock } from "lucide-react";
import type { ThemeClasses } from "@/lib/theme";

type Props = {
  labels: [string, string, string];
  current: 1 | 2 | 3;
  theme: ThemeClasses;
  timeLabel: string;
};

export default function StepBar({ labels, current, theme, timeLabel }: Props) {
  return (
    <div className="w-full border-b border-border bg-bg">
      <div className="mx-auto flex h-[76px] max-w-mission items-center justify-between px-6">
        <ol className="flex items-center gap-4">
          {labels.map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const active = n === current;
            return (
              <li key={label} className="flex items-center gap-4">
                {i > 0 && (
                  <ChevronRight
                    aria-hidden
                    size={15}
                    strokeWidth={2}
                    className="-ml-0.5 text-[#C9CDD4]"
                  />
                )}
                <span
                  aria-current={active ? "step" : undefined}
                  className="flex items-center gap-2.5"
                >
                  <span
                    className={`flex h-[23px] w-[23px] items-center justify-center rounded-full text-[12px] font-semibold ${
                      active
                        ? `${theme.soft} ${theme.text}`
                        : "border border-border bg-bg text-text-sub"
                    }`}
                  >
                    {n}
                  </span>
                  <span
                    className={`text-[16px] ${
                      active ? `font-semibold ${theme.text}` : "font-medium text-text-sub"
                    }`}
                  >
                    Step {n} {label}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        <span className="flex h-[38px] items-center gap-2 rounded-full border border-border bg-surface px-4 text-[15px] font-medium text-text-sub">
          <Clock size={16} strokeWidth={1.8} />
          {timeLabel}
        </span>
      </div>
    </div>
  );
}
