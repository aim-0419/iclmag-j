import type { Metadata } from "next";
import "./globals.css";
import Header from "@/frontend/components/layout/Header";
import Footer from "@/frontend/components/layout/Footer";
import { SITE } from "@/constants/site";

// ====================================
// 모든 화면의 공통 틀 (루트 레이아웃)
// ------------------------------------
// 어떤 화면을 열든 항상 아래 순서로 표시됩니다.
//   헤더(위) → 각 화면의 내용(가운데) → 푸터(아래)
//
// body 를 세로 방향 배치(flex-col)로 두고 가운데 영역에 flex-1 을 주면,
// 내용이 짧은 화면에서도 푸터가 화면 맨 아래에 자연스럽게 붙습니다.
// (예전처럼 각 화면마다 min-h-screen 을 주면 헤더·푸터 높이만큼
//  화면이 더 길어져 불필요한 스크롤이 생깁니다.)
// ====================================

/** 브라우저 탭 제목, 검색 결과 설명, 카카오톡 공유 미리보기 등에 쓰이는 정보 */
export const metadata: Metadata = {
  title: {
    default: `${SITE.logo.primary} ${SITE.logo.secondary} - ${SITE.name}`,
    template: `%s | ${SITE.logo.primary} ${SITE.logo.secondary}`,
  },
  description: SITE.description,
  keywords: ["뉴스", "매거진", "정치", "경제", "사회", "IT", "세계", "필라테스"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE.name,
    description: SITE.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-surface">
        {/* 위: 로고 + 사용자 메뉴 + 카테고리 */}
        <Header />

        {/* 가운데: 각 화면의 실제 내용 (남는 공간을 모두 차지) */}
        <main className="flex-1">{children}</main>

        {/* 아래: 약관 링크 + 매체 정보 */}
        <Footer />
      </body>
    </html>
  );
}
