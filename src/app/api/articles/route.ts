import { NextRequest } from "next/server";
import { getArticles, createArticle, validateArticleInput } from "@/backend/services/articleService";
import { requireAuth, isAdmin } from "@/backend/middleware/auth";
import { ok, fail, serverError, MESSAGES } from "@/backend/lib/apiResponse";
import { isValidCategory } from "@/constants/categories";
import { Status } from "@prisma/client";

// ====================================
// 기사 목록 조회 / 새 기사 등록 API
// ------------------------------------
// GET  /api/articles  → 기사 목록 가져오기 (누구나)
// POST /api/articles  → 새 기사 등록하기 (관리자만)
// ====================================

/**
 * 기사 목록 가져오기
 * 주소 뒤에 조건을 붙일 수 있습니다.
 *   예) /api/articles?page=2&category=POLITICS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const categoryParam = searchParams.get("category");

    // 이상한 카테고리 값이 들어오면 무시하고 전체 목록을 보여 줌
    const category = isValidCategory(categoryParam) ? categoryParam : undefined;

    return ok(await getArticles(page, category));
  } catch (error) {
    return serverError("기사 목록 조회", error);
  }
}

/**
 * 새 기사 등록하기 (관리자 전용)
 * 보내야 하는 값: { title, content, summary?, thumbnail?, category, status? }
 */
export async function POST(request: NextRequest) {
  try {
    // 1) 로그인했는지 확인
    const user = await requireAuth(request);
    if (!user) return fail(MESSAGES.loginRequired, 401);

    // 2) 관리자인지 확인
    if (!isAdmin(user)) return fail("관리자만 기사를 작성할 수 있습니다.", 403);

    const { title, content, summary, thumbnail, category, status } = await request.json();

    // 3) 입력값이 올바른지 확인
    const errors = validateArticleInput(title, content, category);
    if (errors.length > 0) {
      return fail(errors[0], 400, errors);
    }

    // 4) 저장 (status 를 지정하지 않으면 임시저장으로 처리)
    const isPublished = status === Status.PUBLISHED;
    const article = await createArticle(
      {
        title: title.trim(),
        content: content.trim(),
        summary: summary?.trim() || null,
        thumbnail: thumbnail || null,
        category,
        status: isPublished ? Status.PUBLISHED : Status.DRAFT,
      },
      user.userId
    );

    return ok(
      article,
      isPublished ? "기사가 발행되었습니다." : "임시저장되었습니다.",
      201
    );
  } catch (error) {
    return serverError("기사 등록", error);
  }
}
