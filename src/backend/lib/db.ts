import { PrismaClient } from "@prisma/client";

// ====================================
// Prisma 클라이언트 싱글톤 관리
// Next.js 개발 환경에서 핫 리로드 시 중복 연결 방지
// ====================================

// 전역 타입 선언 (개발 환경 싱글톤용)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 싱글톤 패턴으로 Prisma 클라이언트 생성
// 프로덕션: 매번 새 인스턴스 생성 불필요
// 개발: 핫 리로드 시 기존 연결 재사용
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// 개발 환경에서만 전역 변수에 저장 (중복 연결 방지)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
