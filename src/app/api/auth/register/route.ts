import { NextRequest, NextResponse } from "next/server";
import { createUser, validateUserInput } from "@/backend/services/userService";
import { createVerificationToken } from "@/backend/services/verificationService";
import { sendVerificationEmail } from "@/backend/lib/email";

// ====================================
// 회원가입 API
// POST /api/auth/register
// 사용자 생성 후 이메일 인증 토큰 발급 및 발송
// ====================================

/**
 * 회원가입 요청 처리
 * 이름, 이메일, 비밀번호를 받아 새 사용자 생성
 * 가입 후 인증 이메일 자동 발송 (24시간 유효)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 서버 측 입력값 유효성 검증
    const errors = validateUserInput(email, password, name);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // 사용자 생성 (이메일 중복 확인 포함)
    const user = await createUser(email, password, name);

    // 이메일 인증 토큰 생성 (24시간 유효)
    const token = await createVerificationToken(user.id);

    // 인증 이메일 발송 (실패해도 가입은 완료 처리)
    try {
      await sendVerificationEmail(email, name, token);
    } catch (emailError) {
      console.error("[인증 메일 발송 실패]", emailError);
      // 이메일 발송 실패는 가입 자체를 막지 않음
    }

    return NextResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다. 이메일로 발송된 인증 코드를 입력해주세요.",
        data: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error: any) {
    // 이메일 중복 등 비즈니스 로직 에러
    if (error.message === "이미 사용 중인 이메일입니다.") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }

    console.error("[회원가입 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
