import { NextRequest } from "next/server";
import { findUserByEmail } from "@/backend/services/userService";
import { createVerificationToken } from "@/backend/services/verificationService";
import { sendVerificationEmail } from "@/backend/lib/email";
import { ok, fail, serverError } from "@/backend/lib/apiResponse";

// ====================================
// 인증 코드 다시 보내기 API
// POST /api/auth/resend-verification
// ------------------------------------
// 메일이 오지 않았거나 10분이 지나 코드가 만료된 경우 사용합니다.
// 새 코드를 발급하면 이전 코드는 즉시 사용할 수 없게 됩니다.
// ====================================

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) return fail("이메일을 입력해주세요.", 400);

    const user = await findUserByEmail(email);

    // 가입되지 않은 이메일이거나 이미 인증을 마친 계정이어도
    // "발송했다"고 똑같이 답합니다. (어떤 이메일이 가입되어 있는지 알아내는 것을 막기 위함)
    if (!user || user.emailVerified) {
      return ok(undefined, "인증 코드를 발송했습니다.");
    }

    const code = await createVerificationToken(user.id);
    await sendVerificationEmail(email, user.name, code);

    return ok(undefined, "인증 코드를 재발송했습니다.");
  } catch (error) {
    return serverError("인증 코드 재발송", error);
  }
}
