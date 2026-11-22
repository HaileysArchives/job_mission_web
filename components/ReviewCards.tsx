import { Star } from "lucide-react";
import type { Review } from "@/data/missions";
import type { ThemeClasses } from "@/lib/theme";

type Props = {
  title: string;
  caption: string;
  items: Review[];
  theme: ThemeClasses;
};

function Stars({ count, theme }: { count: number; theme: ThemeClasses }) {
  return (
    <span className="flex gap-[3px]" aria-label={`별점 5점 중 ${count}점`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          size={14}
          strokeWidth={0}
          className={i < count ? `fill-current ${theme.text}` : "fill-current text-[#DADDE2]"}
        />
      ))}
    </span>
  );
}

export default function ReviewCards({ title, caption, items, theme }: Props) {
  return (
    <section className="rounded-card border border-border bg-surface px-8 pt-[30px] pb-[30px]">
      <div className="flex items-center justify-between">
        <h2 className="text-card-title text-text">{title}</h2>
        <span className="text-[13px] font-medium text-text-sub">{caption}</span>
      </div>

      <ul className="mt-[18px] grid grid-cols-2 gap-[14px]">
        {items.map((r) => (
          <li
            key={r.text}
            className="rounded-[10px] border border-border bg-bg px-[19px] pt-[19px] pb-[18px]"
          >
            <Stars count={r.stars} theme={theme} />
            <p className="mt-3 text-[15px] font-semibold leading-[1.6] text-text">
              &quot;{r.text}&quot;
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
