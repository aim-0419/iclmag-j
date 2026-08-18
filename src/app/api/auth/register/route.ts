import { NextRequest } from "next/server";
import { createUser, validateUserInput } from "@/backend/services/userService";
import { createVerificationToken } from "@/backend/services/verificationService";
import { sendVerificationEmail } from "@/backend/lib/email";
import { ok, fail, serverError, tooManyRequests } from "@/backend/lib/apiResponse";
import { limitByIp } from "@/backend/lib/rateLimit";

// ====================================
// 회원가입 API
// POST /api/auth/register
// ------------------------------------
// 이름·이메일·비밀번호를 받아 계정을 만들고,
// 곧바로 6자리 인증 코드를 메일로 보냅니다. (코드는 10분간 유효)
// 인증을 마치기 전에는 로그인할 수 없습니다.
// ====================================

export async function POST(request: NextRequest) {
  try {
    // 자동 프로그램이 가짜 계정을 대량으로 만드는 것을 차단 (1시간에 5번까지)
    const rate = limitByIp(request, "register");
    if (!rate.allowed) return tooManyRequests(rate.retryAfterSec);

    const { name, email, password } = await request.json();

    // 1) 입력값 확인 (화면에서도 확인하지만 서버에서 다시 검사)
    const errors = validateUserInput(email, password, name);
    if (errors.length > 0) {
      return fail(errors[0], 400, errors);
    }

    // 2) 계정 생성 (이메일 중복이면 아래 catch 에서 처리)
    const user = await createUser(email, password, name);

    // 3) 인증 코드 발급 후 메일 발송
    //    메일 서버 문제로 발송이 실패해도 가입 자체는 완료 처리하고,
    //    사용자는 "인증 코드 다시 받기" 버튼으로 재발송할 수 있습니다.
    const code = await createVerificationToken(user.id);
    try {
      await sendVerificationEmail(email, name, code);
    } catch (emailError) {
      console.error("[인증 메일 발송 실패]", emailError);
    }

    return ok(
      { id: user.id, email: user.email, name: user.name },
      "회원가입이 완료되었습니다. 이메일로 발송된 인증 코드를 입력해주세요.",
      201
    );
  } catch (error) {
    // 이미 가입된 이메일인 경우
    if (error instanceof Error && error.message === "이미 사용 중인 이메일입니다.") {
      return fail(error.message, 409);
    }
    return serverError("회원가입", error);
  }
}
