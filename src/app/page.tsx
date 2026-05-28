import { getArticles, getLatestArticles } from "@/backend/services/articleService";
import ArticleCard from "@/frontend/components/articles/ArticleCard";
import Link from "next/link";

// ====================================
// 홈 페이지
// 최신 기사 목록을 Featured + 그리드 형태로 표시
// ====================================

export const revalidate = 5; // 5초마다 페이지 재검증 (ISR)

export default async function HomePage() {
  // 최신 기사 5개 + 전체 목록 동시 로딩
  const [latestArticles, articlesData] = await Promise.all([
    getLatestArticles(5),
    getArticles(1),
  ]);

  const featuredArticle = latestArticles[0];      // 메인 Featured 기사
  const subFeatured = latestArticles.slice(1, 3); // 서브 Featured 기사 2개
  const articles = articlesData.articles;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ============================
          Featured 섹션 (상단 메인 기사)
          ============================ */}
      {featuredArticle && (
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 메인 Featured 기사 (큰 카드) */}
            <div className="lg:col-span-2">
              <ArticleCard article={featuredArticle as any} variant="featured" />
            </div>

            {/* 서브 Featured 기사 2개 (오른쪽) */}
            <div className="flex flex-col gap-6">
              {subFeatured.map((article) => (
                <div key={article.id} className="flex-1">
                  <ArticleCard article={article as any} variant="featured" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================
          구분선
          ============================ */}
      <div className="border-t-2 border-primary mb-8 flex items-center gap-4">
        <h2 className="bg-primary text-white text-sm font-bold px-4 py-2 -mt-px">
          최신 기사
        </h2>
      </div>

      {/* ============================
          기사 그리드 목록
          ============================ */}
      {articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article as any} />
            ))}
          </div>

          {/* 더보기 링크 (전체 기사가 있을 경우) */}
          {articlesData.totalPages > 1 && (
            <div className="text-center">
              <Link
                href="/articles"
                className="inline-block border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg text-sm font-medium transition-colors"
              >
                기사 더보기
              </Link>
            </div>
          )}
        </>
      ) : (
        // 기사가 없을 때 표시
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📰</p>
          <p className="text-gray-500 text-lg">아직 등록된 기사가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">첫 번째 기사를 작성해보세요!</p>
        </div>
      )}
    </div>
  );
}
