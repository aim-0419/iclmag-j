import { NextRequest } from "next/server";
import { requireAuth } from "@/backend/middleware/auth";
import { prisma } from "@/backend/lib/db";
import { verifyUserPassword, updateUserPassword } from "@/backend/services/userService";
import { ok, fail, serverError, MESSAGES } from "@/backend/lib/apiResponse";

// ====================================
// 내 정보 수정 API
// PUT /api/user/profile
// ------------------------------------
// 마이페이지에서 이름 또는 비밀번호를 바꿀 때 사용합니다.
//   이름 변경   → { name: "새 이름" }
//   비밀번호 변경 → { currentPassword: "현재 비밀번호", newPassword: "새 비밀번호" }
// 비밀번호를 바꿀 때는 반드시 현재 비밀번호로 본인 확인을 거칩니다.
// ====================================

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) return fail(MESSAGES.loginRequired, 401);

    const { name, currentPassword, newPassword } = await request.json();

    // ----- 비밀번호 변경 -----
    if (newPassword !== undefined) {
      if (!currentPassword) {
        return fail("현재 비밀번호를 입력해주세요.", 400);
      }
      if (newPassword.length < 8) {
        return fail("새 비밀번호는 최소 8자 이상이어야 합니다.", 400);
      }

      // 본인 확인
      const isValid = await verifyUserPassword(user.userId, currentPassword);
      if (!isValid) {
        return fail("현재 비밀번호가 올바르지 않습니다.", 400);
      }

      await updateUserPassword(user.userId, newPassword);
      return ok(
        { id: user.userId, email: user.email, name: user.name, role: user.role },
        "비밀번호가 변경되었습니다."
      );
    }

    // ----- 이름 변경 -----
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return fail("이름은 최소 2자 이상이어야 합니다.", 400);
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.userId },
        data: { name: name.trim() },
        select: { id: true, email: true, name: true, role: true },
      });

      return ok(updatedUser, "이름이 변경되었습니다.");
    }

    // 바꿀 내용이 하나도 없는 경우
    return fail("변경할 정보가 없습니다.", 400);
  } catch (error) {
    return serverError("내 정보 수정", error);
  }
}
