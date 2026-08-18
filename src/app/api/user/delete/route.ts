import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/backend/middleware/auth";
import { prisma } from "@/backend/lib/db";
import { verifyUserPassword } from "@/backend/services/userService";
import { fail, serverError, MESSAGES } from "@/backend/lib/apiResponse";

// ====================================
// 회원탈퇴 API
// DELETE /api/user/delete
// ------------------------------------
// 실수로 탈퇴하는 것을 막기 위해 비밀번호를 한 번 더 확인합니다.
// 탈퇴하면 계정과 함께 그 계정이 작성한 기사도 모두 삭제되며 되돌릴 수 없습니다.
// ====================================

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) return fail(MESSAGES.loginRequired, 401);

    const { password } = await request.json();
    if (!password) return fail("비밀번호를 입력해주세요.", 400);

    // 본인 확인
    const isValid = await verifyUserPassword(user.userId, password);
    if (!isValid) return fail("비밀번호가 올바르지 않습니다.", 400);

    // 계정 삭제 (작성한 기사는 데이터베이스 설정에 따라 함께 삭제됨)
    await prisma.user.delete({ where: { id: user.userId } });

    const response = NextResponse.json({
      success: true,
      message: "회원탈퇴가 완료되었습니다.",
    });

    // 남아 있는 로그인 증명서(쿠키)도 즉시 삭제
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    return serverError("회원탈퇴", error);
  }
}
