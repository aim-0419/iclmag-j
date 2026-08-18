import { prisma } from "@/backend/lib/db";
import { randomBytes } from "crypto";

// ====================================
// 비밀번호 재설정 링크 기능
// ------------------------------------
// 비밀번호를 잊은 사용자에게 "본인만 알 수 있는 긴 임시 열쇠(토큰)"가 담긴
// 링크를 메일로 보냅니다. 그 링크로 들어온 사람만 새 비밀번호를 정할 수 있고,
// 열쇠는 30분이 지나면 쓸 수 없게 됩니다.
// ====================================

/** 재설정 링크 유효 시간 (30분) */
const TOKEN_TTL_MS = 30 * 60 * 1000;

/**
 * 재설정용 임시 열쇠(토큰) 만들기
 * 기존에 발급한 열쇠는 지우고 새 것 하나만 유효하게 둡니다.
 *
 * @param userId - 대상 회원 번호
 * @returns 메일 링크에 포함할 토큰 문자열
 */
export async function createPasswordResetToken(userId: number): Promise<string> {
  // 추측이 사실상 불가능한 64자리 무작위 문자열
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.create({ data: { token, userId, expiresAt } }),
  ]);

  return token;
}

/**
 * 링크로 전달된 토큰이 유효한지 확인하기
 * 시간이 지난 토큰은 즉시 삭제합니다.
 *
 * @returns 유효하면 회원 번호, 아니면 null
 */
export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record) return null;

  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return null;
  }

  return record.userId;
}

/**
 * 사용을 마친 토큰 삭제하기 (같은 링크 재사용 방지)
 */
export async function deletePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({ where: { token } });
}
