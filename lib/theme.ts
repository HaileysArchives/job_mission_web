import type { ThemeKey } from "@/data/missions";

// 직무별 테마색. Tailwind가 클래스를 정적으로 찾을 수 있도록 전체 클래스명을 적어 둔다.
export type ThemeClasses = {
  text: string;
  bg: string;
  bgHover: string;
  border: string;
  hoverBorder: string;
  soft: string; // 활성 스텝 숫자 원 배경
  ring: string; // textarea 포커스
};

export const THEMES: Record<ThemeKey, ThemeClasses> = {
  coral: {
    text: "text-accent",
    bg: "bg-accent",
    bgHover: "hover:bg-[#D9653F]",
    border: "border-accent",
    hoverBorder: "hover:border-accent",
    soft: "bg-accent-soft",
    ring: "focus:border-accent",
  },
  green: {
    text: "text-accent-green",
    bg: "bg-accent-green",
    bgHover: "hover:bg-[#318A73]",
    border: "border-accent-green",
    hoverBorder: "hover:border-accent-green",
    soft: "bg-[#EAF5F1]",
    ring: "focus:border-accent-green",
  },
};
