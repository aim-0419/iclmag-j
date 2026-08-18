import { NextRequest } from "next/server";
import { verifyPasswordResetToken, deletePasswordResetToken } from "@/backend/services/passwordResetService";
import { updateUserPassword } from "@/backend/services/userService";
import { ok, fail, serverError, tooManyRequests } from "@/backend/lib/apiResponse";
import { limitByIp } from "@/backend/lib/rateLimit";

// ====================================
// 새 비밀번호 저장 API
// POST /api/auth/reset-password
// ------------------------------------
// 메일로 받은 링크 속 임시 열쇠(토큰)가 유효한지 확인한 뒤
// 새 비밀번호로 바꿔 줍니다. 사용한 열쇠는 즉시 폐기해 재사용을 막습니다.
// ====================================

export async function POST(request: NextRequest) {
  try {
    // 재설정 열쇠를 무작위로 찍어 보는 것을 차단 (10분에 10번까지)
    const rate = limitByIp(request, "resetPassword");
    if (!rate.allowed) return tooManyRequests(rate.retryAfterSec);

    const { token, password } = await request.json();

    if (!token || !password) {
      return fail("올바르지 않은 요청입니다.", 400);
    }
    if (password.length < 8) {
      return fail("비밀번호는 8자 이상이어야 합니다.", 400);
    }

    // 링크가 만료되었거나 이미 사용된 경우
    const userId = await verifyPasswordResetToken(token);
    if (!userId) {
      return fail("유효하지 않거나 만료된 링크입니다.", 400);
    }

    await updateUserPassword(userId, password);
    await deletePasswordResetToken(token);

    return ok(undefined, "비밀번호가 성공적으로 변경되었습니다.");
  } catch (error) {
    return serverError("비밀번호 재설정", error);
  }
}
