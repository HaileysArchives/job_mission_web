import type { ReactNode } from "react";
import type { ThemeClasses } from "@/lib/theme";

type Props = {
  question: string;
  theme: ThemeClasses;
  children: ReactNode;
};

export default function QuestionCard({ question, theme, children }: Props) {
  return (
    <section className="rounded-card border border-border bg-surface px-8 pt-[38px] pb-8">
      <h2 className="flex items-baseline gap-2.5 text-question text-text">
        <span className={`text-[20px] font-bold ${theme.text}`}>Q.</span>
        {question}
      </h2>
      <div className="mt-[26px]">{children}</div>
    </section>
  );
}
