import Link from "next/link";
import { getArticles, getLatestArticles } from "@/backend/services/articleService";
import ArticleCard from "@/frontend/components/articles/ArticleCard";
import ArticleGrid from "@/frontend/components/articles/ArticleGrid";
import EmptyState from "@/frontend/components/common/EmptyState";

// ====================================
// 홈 화면
// ------------------------------------
// 두 부분으로 되어 있습니다.
//   위: 대표 기사 영역 - 가장 최근 기사 1개를 크게, 그 다음 2개를 옆에 작게
//   아래: 최신 기사 목록 - 카드 형태의 격자 배치
//
// revalidate = 60 의 의미
//   완성된 홈 화면을 잠시 저장해 두었다가 그대로 보여 주는 방식(ISR)입니다.
//   방문할 때마다 데이터베이스를 조회하지 않아 화면이 훨씬 빠르게 열리고,
//   60초마다 새 기사를 반영해 최신 상태를 유지합니다.
//   (기사를 발행한 뒤 홈 목록에 뜨기까지 최대 1분이 걸릴 수 있습니다.)
// ====================================

export const revalidate = 60;

export default async function HomePage() {
  // 대표 기사 3개와 목록 기사를 동시에 불러옵니다. (하나씩 기다리지 않아 더 빠름)
  const [latestArticles, articlesData] = await Promise.all([
    getLatestArticles(3),
    getArticles(1),
  ]);

  const [mainFeatured, ...subFeatured] = latestArticles; // 첫 번째 = 큰 기사, 나머지 = 작은 기사
  const { articles, totalPages } = articlesData;

  // 기사가 하나도 없을 때
  if (!mainFeatured) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EmptyState
          title="아직 등록된 기사가 없습니다."
          description="관리자 계정으로 로그인하면 첫 번째 기사를 작성할 수 있습니다."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ============ 대표 기사 영역 ============ */}
      {/* 넓은 화면: 왼쪽 2칸(큰 기사) + 오른쪽 1칸(작은 기사 2개)
          좁은 화면: 위아래로 자연스럽게 쌓임 */}
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* priority: 화면을 열자마자 보이는 이미지라 우선 불러옵니다 */}
            <ArticleCard article={mainFeatured} variant="featured" priority />
          </div>

          {subFeatured.length > 0 && (
            <div className="flex flex-col gap-6">
              {subFeatured.map((article) => (
                <ArticleCard key={article.id} article={article} variant="featured" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ 최신 기사 목록 ============ */}
      <div className="border-t-2 border-primary mb-8">
        <h2 className="inline-block bg-primary text-white text-sm font-bold px-4 py-2">
          최신 기사
        </h2>
      </div>

      <ArticleGrid articles={articles} />

      {/* 기사가 한 페이지를 넘으면 전체 목록으로 가는 링크를 보여 줍니다 */}
      {totalPages > 1 && (
        <div className="text-center mt-10">
          <Link
            href="/articles"
            className="inline-block border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            기사 더보기
          </Link>
        </div>
      )}
    </div>
  );
}
