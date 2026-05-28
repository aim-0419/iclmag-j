import { SignJWT, jwtVerify } from "jose";

// ====================================
// JWT 토큰 유틸리티
// 로그인 시 토큰 발급, 요청 시 토큰 검증
// ====================================

// JWT 서명에 사용할 비밀 키 (환경변수에서 가져옴)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-change-this"
);

// JWT 페이로드 타입 정의
export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

/**
 * JWT 토큰 생성
 * 로그인 성공 시 사용자 정보를 담은 토큰 발급
 *
 * @param payload - 토큰에 담을 사용자 정보
 * @returns 서명된 JWT 토큰 문자열
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  // 만료 시간 파싱 (예: "7d" → 7일, "24h" → 24시간)
  const expirationTime = parseExpiresIn(expiresIn);

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()                              // 발급 시간 설정
    .setExpirationTime(expirationTime)          // 만료 시간 설정
    .sign(JWT_SECRET);

  return token;
}

/**
 * JWT 토큰 검증
 * 요청 헤더나 쿠키의 토큰을 검증하고 사용자 정보 반환
 *
 * @param token - 검증할 JWT 토큰
 * @returns 토큰 내 사용자 정보 또는 null (검증 실패 시)
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    // 토큰이 만료되었거나 유효하지 않은 경우
    return null;
  }
}

/**
 * 만료 시간 문자열 파싱
 * "7d", "24h", "60m" 형식을 파싱하여 초 단위로 반환
 *
 * @param expiresIn - 만료 시간 문자열
 * @returns 현재 시간 기준 만료 시각
 */
function parseExpiresIn(expiresIn: string): string {
  // jose 라이브러리 형식에 맞게 그대로 반환
  return expiresIn;
}
