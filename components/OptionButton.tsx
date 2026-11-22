import type { ThemeClasses } from "@/lib/theme";

type Props = {
  label: string;
  selected: boolean;
  theme: ThemeClasses;
  onSelect: () => void;
};

export default function OptionButton({ label, selected, theme, onSelect }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex h-[62px] w-full items-center gap-4 rounded-[10px] border bg-bg px-6 text-left transition-colors ${
        selected ? `${theme.border} border-[1.5px]` : "border-border hover:border-[#CFD3DA]"
      }`}
    >
      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center">
        {selected ? (
          <span className={`h-3 w-3 rounded-full ${theme.bg}`} />
        ) : (
          <span className="h-[22px] w-[22px] rounded-full border border-border" />
        )}
      </span>
      <span className={`text-[17px] font-semibold ${selected ? theme.text : "text-text"}`}>
        {label}
      </span>
    </button>
  );
}
