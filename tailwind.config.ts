import type { Config } from "tailwindcss";

// ====================================
// Tailwind CSS 설정 (사이트 색상 / 글꼴 정의)
// ------------------------------------
// 화면에서 쓰는 className="bg-primary", "text-accent" 같은 이름들이
// 실제로 어떤 색인지 여기서 정합니다.
// 사이트 전체 색상을 바꾸고 싶다면 아래 colors 값만 수정하면 됩니다.
// ====================================

const config: Config = {
  // Tailwind 가 클래스 이름을 찾아볼 파일 위치
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/frontend/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0a0a0a",        // 헤더 배경 (거의 검정)
        accent: "#c8102e",         // 강조 색상 (매거진 레드)
        "accent-hover": "#a00d24", // 강조 색상 위에 마우스를 올렸을 때
        surface: "#f8f8f8",        // 페이지 바탕색
        muted: "#6b7280",          // 보조 글자색
        border: "#e5e7eb",         // 구분선
      },
      fontFamily: {
        sans: ["'Noto Sans KR'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
