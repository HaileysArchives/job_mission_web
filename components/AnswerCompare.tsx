import type { ThemeClasses } from "@/lib/theme";

type Column = { step2: string; step3: string };

type Props = {
  mine: Column;
  reference: Column;
  theme: ThemeClasses;
};

function Section({
  label,
  text,
  labelClass,
  divider,
}: {
  label: string;
  text: string;
  labelClass: string;
  divider?: boolean;
}) {
  return (
    <div className={divider ? "mt-7 border-t border-border pt-7" : ""}>
      <p className={`text-[13px] font-bold tracking-[0.02em] ${labelClass}`}>{label}</p>
      <p className="mt-2.5 text-[16px] leading-[1.7] font-medium text-text">&quot;{text}&quot;</p>
    </div>
  );
}

export default function AnswerCompare({ mine, reference, theme }: Props) {
  return (
    <section className="grid grid-cols-2 overflow-hidden rounded-card border border-border bg-bg">
      <h2 className="flex h-[62px] items-center gap-2.5 border-b border-border bg-compare-head px-[26px] text-[17px] font-bold text-text">
        <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-text-sub" />내 답안
      </h2>
      <h2
        className={`flex h-[62px] items-center gap-2.5 border-b border-l border-border px-[26px] text-[17px] font-bold ${theme.soft} ${theme.text}`}
      >
        <span aria-hidden className={`h-[5px] w-[5px] rounded-full ${theme.bg}`} />
        현직자 참고 답안
      </h2>

      <div className="px-[26px] pt-[34px] pb-9">
        <Section label="STEP 2 판단 근거" text={mine.step2} labelClass="text-text-sub" />
        <Section label="STEP 3 KPI" text={mine.step3} labelClass="text-text-sub" divider />
      </div>
      <div className="border-l border-border px-[26px] pt-[34px] pb-9">
        <Section label="STEP 2 판단 근거" text={reference.step2} labelClass={theme.text} />
        <Section label="STEP 3 KPI" text={reference.step3} labelClass={theme.text} divider />
      </div>
    </section>
  );
}
