import { notFound } from "next/navigation";
import { getArticles } from "@/backend/services/articleService";
import { CATEGORY_LABELS, CATEGORY_SLUGS, Category } from "@/types";
import ArticleCard from "@/frontend/components/articles/ArticleCard";
import type { Metadata } from "next";
import Link from "next/link";

// ====================================
// 카테고리별 기사 목록 페이지
// URL: /category/politics, /category/economy 등
// ====================================

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

/**
 * 카테고리 SEO 메타데이터 생성
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_SLUGS[slug];
  if (!category) return { title: "카테고리를 찾을 수 없습니다" };

  const categoryLabel = CATEGORY_LABELS[category];
  return {
    title: `${categoryLabel} 뉴스`,
    description: `ICL MAG-J의 ${categoryLabel} 분야 최신 뉴스와 기사를 확인하세요.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  // 슬러그로 카테고리 enum 값 가져오기
  const category = CATEGORY_SLUGS[slug];

  // 잘못된 카테고리 슬러그면 404
  if (!category) notFound();

  const currentPage = Number(pageParam) || 1;
  const categoryLabel = CATEGORY_LABELS[category];

  // 해당 카테고리의 기사 목록 조회
  const { articles, total, totalPages } = await getArticles(currentPage, category as Category);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 카테고리 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-accent rounded-full" />
          <h1 className="text-2xl font-bold text-gray-900">{categoryLabel}</h1>
        </div>
        <p className="text-gray-500 text-sm ml-4">
          총 <strong className="text-gray-700">{total}</strong>개의 기사
        </p>
      </div>

      {/* 기사 목록 */}
      {articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article as any} />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {/* 이전 페이지 */}
              {currentPage > 1 && (
                <Link
                  href={`/category/${slug}?page=${currentPage - 1}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  이전
                </Link>
              )}

              {/* 페이지 번호 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Link
                  key={pageNum}
                  href={`/category/${slug}?page=${pageNum}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    pageNum === currentPage
                      ? "bg-primary text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </Link>
              ))}

              {/* 다음 페이지 */}
              {currentPage < totalPages && (
                <Link
                  href={`/category/${slug}?page=${currentPage + 1}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  다음
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        // 기사 없을 때
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-gray-500 text-lg">{categoryLabel} 기사가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">곧 새로운 기사가 등록될 예정입니다.</p>
          <Link
            href="/"
            className="inline-block mt-6 text-accent hover:underline text-sm"
          >
            홈으로 돌아가기
          </Link>
        </div>
      )}
    </div>
  );
}
