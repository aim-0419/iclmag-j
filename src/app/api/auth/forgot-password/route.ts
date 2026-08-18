import { NextRequest } from "next/server";
import { findUserByEmail } from "@/backend/services/userService";
import { createPasswordResetToken } from "@/backend/services/passwordResetService";
import { sendPasswordResetEmail } from "@/backend/lib/email";
import { ok, fail, serverError } from "@/backend/lib/apiResponse";

// ====================================
// 비밀번호 재설정 메일 요청 API
// POST /api/auth/forgot-password
// ------------------------------------
// 가입한 이메일로 "새 비밀번호 설정하기" 링크를 보냅니다. (링크는 30분간 유효)
// ====================================

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) return fail("이메일을 입력해주세요.", 400);

    const user = await findUserByEmail(email);

    // 가입되지 않은 이메일이어도 똑같이 "발송했다"고 답합니다.
    // (어떤 이메일이 가입되어 있는지 알아내는 것을 막기 위함)
    if (!user) {
      return ok(undefined, "비밀번호 재설정 링크를 이메일로 발송했습니다.");
    }

    const token = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail(email, user.name, token);

    return ok(undefined, "비밀번호 재설정 링크를 이메일로 발송했습니다.");
  } catch (error) {
    return serverError("비밀번호 재설정 요청", error);
  }
}
