import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/frontend/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 매거진 주요 색상
        primary: "#0a0a0a",       // 헤더 배경 (거의 검정)
        accent: "#c8102e",        // 강조 색상 (매거진 레드)
        "accent-hover": "#a00d24",
        surface: "#f8f8f8",       // 페이지 배경
        muted: "#6b7280",         // 보조 텍스트
        border: "#e5e7eb",        // 구분선
      },
      fontFamily: {
        sans: ["'Noto Sans KR'", "system-ui", "sans-serif"],
        serif: ["'Noto Serif KR'", "Georgia", "serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
