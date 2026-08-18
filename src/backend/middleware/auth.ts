import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "@/backend/lib/jwt";
import { findUserById } from "@/backend/services/userService";

// ====================================
// 요청자 신원 확인 담당 파일
// ------------------------------------
// 서버로 들어온 요청이 "로그인한 사람의 요청인지", "관리자인지"를
// 판단해 주는 공통 기능들입니다.
//
// 확인 순서
//  1) 브라우저가 함께 보낸 쿠키(auth_token)에서 로그인 증명서를 꺼냅니다.
//  2) 증명서가 위조·만료되지 않았는지 검사합니다.
//  3) (requireAuth 의 경우) 데이터베이스에서 실제 계정이 살아 있는지,
//     권한이 바뀌지는 않았는지 최신 정보로 다시 확인합니다.
// ====================================

/**
 * 요청에서 로그인한 사용자 정보를 꺼냅니다. (증명서만 확인, 빠름)
 * 로그인 여부만 가볍게 알고 싶을 때 사용합니다.
 *
 * @returns 사용자 정보, 비로그인·만료 시 null
 */
export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  // 브라우저 요청은 쿠키에, 외부 프로그램 요청은 Authorization 헤더에 토큰을 담습니다.
  const cookieToken = request.cookies.get("auth_token")?.value;
  const headerToken = request.headers.get("Authorization")?.replace("Bearer ", "");
  const token = cookieToken || headerToken;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * 로그인이 반드시 필요한 기능에서 사용합니다. (데이터베이스 최신 정보까지 확인)
 * 관리자로 승격되거나 탈퇴한 경우가 즉시 반영됩니다.
 *
 * @returns 최신 사용자 정보, 비로그인·탈퇴 시 null
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
 * 관리자 여부 확인
 * 기사 작성·수정·삭제와 이미지 업로드는 관리자만 할 수 있습니다.
 */
export function isAdmin(user: JWTPayload): boolean {
  return user.role === "ADMIN";
}
