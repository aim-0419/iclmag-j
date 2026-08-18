import { PrismaClient } from "@prisma/client";

// ====================================
// 데이터베이스 연결 담당 파일
// ------------------------------------
// 이 프로젝트는 Prisma 라는 도구를 통해 MySQL 데이터베이스와 대화합니다.
// 이 파일은 그 연결 통로(prisma)를 딱 하나만 만들어 두고,
// 다른 모든 파일이 그것을 같이 사용하도록 합니다.
//
// 왜 하나만 만드나요?
//  → 개발 중에는 코드를 고칠 때마다 화면이 자동으로 새로고침되는데,
//    그때마다 새 연결을 만들면 연결이 계속 쌓여서 데이터베이스가 느려집니다.
// ====================================

// 개발 환경에서 연결을 재사용하기 위한 전역 보관소
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * 데이터베이스 연결 통로
 * 다른 파일에서는 `import { prisma } from "@/backend/lib/db"` 로 가져다 씁니다.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // 개발 중에는 실행되는 쿼리를 콘솔에 보여주고, 실제 서비스에서는 오류만 기록
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// 개발 환경에서만 전역에 보관해 두어 새로고침 시 연결을 재사용
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
