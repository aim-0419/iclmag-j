import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";
import { verifyPasswordResetToken, deletePasswordResetToken } from "@/backend/services/passwordResetService";
import bcrypt from "bcryptjs";

// ====================================
// 비밀번호 재설정 API
// POST /api/auth/reset-password
// ====================================

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "올바르지 않은 요청입니다." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const userId = await verifyPasswordResetToken(token);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "유효하지 않거나 만료된 링크입니다." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await deletePasswordResetToken(token);

    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 변경되었습니다.",
    });
  } catch (error) {
    console.error("[비밀번호 재설정 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
