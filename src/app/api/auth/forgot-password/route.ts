import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/backend/services/userService";
import { createPasswordResetToken } from "@/backend/services/passwordResetService";
import { sendPasswordResetEmail } from "@/backend/lib/email";

// ====================================
// 비밀번호 재설정 요청 API
// POST /api/auth/forgot-password
// ====================================

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

    // 보안상 가입 여부 외부 노출 안 함
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "이메일이 발송되었습니다.",
      });
    }

    const token = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail(email, user.name, token);

    return NextResponse.json({
      success: true,
      message: "비밀번호 재설정 링크를 이메일로 발송했습니다.",
    });
  } catch (error) {
    console.error("[비밀번호 재설정 요청 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
