import { NextRequest, NextResponse } from "next/server";
import { verifyEmailCode } from "@/backend/services/verificationService";

// ====================================
// 이메일 인증 코드 확인 API
// POST /api/auth/verify-email
// 사용자가 입력한 6자리 코드를 검증
// ====================================

/**
 * 인증 코드 검증
 * 이메일 + 코드가 맞으면 emailVerified = true 처리
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "이메일과 인증 코드를 입력해주세요." },
        { status: 400 }
      );
    }

    const result = await verifyEmailCode(email, code.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("[인증 코드 확인 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
