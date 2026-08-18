import { NextResponse } from "next/server";

// ====================================
// 로그아웃 API
// POST /api/auth/logout
// ------------------------------------
// 브라우저에 저장된 로그인 증명서(쿠키)를 즉시 만료시켜 로그아웃합니다.
// ====================================

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "로그아웃되었습니다.",
  });

  // 만료 시각을 과거로 지정하면 브라우저가 쿠키를 바로 삭제합니다.
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
