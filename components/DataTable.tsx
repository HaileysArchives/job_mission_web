import { Info } from "lucide-react";
import type { ChannelRow } from "@/data/missions";
import type { ThemeClasses } from "@/lib/theme";

type Props = {
  title: string;
  chip: string;
  rows: ChannelRow[];
  footnote: { avg: string; target: string };
  theme: ThemeClasses;
};

// 레퍼런스 02의 열 시작 위치 비율에 맞춘 열 너비
const COLS = "grid grid-cols-[24%_19.5%_23%_15.5%_18%] items-center px-8";

export default function DataTable({ title, chip, rows, footnote, theme }: Props) {
  return (
    <section className="rounded-card border border-border bg-surface px-8 pt-[30px] pb-[30px]">
      <div className="flex items-center justify-between">
        <h2 className="text-card-title text-text">{title}</h2>
        <span className="flex h-[31px] items-center rounded-tag border border-border bg-bg px-3 text-[13px] font-medium text-text-sub">
          {chip}
        </span>
      </div>

      <div className="mt-[22px] overflow-hidden rounded-card border border-border bg-bg">
        <div
          role="row"
          className={`${COLS} h-[49px] border-b border-border bg-[#F7F8FA] text-[14px] font-semibold text-text-sub`}
        >
          <span>채널</span>
          <span>광고비</span>
          <span>매출</span>
          <span>ROAS</span>
          <span>CPA</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.channel}
            role="row"
            className={`${COLS} h-[56px] text-[15px] ${
              i > 0 ? "border-t border-border" : ""
            } ${r.highlight ? "bg-accent-soft" : ""}`}
          >
            <span className="font-bold text-text">{r.channel}</span>
            <span className={r.highlight ? "font-bold text-text" : "text-text-sub"}>{r.spend}</span>
            <span className={r.highlight ? "font-bold text-text" : "text-text-sub"}>{r.revenue}</span>
            <span className={`font-bold ${r.highlight ? theme.text : "text-text"}`}>{r.roas}</span>
            <span
              className={`flex items-center gap-2 ${
                r.highlight ? `font-bold ${theme.text}` : "text-text-sub"
              }`}
            >
              {r.cpa}
              {r.highlight && (
                <span aria-hidden className={`h-[6px] w-[6px] rounded-full ${theme.bg}`} />
              )}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-5 flex items-center gap-2 text-[14px] font-medium text-text-sub">
        <Info size={15} strokeWidth={1.8} className="text-text-muted" />
        {footnote.avg}
        <span aria-hidden className="mx-1.5 h-3.5 w-px bg-border" />
        {footnote.target}
      </p>
    </section>
  );
}
