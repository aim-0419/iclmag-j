import prisma from "@/backend/lib/db";
import { Category, Status } from "@prisma/client";

// ====================================
// 기사 관련 비즈니스 로직
// 기사 조회, 생성, 수정, 삭제 등
// ====================================

// 한 페이지에 표시할 기사 수
const PAGE_SIZE = 12;

/**
 * 기사 목록 조회 (페이지네이션 + 카테고리 필터)
 * 홈 화면 및 카테고리 페이지에서 사용
 *
 * @param page - 페이지 번호 (기본값: 1)
 * @param category - 카테고리 필터 (없으면 전체)
 * @returns 기사 목록과 총 개수
 */
export async function getArticles(page = 1, category?: Category) {
  const skip = (page - 1) * PAGE_SIZE;

  // 카테고리 필터 조건
  const where = {
    status: Status.PUBLISHED,
    ...(category && { category }),
  };

  // 기사 목록과 전체 개수를 동시에 조회
  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },  // 최신 기사 우선
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        summary: true,
        thumbnail: true,
        category: true,
        views: true,
        createdAt: true,
        author: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    currentPage: page,
  };
}

/**
 * 기사 상세 조회 (조회수 증가 없음)
 * SEO 메타데이터 생성 등 조회수를 올리지 않아야 할 때 사용
 *
 * @param id - 기사 ID
 * @returns 기사 상세 정보 또는 null
 */
export async function getArticleByIdOnly(id: number) {
  return prisma.article.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * 기사 상세 조회 (조회수 +1 증가 포함)
 * 실제 기사 상세 페이지 렌더링 시에만 사용
 *
 * @param id - 기사 ID
 * @returns 기사 상세 정보 또는 null
 */
export async function getArticleById(id: number) {
  // 기사 조회 후 조회수 1 증가
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true },
      },
    },
  });

  // 기사가 존재할 때만 조회수 증가
  if (article) {
    await prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  return article;
}

/**
 * 기사 생성
 * 로그인한 사용자가 새 기사를 작성할 때 사용
 *
 * @param data - 기사 작성 데이터
 * @param authorId - 작성자 ID
 * @returns 생성된 기사 정보
 */
export async function createArticle(
  data: {
    title: string;
    content: string;
    summary?: string;
    thumbnail?: string;
    category: Category;
    status?: Status;
  },
  authorId: number
) {
  return prisma.article.create({
    data: {
      ...data,
      authorId,
    },
    include: {
      author: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * 기사 수정
 * 본인 기사 또는 관리자만 수정 가능
 *
 * @param id - 기사 ID
 * @param data - 수정할 데이터
 * @returns 수정된 기사 정보
 */
export async function updateArticle(
  id: number,
  data: Partial<{
    title: string;
    content: string;
    summary: string;
    thumbnail: string;
    category: Category;
    status: Status;
  }>
) {
  return prisma.article.update({
    where: { id },
    data,
  });
}

/**
 * 기사 삭제
 * 본인 기사 또는 관리자만 삭제 가능
 *
 * @param id - 기사 ID
 */
export async function deleteArticle(id: number) {
  return prisma.article.delete({
    where: { id },
  });
}

/**
 * 기사 작성자 확인
 * 수정/삭제 전 권한 확인에 사용
 *
 * @param articleId - 기사 ID
 * @param userId - 현재 사용자 ID
 * @returns 작성자면 true
 */
export async function isArticleAuthor(articleId: number, userId: number): Promise<boolean> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true },
  });

  return article?.authorId === userId;
}

/**
 * 최근 기사 조회 (홈 상단 Featured 섹션용)
 *
 * @param count - 가져올 기사 수
 * @returns 최근 기사 목록
 */
export async function getLatestArticles(count = 5) {
  return prisma.article.findMany({
    where: { status: Status.PUBLISHED },
    orderBy: { createdAt: "desc" },
    take: count,
    select: {
      id: true,
      title: true,
      summary: true,
      thumbnail: true,
      category: true,
      views: true,
      createdAt: true,
      author: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * 기사 입력값 유효성 검증
 *
 * @param title - 제목
 * @param content - 본문
 * @param category - 카테고리
 * @returns 에러 메시지 배열
 */
export function validateArticleInput(
  title: string,
  content: string,
  category: string
): string[] {
  const errors: string[] = [];

  if (!title || title.trim().length < 1) {
    errors.push("제목을 입력해주세요.");
  }

  if (title && title.length > 500) {
    errors.push("제목은 500자를 초과할 수 없습니다.");
  }

  if (!content || content.trim().length < 1) {
    errors.push("본문을 입력해주세요.");
  }

  const validCategories = ["POLITICS", "ECONOMY", "SOCIETY", "CULTURE", "TECH", "WORLD"];
  if (!category || !validCategories.includes(category)) {
    errors.push("올바른 카테고리를 선택해주세요.");
  }

  return errors;
}
