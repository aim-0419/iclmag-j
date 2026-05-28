import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/backend/middleware/auth";
import { findUserById } from "@/backend/services/userService";

// ====================================
// 현재 로그인 사용자 정보 조회 API
// GET /api/auth/me
// ====================================

/**
 * 현재 로그인한 사용자 정보 반환
 * 헤더의 로그인 상태 확인, 기사 작성 권한 확인 등에 사용
 */
export async function GET(request: NextRequest) {
  // JWT 쿠키에서 사용자 정보 추출 및 검증
  const tokenUser = await getAuthUser(request);

  if (!tokenUser) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  // DB에서 최신 사용자 정보 조회 (역할 변경 등 반영)
  const user = await findUserById(tokenUser.userId);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "사용자를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}
