import type { Metadata } from "next";
import "./globals.css";
import Header from "@/frontend/components/layout/Header";
import Footer from "@/frontend/components/layout/Footer";

// ====================================
// 루트 레이아웃
// 모든 페이지에서 공통으로 사용되는 레이아웃
// 헤더, 푸터, 메타데이터 설정
// ====================================

export const metadata: Metadata = {
  title: {
    default: "ICL MAG-J - 빠르고 정확한 뉴스",
    template: "%s | ICL MAG-J",
  },
  description: "정치, 경제, 사회, 생활/문화, IT/과학, 세계 뉴스를 빠르고 정확하게 전달합니다.",
  keywords: ["뉴스", "매거진", "정치", "경제", "사회", "IT", "세계"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "ICL MAG-J",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {/* 헤더 (로고 + 카테고리 네비게이션) */}
        <Header />

        {/* 메인 콘텐츠 영역 */}
        <main className="min-h-screen bg-surface">
          {children}
        </main>

        {/* 푸터 */}
        <Footer />
      </body>
    </html>
  );
}
