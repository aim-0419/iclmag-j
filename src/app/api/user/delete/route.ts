import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/backend/middleware/auth";
import prisma from "@/backend/lib/db";
import bcrypt from "bcryptjs";

// ====================================
// 회원탈퇴 API
// DELETE /api/user/delete
// 비밀번호 확인 후 계정 삭제
// ====================================

/**
 * 회원탈퇴 처리
 * 비밀번호 재확인 후 계정 영구 삭제
 * 작성한 기사는 onDelete: Cascade로 함께 삭제됨
 */
export async function DELETE(request: NextRequest) {
  // 로그인 여부 확인
  const authResult = await requireAuth(request);
  if (!authResult) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, message: "비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 현재 비밀번호 확인
    const user = await prisma.user.findUnique({ where: { id: authResult.userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "비밀번호가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 계정 삭제 (기사는 onDelete: Cascade로 자동 삭제)
    await prisma.user.delete({ where: { id: authResult.userId } });

    // 응답 생성 후 쿠키 만료 처리
    const response = NextResponse.json({
      success: true,
      message: "회원탈퇴가 완료되었습니다.",
    });

    response.cookies.set("auth_token", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[회원탈퇴 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
