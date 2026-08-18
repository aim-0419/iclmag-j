import { prisma } from "@/backend/lib/db";

// ====================================
// 이메일 인증 코드 기능 (6자리 숫자)
// ------------------------------------
// 회원가입한 이메일이 실제 본인 것인지 확인하기 위해
// 6자리 숫자 코드를 메일로 보내고, 사용자가 그 코드를 입력하면
// "이메일 인증 완료" 표시를 남깁니다.
// 코드는 10분이 지나면 자동으로 사용할 수 없게 됩니다.
// ====================================

/** 인증 코드 유효 시간 (10분) */
const CODE_TTL_MS = 10 * 60 * 1000;

/** 6자리 랜덤 숫자 코드 만들기 (100000 ~ 999999) */
function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * 인증 코드를 새로 만들어 저장하기
 * 이전에 발급한 코드가 있으면 지우고 새 코드 하나만 남깁니다.
 *
 * @param userId - 대상 회원 번호
 * @returns 메일로 보낼 6자리 코드
 */
export async function createVerificationToken(userId: number): Promise<string> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  // 이전 코드 삭제와 새 코드 저장을 한 묶음으로 처리
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { userId } }),
    prisma.verificationToken.create({ data: { token: code, userId, expiresAt } }),
  ]);

  return code;
}

/**
 * 사용자가 입력한 코드가 맞는지 확인하고 인증 완료 처리하기
 *
 * @param email - 가입한 이메일
 * @param code  - 사용자가 입력한 6자리 코드
 * @returns 성공 여부와 화면에 보여줄 안내 문구
 */
export async function verifyEmailCode(
  email: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { verificationTokens: true },
  });

  if (!user) {
    return { success: false, message: "존재하지 않는 계정입니다." };
  }

  // 이미 인증을 마친 계정
  if (user.emailVerified) {
    return { success: true, message: "이미 인증된 계정입니다." };
  }

  const record = user.verificationTokens[0];
  if (!record) {
    return { success: false, message: "인증 코드가 없습니다. 다시 요청해주세요." };
  }

  // 발급 후 10분이 지난 경우
  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
    return { success: false, message: "인증 코드가 만료되었습니다. 다시 요청해주세요." };
  }

  if (record.token !== code) {
    return { success: false, message: "인증 코드가 올바르지 않습니다." };
  }

  // 인증 완료 표시 + 사용한 코드 삭제를 한 묶음으로 처리
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } }),
    prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
  ]);

  return { success: true, message: "이메일 인증이 완료되었습니다." };
}
