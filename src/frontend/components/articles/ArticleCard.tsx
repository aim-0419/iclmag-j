import Link from "next/link";
import Image from "next/image";
import type { ArticleListItem } from "@/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/constants/categories";

// ====================================
// 기사 카드 (목록에 표시되는 기사 한 칸)
// ------------------------------------
// 썸네일 이미지, 카테고리 배지, 제목, 요약, 작성자·날짜·조회수를 보여 줍니다.
// 카드 전체가 링크라서 어느 곳을 눌러도 기사 상세로 이동합니다.
//
// 두 가지 크기가 있습니다.
//   featured : 홈 화면 맨 위의 큰 대표 기사
//   default  : 그 아래 목록에 반복되는 기본 크기
// ====================================

interface ArticleCardProps {
  article: ArticleListItem;
  /** 카드 크기 (기본값: default) */
  variant?: "default" | "featured";
  /** 화면에 가장 먼저 보이는 이미지인지 (맞으면 우선 로딩해 체감 속도를 높임) */
  priority?: boolean;
}

/**
 * 작성 시각을 읽기 쉬운 형태로 바꿉니다.
 *   1시간 이내 → "12분 전"
 *   하루 이내  → "5시간 전"
 *   그 이후    → "2026. 08. 18."
 */
function formatDate(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/** 썸네일이 없는 기사에 보여 줄 대체 이미지 */
function ThumbnailPlaceholder({ size }: { size: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <span className={size} aria-hidden>📰</span>
    </div>
  );
}

export default function ArticleCard({
  article,
  variant = "default",
  priority = false,
}: ArticleCardProps) {
  const categoryLabel = CATEGORY_LABELS[article.category];
  const categoryColor = CATEGORY_COLORS[article.category];
  const isFeatured = variant === "featured";

  return (
    <Link
      href={`/articles/${article.id}`}
      className={
        isFeatured
          ? "group block h-full"
          : "group flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
      }
    >
      {/* ---------- 썸네일 영역 ---------- */}
      <div
        className={`relative w-full bg-gray-100 overflow-hidden ${
          isFeatured ? "h-56 sm:h-72 lg:h-80 rounded-lg mb-4" : "h-48 flex-shrink-0"
        }`}
      >
        {article.thumbnail ? (
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            // sizes: 화면 크기에 따라 알맞은 해상도의 이미지만 내려받게 해 데이터 낭비를 줄입니다.
            sizes={
              isFeatured
                ? "(max-width: 1024px) 100vw, 66vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            }
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ThumbnailPlaceholder size={isFeatured ? "text-5xl" : "text-4xl"} />
        )}

        {/* 카테고리 배지 */}
        <span
          className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded ${categoryColor}`}
        >
          {categoryLabel}
        </span>
      </div>

      {/* ---------- 글자 영역 ---------- */}
      <div className={isFeatured ? "" : "flex flex-col flex-1 p-4"}>
        {/*
          line-clamp-2 : 제목이 길어도 2줄까지만 보여 주고 나머지는 ... 으로 줄임
          break-keep   : 한글 단어가 중간에서 어색하게 잘리지 않게 함
          break-words  : 아주 긴 영문/주소가 카드 밖으로 삐져나가지 않게 함
        */}
        <h3
          className={`font-bold text-gray-900 group-hover:text-accent transition-colors line-clamp-2 break-keep break-words mb-2 ${
            isFeatured ? "text-lg sm:text-xl" : "text-base"
          }`}
        >
          {article.title}
        </h3>

        {article.summary && (
          <p className="text-gray-500 text-sm line-clamp-2 break-keep break-words mb-3">
            {article.summary}
          </p>
        )}

        {/* 작성자 · 날짜 · 조회수 (좁은 화면에서 넘치지 않도록 줄바꿈 허용) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400 mt-auto">
          <span className="truncate max-w-[8rem]">{article.author.name}</span>
          <span aria-hidden>•</span>
          <span>{formatDate(article.createdAt)}</span>
          <span aria-hidden>•</span>
          <span>조회 {article.views.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}
