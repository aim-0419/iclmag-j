import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { getArticleById, getArticleByIdOnly } from "@/backend/services/articleService";
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_SLUGS_BY_VALUE } from "@/constants/categories";
import { verifyToken } from "@/backend/lib/jwt";
import ContentProtection from "@/frontend/components/articles/ContentProtection";
import DeleteArticleButton from "@/frontend/components/articles/DeleteArticleButton";

// ====================================
// 기사 상세 화면
// 주소: /articles/기사번호
// ------------------------------------
// 기사 하나의 전체 내용을 보여 줍니다.
// 화면을 열 때마다 조회수가 1씩 올라가며,
// 발행하지 않은(임시저장) 기사는 404 화면으로 보냅니다.
//
// 본문은 복사 방지(ContentProtection)로 감싸져 있고,
// 관리자로 로그인한 경우에만 아래쪽에 삭제 버튼이 보입니다.
// ====================================

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

/** 브라우저 탭 제목, 검색 결과, 카카오톡 공유 미리보기에 쓰일 정보 */
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;

  // 검색엔진이 정보를 읽는 것은 사람이 읽은 것이 아니므로 조회수를 올리지 않습니다.
  const article = await getArticleByIdOnly(Number(id));

  if (!article) return { title: "기사를 찾을 수 없습니다" };

  const description = article.summary || article.content.slice(0, 150);

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      images: article.thumbnail ? [article.thumbnail] : undefined,
    },
  };
}

/** 작성 시각을 "2026년 8월 18일 오후 02:30" 형태로 표시 */
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 지금 보고 있는 사람이 관리자인지 확인합니다.
 * 관리자에게만 삭제 버튼을 보여 주기 위해 사용합니다.
 * (실제 삭제 권한은 서버 API에서 한 번 더 확인하므로 안전합니다.)
 */
async function isAdminViewer(): Promise<boolean> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return false;

  const user = await verifyToken(token);
  return user?.role === "ADMIN";
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;

  // 기사 조회 + 조회수 1 증가 (발행되지 않은 기사는 null 이 돌아옴)
  const article = await getArticleById(Number(id));
  if (!article) notFound();

  const canDelete = await isAdminViewer();
  const categoryLabel = CATEGORY_LABELS[article.category];
  const categoryColor = CATEGORY_COLORS[article.category];
  const categoryHref = `/category/${CATEGORY_SLUGS_BY_VALUE[article.category]}`;

  return (
    <ContentProtection>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
        {/* ---------- 현재 위치 안내 (홈 > 카테고리) ---------- */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">홈</Link>
          <span aria-hidden>&gt;</span>
          <Link href={categoryHref} className="hover:text-gray-600 transition-colors">
            {categoryLabel}
          </Link>
        </nav>

        {/* ---------- 제목 영역 ---------- */}
        <header className="mb-8">
          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${categoryColor}`}>
            {categoryLabel}
          </span>

          {/* break-keep + break-words: 긴 제목이 어색하게 잘리거나 화면을 넘지 않게 함 */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5 break-keep break-words">
            {article.title}
          </h1>

          {article.summary && (
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed border-l-4 border-accent pl-4 mb-5 break-keep">
              {article.summary}
            </p>
          )}

          {/* 작성자 · 작성일 · 조회수 (좁은 화면에서는 줄바꿈됨) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2 min-w-0">
              {/* 작성자 이름 첫 글자로 만든 간단한 프로필 표시 */}
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {article.author.name.charAt(0)}
              </div>
              <span className="font-medium text-gray-700 truncate">{article.author.name}</span>
            </div>
            <span aria-hidden>•</span>
            <span>{formatDate(article.createdAt)}</span>
            <span aria-hidden>•</span>
            <span>조회 {article.views.toLocaleString()}</span>
          </div>
        </header>

        {/* ---------- 대표 이미지 ---------- */}
        {article.thumbnail && (
          <div className="relative w-full h-56 sm:h-72 md:h-96 rounded-xl overflow-hidden mb-8 bg-gray-100">
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* ---------- 본문 ---------- */}
        {/* article-content 스타일이 줄바꿈과 한글 줄나눔을 알맞게 처리합니다 */}
        <article className="article-content mb-12">{article.content}</article>

        {/* ---------- 아래쪽 이동 링크 ---------- */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/articles"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              목록으로 돌아가기
            </Link>

            <div className="flex items-center gap-4">
              {/* 삭제 버튼은 관리자에게만 보입니다 */}
              {canDelete && <DeleteArticleButton articleId={article.id} />}
              <Link
                href={categoryHref}
                className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColor}`}
              >
                {categoryLabel} 더보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ContentProtection>
  );
}
