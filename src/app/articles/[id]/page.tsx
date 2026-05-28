import { notFound } from "next/navigation";
import { getArticleById, getArticleByIdOnly } from "@/backend/services/articleService";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ContentProtection from "@/frontend/components/article/ContentProtection";

// ====================================
// 기사 상세 페이지
// 기사 제목, 본문, 메타데이터 표시
// SEO를 위한 동적 메타데이터 생성
// ====================================

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

/**
 * 동적 SEO 메타데이터 생성
 * 각 기사의 제목과 요약을 메타데이터로 설정
 */
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  // 메타데이터 생성 시에는 조회수를 올리지 않는 함수 사용
  const article = await getArticleByIdOnly(Number(id));

  if (!article) return { title: "기사를 찾을 수 없습니다" };

  return {
    title: article.title,
    description: article.summary || article.content.slice(0, 150),
    openGraph: {
      title: article.title,
      description: article.summary || undefined,
      images: article.thumbnail ? [article.thumbnail] : undefined,
    },
  };
}

/**
 * 날짜 포맷 함수
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(Number(id));

  // 기사가 없거나 비공개인 경우 404
  if (!article || article.status === "DRAFT") {
    notFound();
  }

  const categoryLabel = CATEGORY_LABELS[article.category];
  const categoryColor = CATEGORY_COLORS[article.category];

  return (
    <ContentProtection>
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 카테고리 빵부스러기 */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-gray-600">홈</Link>
        <span>›</span>
        <Link
          href={`/category/${article.category.toLowerCase()}`}
          className="hover:text-gray-600"
        >
          {categoryLabel}
        </Link>
      </nav>

      {/* 기사 헤더 */}
      <header className="mb-8">
        {/* 카테고리 배지 */}
        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${categoryColor}`}>
          {categoryLabel}
        </span>

        {/* 제목 */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">
          {article.title}
        </h1>

        {/* 요약 */}
        {article.summary && (
          <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-accent pl-4 mb-5">
            {article.summary}
          </p>
        )}

        {/* 메타 정보 (작성자, 날짜, 조회수) */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              {article.author.name.charAt(0)}
            </div>
            <span className="font-medium text-gray-700">{article.author.name}</span>
          </div>
          <span>•</span>
          <span>{formatDate(article.createdAt.toString())}</span>
          <span>•</span>
          <span>👁 조회 {article.views.toLocaleString()}</span>
        </div>
      </header>

      {/* 썸네일 이미지 */}
      {article.thumbnail && (
        <div className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden mb-8">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* 기사 본문 */}
      <article className="article-content mb-12">
        {article.content}
      </article>

      {/* 구분선 */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← 목록으로 돌아가기
          </Link>
          <Link
            href={`/category/${article.category.toLowerCase()}`}
            className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColor}`}
          >
            {categoryLabel} 더보기
          </Link>
        </div>
      </div>
    </div>
    </ContentProtection>
  );
}
