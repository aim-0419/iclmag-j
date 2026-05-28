import prisma from "@/backend/lib/db";

// ====================================
// 이메일 인증 코드 관련 비즈니스 로직
// 6자리 숫자 코드로 인증 처리
// ====================================

/**
 * 6자리 랜덤 숫자 인증 코드 생성
 */
function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * 이메일 인증 코드 생성 및 저장
 * 기존 코드가 있으면 삭제 후 새로 발급
 * 유효 시간: 10분
 *
 * @param userId - 대상 사용자 ID
 * @returns 생성된 6자리 코드
 */
export async function createVerificationToken(userId: number): Promise<string> {
  // 기존 코드 삭제 (재발급 처리)
  await prisma.verificationToken.deleteMany({ where: { userId } });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후

  await prisma.verificationToken.create({
    data: { token: code, userId, expiresAt },
  });

  return code;
}

/**
 * 인증 코드 검증 후 이메일 인증 처리
 * 이메일 + 코드가 모두 맞아야 인증 완료
 *
 * @param email - 사용자 이메일
 * @param code  - 입력한 6자리 코드
 * @returns 성공 여부와 메시지
 */
export async function verifyEmailCode(
  email: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  // 이메일로 사용자 조회
  const user = await prisma.user.findUnique({
    where: { email },
    include: { verificationTokens: true },
  });

  if (!user) {
    return { success: false, message: "존재하지 않는 계정입니다." };
  }

  // 이미 인증된 계정
  if (user.emailVerified) {
    return { success: true, message: "이미 인증된 계정입니다." };
  }

  // 발급된 코드가 없는 경우
  const record = user.verificationTokens[0];
  if (!record) {
    return { success: false, message: "인증 코드가 없습니다. 다시 요청해주세요." };
  }

  // 만료 여부 확인
  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
    return { success: false, message: "인증 코드가 만료되었습니다. 다시 요청해주세요." };
  }

  // 코드 일치 여부 확인
  if (record.token !== code) {
    return { success: false, message: "인증 코드가 올바르지 않습니다." };
  }

  // 인증 완료 처리 (트랜잭션)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    }),
    prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
  ]);

  return { success: true, message: "이메일 인증이 완료되었습니다." };
}
