import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/backend/middleware/auth";
import prisma from "@/backend/lib/db";
import bcrypt from "bcryptjs";

// ====================================
// 프로필 수정 API
// PUT /api/user/profile
// 로그인한 사용자의 이름 또는 비밀번호 변경
// ====================================

/**
 * 프로필 수정 처리
 * - name: 이름 변경 (2자 이상)
 * - currentPassword + newPassword: 비밀번호 변경
 */
export async function PUT(request: NextRequest) {
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
    const { name, currentPassword, newPassword } = body;

    const updateData: { name?: string; password?: string } = {};

    // 이름 변경 요청
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return NextResponse.json(
          { success: false, message: "이름은 최소 2자 이상이어야 합니다." },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    // 비밀번호 변경 요청
    if (newPassword !== undefined) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: "현재 비밀번호를 입력해주세요." },
          { status: 400 }
        );
      }
      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, message: "새 비밀번호는 최소 8자 이상이어야 합니다." },
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

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, message: "현재 비밀번호가 올바르지 않습니다." },
          { status: 400 }
        );
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    // 변경 사항이 없는 경우
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "변경할 정보가 없습니다." },
        { status: 400 }
      );
    }

    // 업데이트 실행
    const updatedUser = await prisma.user.update({
      where: { id: authResult.userId },
      data: updateData,
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({
      success: true,
      message: "프로필이 수정되었습니다.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("[프로필 수정 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
