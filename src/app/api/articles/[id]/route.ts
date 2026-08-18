import { NextRequest } from "next/server";
import { getArticleById, updateArticle, deleteArticle } from "@/backend/services/articleService";
import { requireAuth, isAdmin } from "@/backend/middleware/auth";
import { ok, fail, serverError, MESSAGES } from "@/backend/lib/apiResponse";

// ====================================
// 기사 한 건 조회 / 수정 / 삭제 API
// ------------------------------------
// GET    /api/articles/기사번호  → 기사 내용 보기 (누구나)
// PUT    /api/articles/기사번호  → 기사 수정하기 (관리자만)
// DELETE /api/articles/기사번호  → 기사 삭제하기 (관리자만)
// ====================================

/** 주소에 들어 있는 기사 번호를 숫자로 바꿔 줍니다. 숫자가 아니면 null */
async function readArticleId(params: Promise<{ id: string }>): Promise<number | null> {
  const { id } = await params;
  const articleId = Number(id);
  return Number.isInteger(articleId) ? articleId : null;
}

/**
 * 로그인 + 관리자 권한을 한 번에 확인합니다.
 * 문제가 있으면 그대로 돌려보낼 응답을, 통과하면 null 을 돌려줍니다.
 */
async function checkAdmin(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) return fail(MESSAGES.loginRequired, 401);
  if (!isAdmin(user)) return fail(MESSAGES.adminOnly, 403);
  return null;
}

/**
 * 기사 내용 보기
 * 열어볼 때마다 조회수가 1씩 올라갑니다.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const articleId = await readArticleId(params);
    if (articleId === null) return fail(MESSAGES.invalidArticleId, 400);

    const article = await getArticleById(articleId);
    if (!article) return fail(MESSAGES.articleNotFound, 404);

    return ok(article);
  } catch (error) {
    return serverError("기사 조회", error);
  }
}

/**
 * 기사 수정하기 (관리자 전용)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await checkAdmin(request);
    if (denied) return denied;

    const articleId = await readArticleId(params);
    if (articleId === null) return fail(MESSAGES.invalidArticleId, 400);

    const body = await request.json();
    const updatedArticle = await updateArticle(articleId, body);

    return ok(updatedArticle, "기사가 수정되었습니다.");
  } catch (error) {
    return serverError("기사 수정", error);
  }
}

/**
 * 기사 삭제하기 (관리자 전용)
 * 삭제한 기사는 되돌릴 수 없습니다.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await checkAdmin(request);
    if (denied) return denied;

    const articleId = await readArticleId(params);
    if (articleId === null) return fail(MESSAGES.invalidArticleId, 400);

    await deleteArticle(articleId);

    return ok(undefined, "기사가 삭제되었습니다.");
  } catch (error) {
    return serverError("기사 삭제", error);
  }
}
