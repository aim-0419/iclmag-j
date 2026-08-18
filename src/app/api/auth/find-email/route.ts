import { NextRequest } from "next/server";
import { prisma } from "@/backend/lib/db";
import { ok, fail, serverError, tooManyRequests } from "@/backend/lib/apiResponse";
import { limitByIp } from "@/backend/lib/rateLimit";

// ====================================
// 아이디(이메일) 찾기 API
// POST /api/auth/find-email
// ------------------------------------
// 가입할 때 쓴 이름으로 계정을 찾아 줍니다.
// 다만 이메일 전체를 그대로 보여 주면 개인정보가 노출되므로,
// 앞 3글자만 남기고 나머지는 *** 로 가려서 보여 줍니다.
//   예) hongkildong@gmail.com → hon********@gmail.com
// ====================================

/** 이메일 앞부분을 가려서 돌려줍니다. */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const visible = local.slice(0, 3);
  const hidden = "*".repeat(Math.max(local.length - 3, 2));
  return `${visible}${hidden}@${domain}`;
}

export async function POST(request: NextRequest) {
  try {
    // 흔한 이름을 계속 넣어 가입자 목록을 긁어모으는 것을 차단 (10분에 10번까지)
    const rate = limitByIp(request, "findEmail");
    if (!rate.allowed) return tooManyRequests(rate.retryAfterSec);

    const { name } = await request.json();

    if (!name || name.trim().length < 2) {
      return fail("이름을 2자 이상 입력해주세요.", 400);
    }

    const users = await prisma.user.findMany({
      where: { name: name.trim() },
      select: { email: true, createdAt: true },
    });

    if (users.length === 0) {
      return fail("해당 이름으로 가입된 계정이 없습니다.", 404);
    }

    const accounts = users.map((user) => ({
      email: maskEmail(user.email),
      createdAt: user.createdAt.toLocaleDateString("ko-KR"),
    }));

    return ok(accounts);
  } catch (error) {
    return serverError("아이디 찾기", error);
  }
}
