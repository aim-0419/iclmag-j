import Link from "next/link";
import Image from "next/image";
import { ArticleListItem, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types";

// ====================================
// 기사 카드 컴포넌트
// 기사 목록에서 개별 기사를 카드 형태로 표시
// ====================================

interface ArticleCardProps {
  article: ArticleListItem;
  variant?: "default" | "featured" | "compact"; // 카드 스타일 변형
}

/**
 * 날짜를 한국어 형식으로 포맷
 * 예: "2024.01.15" 또는 "3시간 전"
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)}시간 전`;
  } else {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
}

export default function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const categoryLabel = CATEGORY_LABELS[article.category];
  const categoryColor = CATEGORY_COLORS[article.category];

  // ============================
  // Featured 카드 (홈 상단 대형 카드)
  // ============================
  if (variant === "featured") {
    return (
      <Link href={`/articles/${article.id}`} className="group block">
        <div className="relative w-full h-80 bg-gray-200 rounded-lg overflow-hidden mb-4">
          {article.thumbnail ? (
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            // 썸네일 없을 때 플레이스홀더
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-5xl">📰</span>
            </div>
          )}
          {/* 카테고리 배지 */}
          <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded ${categoryColor}`}>
            {categoryLabel}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 group-hover:text-accent transition-colors line-clamp-2 mb-2">
          {article.title}
        </h2>
        {article.summary && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{article.summary}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{article.author.name}</span>
          <span>•</span>
          <span>{formatDate(article.createdAt)}</span>
          <span>•</span>
          <span>조회 {article.views.toLocaleString()}</span>
        </div>
      </Link>
    );
  }

  // ============================
  // Compact 카드 (사이드바용 작은 카드)
  // ============================
  if (variant === "compact") {
    return (
      <Link href={`/articles/${article.id}`} className="group flex gap-3 items-start">
        <div className="relative w-20 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
          {article.thumbnail ? (
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl">📰</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${categoryColor}`}>
            {categoryLabel}
          </span>
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-accent transition-colors line-clamp-2 mt-1">
            {article.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{formatDate(article.createdAt)}</p>
        </div>
      </Link>
    );
  }

  // ============================
  // Default 카드 (기본 그리드 카드)
  // ============================
  return (
    <Link href={`/articles/${article.id}`} className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      {/* 썸네일 */}
      <div className="relative w-full h-48 bg-gray-100">
        {article.thumbnail ? (
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <span className="text-4xl">📰</span>
          </div>
        )}
        {/* 카테고리 배지 */}
        <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded ${categoryColor}`}>
          {categoryLabel}
        </span>
      </div>

      {/* 카드 내용 */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 group-hover:text-accent transition-colors line-clamp-2 text-base mb-2">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{article.summary}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>{article.author.name}</span>
            <span>•</span>
            <span>{formatDate(article.createdAt)}</span>
          </div>
          <span>👁 {article.views.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}
