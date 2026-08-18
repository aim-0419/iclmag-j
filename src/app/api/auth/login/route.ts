import { NextRequest, NextResponse } from "next/server";
import { validateLogin } from "@/backend/services/userService";
import { signToken } from "@/backend/lib/jwt";
import { fail, serverError, tooManyRequests } from "@/backend/lib/apiResponse";
import { limitByIp, resetRateLimit, getClientKey } from "@/backend/lib/rateLimit";
import { USE_SECURE_COOKIE } from "@/backend/lib/env";

// ====================================
// 로그인 API
// POST /api/auth/login
// ------------------------------------
// 아이디(또는 이메일) + 비밀번호를 확인하고, 맞으면 로그인 증명서(토큰)를
// 브라우저 쿠키에 저장합니다. 이 쿠키는 자바스크립트로 읽을 수 없게(httpOnly)
// 설정되어 있어 악성 스크립트가 훔쳐갈 수 없습니다.
// ====================================

/** 로그인 유지 기간 (7일) */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  try {
    // 0) 같은 곳에서 비밀번호를 반복해서 찍어 보는 공격 차단 (10분에 10번까지)
    const rate = limitByIp(request, "login");
    if (!rate.allowed) return tooManyRequests(rate.retryAfterSec);

    const { email, password } = await request.json();

    if (!email || !password) {
      return fail("이메일과 비밀번호를 입력해주세요.", 400);
    }

    // 1) 아이디·비밀번호 확인
    const user = await validateLogin(email, password);
    if (!user) {
      // 어느 쪽이 틀렸는지 알려주지 않습니다 (계정 추측 방지)
      return fail("이메일 또는 비밀번호가 올바르지 않습니다.", 401);
    }

    // 2) 이메일 인증을 마쳤는지 확인 (미인증 계정은 로그인 차단)
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "이메일 인증이 필요합니다. 가입 시 발송된 인증 메일을 확인해주세요.",
          code: "EMAIL_NOT_VERIFIED", // 화면에서 "인증하러 가기" 링크를 띄우는 표시
        },
        { status: 403 }
      );
    }

    // 로그인에 성공했으므로 그동안 쌓인 실패 횟수를 지웁니다.
    resetRateLimit(`login:${getClientKey(request)}`);

    // 3) 로그인 증명서 발급
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "로그인되었습니다.",
      data: { userId: user.id, email: user.email, name: user.name, role: user.role },
    });

    // 4) 증명서를 쿠키에 저장
    //    secure 는 https 주소일 때만 켭니다 (http 개발 환경에서는 쿠키가 저장되지 않기 때문)
    response.cookies.set("auth_token", token, {
      httpOnly: true, // 자바스크립트에서 접근 불가 (탈취 방지)
      secure: USE_SECURE_COOKIE, // https 사이트에서만 켜짐 (env.ts 에서 판단)
      sameSite: "lax", // 다른 사이트에서의 위조 요청 방지
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    return serverError("로그인", error);
  }
}
