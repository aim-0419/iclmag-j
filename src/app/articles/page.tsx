import type { Metadata } from "next";
import { getArticles } from "@/backend/services/articleService";
import ArticleGrid from "@/frontend/components/articles/ArticleGrid";
import Pagination from "@/frontend/components/common/Pagination";
import EmptyState from "@/frontend/components/common/EmptyState";

// ====================================
// 전체 기사 목록 화면
// 주소: /articles  (페이지 이동 시 /articles?page=2)
// ------------------------------------
// 홈 화면 아래쪽의 "기사 더보기" 버튼을 누르면 이 화면으로 옵니다.
// 카테고리 구분 없이 발행된 모든 기사를 최신순으로 보여 주며,
// 한 페이지에 12개씩 나눠서 표시합니다.
// ====================================

export const revalidate = 60;

export const metadata: Metadata = {
  title: "전체 기사",
  description: "발행된 모든 기사를 최신순으로 확인하세요.",
};

interface ArticlesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const { articles, total, totalPages } = await getArticles(currentPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 화면 제목 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-accent rounded-full flex-shrink-0" />
          <h1 className="text-2xl font-bold text-gray-900">전체 기사</h1>
        </div>
        <p className="text-gray-500 text-sm ml-4">
          총 <strong className="text-gray-700">{total.toLocaleString()}</strong>개의 기사
        </p>
      </div>

      {articles.length > 0 ? (
        <>
          <ArticleGrid articles={articles} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildHref={(nextPage) => `/articles?page=${nextPage}`}
          />
        </>
      ) : (
        <EmptyState
          icon="📭"
          title="표시할 기사가 없습니다."
          description="요청하신 페이지에 기사가 없습니다."
          action={{ label: "첫 페이지로 돌아가기", href: "/articles" }}
        />
      )}
    </div>
  );
}
