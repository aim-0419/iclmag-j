import { NextRequest, NextResponse } from "next/server";
import { getArticles, createArticle, validateArticleInput } from "@/backend/services/articleService";
import { requireAuth, hasWritePermission } from "@/backend/middleware/auth";
import { Category, Status } from "@prisma/client";

// ====================================
// 기사 목록 조회 / 기사 생성 API
// GET  /api/articles          - 기사 목록 조회
// POST /api/articles          - 새 기사 생성 (ADMIN만)
// ====================================

/**
 * 기사 목록 조회
 * 페이지네이션과 카테고리 필터 지원
 * 쿼리 파라미터: ?page=1&category=POLITICS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const categoryParam = searchParams.get("category");

    // 카테고리 파라미터 검증
    const validCategories = ["POLITICS", "ECONOMY", "SOCIETY", "CULTURE", "TECH", "WORLD"];
    const category = categoryParam && validCategories.includes(categoryParam)
      ? (categoryParam as Category)
      : undefined;

    const result = await getArticles(page, category);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[기사 목록 조회 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 새 기사 생성
 * ADMIN 권한 필요
 * 요청 Body: { title, content, summary?, thumbnail?, category, status? }
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 기사 작성 권한 확인 (ADMIN만 가능)
    if (!hasWritePermission(user)) {
      return NextResponse.json(
        { success: false, message: "관리자만 기사를 작성할 수 있습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, summary, thumbnail, category, status } = body;

    // 입력값 유효성 검증
    const errors = validateArticleInput(title, content, category);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // 기사 생성
    const article = await createArticle(
      {
        title: title.trim(),
        content: content.trim(),
        summary: summary?.trim() || null,
        thumbnail: thumbnail || null,
        category: category as Category,
        status: (status as Status) || Status.DRAFT,
      },
      user.userId
    );

    return NextResponse.json(
      {
        success: true,
        message: status === "PUBLISHED" ? "기사가 발행되었습니다." : "임시저장되었습니다.",
        data: article,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[기사 생성 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
