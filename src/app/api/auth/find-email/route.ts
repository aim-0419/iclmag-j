import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";

// ====================================
// 아이디(이메일) 찾기 API
// POST /api/auth/find-email
// ====================================

/**
 * 이름으로 가입된 이메일 조회
 * 보안상 이메일 일부만 마스킹하여 반환
 */
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "이름을 2자 이상 입력해주세요." },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: { name: name.trim() },
      select: { email: true, createdAt: true },
    });

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "해당 이름으로 가입된 계정이 없습니다." },
        { status: 404 }
      );
    }

    // 이메일 마스킹 처리 (앞 3자리 + **** + @ + 도메인)
    const maskedEmails = users.map((u) => {
      const [local, domain] = u.email.split("@");
      const visible = local.slice(0, 3);
      const masked = visible + "*".repeat(Math.max(local.length - 3, 2));
      return {
        email: `${masked}@${domain}`,
        createdAt: u.createdAt.toLocaleDateString("ko-KR"),
      };
    });

    return NextResponse.json({ success: true, accounts: maskedEmails });
  } catch (error) {
    console.error("[아이디 찾기 오류]", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
