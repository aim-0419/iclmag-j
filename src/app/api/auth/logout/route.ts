import { NextResponse } from "next/server";

// ====================================
// 로그아웃 API
// POST /api/auth/logout
// ====================================

/**
 * 로그아웃 처리
 * 쿠키에 저장된 JWT 토큰을 만료시켜 로그아웃 처리
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "로그아웃되었습니다.",
  });

  // auth_token 쿠키를 즉시 만료시킴
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    expires: new Date(0), // 과거 날짜로 설정하여 즉시 만료
    path: "/",
  });

  return response;
}
