import { NextRequest } from "next/server";
import { verifyEmailCode } from "@/backend/services/verificationService";
import { ok, fail, serverError, tooManyRequests } from "@/backend/lib/apiResponse";
import { limitByIp } from "@/backend/lib/rateLimit";

// ====================================
// 이메일 인증 코드 확인 API
// POST /api/auth/verify-email
// ------------------------------------
// 사용자가 입력한 6자리 코드가 맞는지 확인하고,
// 맞으면 해당 계정을 "이메일 인증 완료" 상태로 바꿉니다.
// ====================================

export async function POST(request: NextRequest) {
  try {
    // 6자리 숫자를 기계로 하나씩 넣어 보며 맞추는 것을 차단 (10분에 10번까지)
    const rate = limitByIp(request, "verifyEmail");
    if (!rate.allowed) return tooManyRequests(rate.retryAfterSec);

    const { email, code } = await request.json();

    if (!email || !code) {
      return fail("이메일과 인증 코드를 입력해주세요.", 400);
    }

    const result = await verifyEmailCode(email, String(code).trim());

    if (!result.success) return fail(result.message, 400);

    return ok(undefined, result.message);
  } catch (error) {
    return serverError("인증 코드 확인", error);
  }
}
