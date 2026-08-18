import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticles } from "@/backend/services/articleService";
import { CATEGORY_BY_SLUG, CATEGORY_LABELS, CATEGORIES } from "@/constants/categories";
import ArticleGrid from "@/frontend/components/articles/ArticleGrid";
import Pagination from "@/frontend/components/common/Pagination";
import EmptyState from "@/frontend/components/common/EmptyState";

// ====================================
// 카테고리별 기사 목록 화면
// 주소: /category/politics, /category/economy ...
// ------------------------------------
// 주소에 들어온 이름(politics)을 실제 카테고리 값(POLITICS)으로 바꿔서
// 해당 분야의 기사만 골라 보여 줍니다.
// 없는 카테고리 주소로 들어오면 404 화면을 보여 줍니다.
// ====================================

export const revalidate = 60;

/**
 * 미리 만들어 둘 주소 목록
 * 6개 카테고리 화면을 배포 시점에 미리 준비해 두어 첫 방문도 빠르게 열립니다.
 */
export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

/** 브라우저 탭 제목과 검색 결과에 표시될 설명 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG[slug];

  if (!category) return { title: "카테고리를 찾을 수 없습니다" };

  const label = CATEGORY_LABELS[category];
  return {
    title: `${label} 뉴스`,
    description: `${label} 분야의 최신 뉴스와 기사를 확인하세요.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;

  // 주소 이름(politics)을 실제 카테고리 값(POLITICS)으로 변환
  const category = CATEGORY_BY_SLUG[slug];
  if (!category) notFound();

  const currentPage = Number(page) || 1;
  const label = CATEGORY_LABELS[category];

  const { articles, total, totalPages } = await getArticles(currentPage, category);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 카테고리 제목 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-accent rounded-full flex-shrink-0" />
          <h1 className="text-2xl font-bold text-gray-900">{label}</h1>
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
            buildHref={(nextPage) => `/category/${slug}?page=${nextPage}`}
          />
        </>
      ) : (
        <EmptyState
          icon="📭"
          title={`${label} 기사가 없습니다.`}
          description="곧 새로운 기사가 등록될 예정입니다."
          action={{ label: "홈으로 돌아가기", href: "/" }}
        />
      )}
    </div>
  );
}
