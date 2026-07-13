import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "@/backend/lib/jwt";
import { findUserById } from "@/backend/services/userService";

// ====================================
// 인증 미들웨어
// API 요청 시 JWT 토큰을 검증하여 사용자 확인
// ====================================

/**
 * 요청에서 현재 로그인한 사용자 정보 추출
 * Authorization 헤더 또는 쿠키에서 토큰을 가져와 검증
 *
 * @param request - Next.js 요청 객체
 * @returns 로그인한 사용자 정보 또는 null (미로그인/토큰 만료)
 */
export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  // 1. 쿠키에서 토큰 추출 (웹 브라우저 요청)
  const cookieToken = request.cookies.get("auth_token")?.value;

  // 2. Authorization 헤더에서 토큰 추출 (API 요청)
  const headerToken = request.headers.get("Authorization")?.replace("Bearer ", "");

  // 쿠키 우선, 없으면 헤더에서 가져옴
  const token = cookieToken || headerToken;

  if (!token) return null;

  // 토큰 검증 후 사용자 정보 반환
  return await verifyToken(token);
}

/**
 * 인증된 사용자만 접근 가능한 API에서 사용
 * 토큰이 없거나 유효하지 않으면 null 반환
 *
 * @param request - Next.js 요청 객체
 * @returns 사용자 정보 또는 null
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload | null> {
  const tokenUser = await getAuthUser(request);
  if (!tokenUser) return null;

  const user = await findUserById(tokenUser.userId);
  if (!user) return null;

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/**
 * 관리자 권한 확인
 * 일반 사용자와 작성자는 기사 작성 불가
 *
 * @param user - JWT 페이로드의 사용자 정보
 * @returns 권한 있으면 true
 */
export function hasWritePermission(user: JWTPayload): boolean {
  return user.role === "ADMIN";
}

/**
 * 관리자 권한 확인
 *
 * @param user - JWT 페이로드의 사용자 정보
 * @returns 관리자면 true
 */
export function isAdmin(user: JWTPayload): boolean {
  return user.role === "ADMIN";
}
