import { prisma } from "@/backend/lib/db";
import { randomBytes } from "crypto";

// ====================================
// 비밀번호 재설정 토큰 서비스
// ====================================

/**
 * 비밀번호 재설정 토큰 생성 (30분 유효)
 */
export async function createPasswordResetToken(userId: number): Promise<string> {
  // 기존 토큰 삭제
  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30분

  await prisma.passwordResetToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

/**
 * 토큰 검증 후 userId 반환
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
 * 사용 완료된 토큰 삭제
 */
export async function deletePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({ where: { token } });
}
