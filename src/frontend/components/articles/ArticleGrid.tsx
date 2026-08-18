import ArticleCard from "./ArticleCard";
import type { ArticleListItem } from "@/types";

// ====================================
// 기사 카드 격자 배치 (공용)
// ------------------------------------
// 기사 카드들을 화면 너비에 맞춰 자동으로 줄 수를 바꿔 가며 배치합니다.
//   휴대폰    : 1줄에 1개
//   작은 태블릿 : 1줄에 2개
//   노트북    : 1줄에 3개
//   큰 모니터  : 1줄에 4개
// 홈 · 카테고리 · 전체 기사 화면이 같은 배치를 쓰도록 한 곳에 모았습니다.
// ====================================

export default function ArticleGrid({ articles }: { articles: ArticleListItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
