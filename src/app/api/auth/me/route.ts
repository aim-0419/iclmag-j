import { NextRequest } from "next/server";
import { requireAuth } from "@/backend/middleware/auth";
import { ok, fail, MESSAGES } from "@/backend/lib/apiResponse";

// ====================================
// 현재 로그인한 사람이 누구인지 알려주는 API
// GET /api/auth/me
// ------------------------------------
// 화면 상단의 "OOO님 / 로그아웃" 표시, 기사 쓰기 버튼 노출 여부,
// 마이페이지 접근 확인 등에 사용됩니다.
// 데이터베이스에서 최신 정보를 가져오므로 관리자 승격 등이 바로 반영됩니다.
// ====================================

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);

  if (!user) return fail(MESSAGES.loginRequired, 401);

  return ok({
    userId: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}
