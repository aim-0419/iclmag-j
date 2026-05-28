import { NextRequest, NextResponse } from "next/server";
import {
  getArticleById,
  updateArticle,
  deleteArticle,
  isArticleAuthor,
} from "@/backend/services/articleService";
import { requireAuth, isAdmin } from "@/backend/middleware/auth";

// ====================================
// 개별 기사 조회 / 수정 / 삭제 API
// GET    /api/articles/[id]   - 기사 상세 조회
// PUT    /api/articles/[id]   - 기사 수정 (작성자 or 관리자)
// DELETE /api/articles/[id]   - 기사 삭제 (작성자 or 관리자)
// ====================================

/**
 * 기사 상세 조회
 * 조회수가 자동으로 1 증가됨
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = Number(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        { success: false, message: "올바르지 않은 기사 ID입니다." },
        { status: 400 }
      );
    }

    const article = await getArticleById(articleId);

    if (!article) {
      return NextResponse.json(
        { success: false, message: "기사를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error("[기사 조회 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 기사 수정
 * 본인이 작성한 기사 또는 관리자만 수정 가능
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const articleId = Number(id);

    // 관리자가 아니면 본인 기사인지 확인
    if (!isAdmin(user)) {
      const isAuthor = await isArticleAuthor(articleId, user.userId);
      if (!isAuthor) {
        return NextResponse.json(
          { success: false, message: "수정 권한이 없습니다." },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const updatedArticle = await updateArticle(articleId, body);

    return NextResponse.json({
      success: true,
      message: "기사가 수정되었습니다.",
      data: updatedArticle,
    });
  } catch (error) {
    console.error("[기사 수정 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 기사 삭제
 * 본인이 작성한 기사 또는 관리자만 삭제 가능
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const articleId = Number(id);

    // 관리자가 아니면 본인 기사인지 확인
    if (!isAdmin(user)) {
      const isAuthor = await isArticleAuthor(articleId, user.userId);
      if (!isAuthor) {
        return NextResponse.json(
          { success: false, message: "삭제 권한이 없습니다." },
          { status: 403 }
        );
      }
    }

    await deleteArticle(articleId);

    return NextResponse.json({
      success: true,
      message: "기사가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("[기사 삭제 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
