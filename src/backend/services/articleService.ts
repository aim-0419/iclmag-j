import { prisma } from "@/backend/lib/db";
import { Category, Status } from "@prisma/client";
import { isValidCategory } from "@/constants/categories";

// ====================================
// 기사 관련 기능 모음 (조회 · 작성 · 수정 · 삭제)
// ------------------------------------
// 데이터베이스에서 기사를 가져오거나 저장하는 실제 작업을 담당합니다.
// 화면(app 폴더)과 API는 이 파일의 함수만 호출하고,
// 데이터베이스 문법을 직접 다루지 않습니다.
// ====================================

/** 한 페이지에 보여줄 기사 개수 */
const PAGE_SIZE = 12;

/**
 * 목록 화면에 필요한 항목만 골라 가져오기 위한 설정
 * 본문 전체를 가져오지 않아 목록 조회가 훨씬 빨라집니다.
 */
const LIST_FIELDS = {
  id: true,
  title: true,
  summary: true,
  thumbnail: true,
  category: true,
  views: true,
  createdAt: true,
  author: { select: { id: true, name: true } },
} as const;

/**
 * 기사 목록 가져오기 (페이지 나누기 + 카테고리 걸러내기)
 * 홈 화면, 카테고리 화면, 전체 기사 화면에서 사용합니다.
 * 발행(PUBLISHED)된 기사만 보여 주고, 최신 글이 위로 옵니다.
 *
 * @param page - 몇 번째 페이지인지 (기본 1)
 * @param category - 특정 카테고리만 볼 때 지정 (없으면 전체)
 * @returns 기사 목록 + 전체 개수 + 전체 페이지 수
 */
export async function getArticles(page = 1, category?: Category) {
  // 1페이지는 0개 건너뛰고, 2페이지는 12개 건너뛰는 식으로 계산
  const safePage = Math.max(1, Math.floor(page) || 1);
  const skip = (safePage - 1) * PAGE_SIZE;

  const where = {
    status: Status.PUBLISHED,
    ...(category && { category }),
  };

  // 목록과 전체 개수를 한 번의 접속으로 동시에 조회 (속도 향상)
  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" }, // 최신 기사 우선
      skip,
      take: PAGE_SIZE,
      select: LIST_FIELDS,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    currentPage: safePage,
  };
}

/**
 * 홈 화면 상단(대표 기사 영역)에 쓸 최신 기사 가져오기
 *
 * @param count - 가져올 개수
 */
export async function getLatestArticles(count = 5) {
  return prisma.article.findMany({
    where: { status: Status.PUBLISHED },
    orderBy: { createdAt: "desc" },
    take: count,
    select: LIST_FIELDS,
  });
}

/**
 * 기사 한 건 가져오기 (조회수는 올리지 않음)
 * 검색엔진에 보여줄 제목·설명을 만들 때처럼,
 * 사람이 실제로 읽은 것이 아닌 경우에 사용합니다.
 *
 * @param id - 기사 번호
 */
export async function getArticleByIdOnly(id: number) {
  if (!Number.isInteger(id)) return null;

  return prisma.article.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } } },
  });
}

/**
 * 기사 한 건 가져오기 + 조회수 1 올리기
 * 독자가 기사 상세 화면을 열었을 때만 사용합니다.
 *
 * 조회와 조회수 증가를 한 번의 명령으로 처리해
 * 데이터베이스 접속 횟수를 줄이고, 화면에는 방금 증가한 조회수가 표시됩니다.
 * 임시저장(DRAFT) 상태의 기사는 조회수를 올리지 않고 없는 것으로 처리합니다.
 *
 * @param id - 기사 번호
 * @returns 기사 정보, 없거나 미발행이면 null
 */
export async function getArticleById(id: number) {
  if (!Number.isInteger(id)) return null;

  try {
    return await prisma.article.update({
      where: { id, status: Status.PUBLISHED },
      data: { views: { increment: 1 } },
      include: { author: { select: { id: true, name: true } } },
    });
  } catch {
    // 해당 번호의 발행된 기사가 없는 경우
    return null;
  }
}

/**
 * 새 기사 저장하기 (관리자만 호출됨)
 *
 * @param data - 제목·본문·카테고리 등 기사 내용
 * @param authorId - 작성자(관리자) 번호
 */
export async function createArticle(
  data: {
    title: string;
    content: string;
    summary?: string | null;
    thumbnail?: string | null;
    category: Category;
    status?: Status;
  },
  authorId: number
) {
  return prisma.article.create({
    data: { ...data, authorId },
    select: { id: true, status: true },
  });
}

/**
 * 기사 수정하기 (관리자만 호출됨)
 * 전달된 항목만 바뀌고, 전달하지 않은 항목은 그대로 유지됩니다.
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
  return prisma.article.update({ where: { id }, data });
}

/**
 * 기사 삭제하기 (관리자만 호출됨)
 * 한 번 삭제하면 되돌릴 수 없습니다.
 */
export async function deleteArticle(id: number) {
  return prisma.article.delete({ where: { id } });
}

/**
 * 기사 입력값이 올바른지 검사하기
 * 화면에서 한 번 검사하지만, 서버에서도 반드시 다시 검사합니다.
 * (화면 검사만 믿으면 악의적인 요청을 막을 수 없기 때문입니다.)
 *
 * @returns 문제가 있으면 안내 문구 목록, 없으면 빈 목록
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
  if (!isValidCategory(category)) {
    errors.push("올바른 카테고리를 선택해주세요.");
  }

  return errors;
}
