import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/backend/services/userService";
import { createVerificationToken } from "@/backend/services/verificationService";
import { sendVerificationEmail } from "@/backend/lib/email";

// ====================================
// 인증 코드 재발송 API
// POST /api/auth/resend-verification
// ====================================

/**
 * 이메일 인증 코드 재발송
 * 이미 인증된 계정이면 무시
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);

    // 보안상 사용자 존재 여부를 외부에 노출하지 않음
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true, message: "발송 완료" });
    }

    // 새 코드 발급 후 발송
    const code = await createVerificationToken(user.id);
    await sendVerificationEmail(email, user.name, code);

    return NextResponse.json({ success: true, message: "인증 코드를 재발송했습니다." });
  } catch (error) {
    console.error("[인증 코드 재발송 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
