import type { Config } from "tailwindcss";

/**
 * 디자인 토큰 — job_mission.md 3장 / reference 스크린샷 기준.
 * Tailwind v4에서 app/globals.css의 `@config` 지시어로 불러온다.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        surface: "#F4F5F8",
        border: "#E6E8EC",
        text: {
          DEFAULT: "#111318",
          sub: "#5B606B",
          muted: "#9AA0AA",
        },
        navy: "#1D202F",
        accent: {
          DEFAULT: "#E3704F", // 퍼포먼스 마케터 테마
          soft: "#FDF4F1",
          green: "#3A9B82", // 브랜드 마케터 테마
        },
        up: { bg: "#E8F5EC", fg: "#2E9E5B" },
        down: { bg: "#FCEBEC", fg: "#D6455A" },
        success: { DEFAULT: "#2E9E5B", bg: "#EEF7F2" },
        "compare-head": "#F9F9FB",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      fontSize: {
        "job-title": ["32px", { lineHeight: "1.3", fontWeight: "700" }],
        "card-title": ["18px", { lineHeight: "1.4", fontWeight: "700" }],
        question: ["17px", { lineHeight: "1.5", fontWeight: "700" }],
        body: ["15px", { lineHeight: "1.6" }],
        caption: ["13px", { lineHeight: "1.5" }],
        label: ["12px", { lineHeight: "1.5" }],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
        tag: "6px",
      },
      maxWidth: {
        job: "1200px",
        mission: "1280px",
      },
      height: {
        header: "64px",
      },
    },
  },
};

export default config;
