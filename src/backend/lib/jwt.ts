import { SignJWT, jwtVerify } from "jose";

// ====================================
// 로그인 증명서(JWT 토큰) 발급 · 검증
// ------------------------------------
// 로그인에 성공하면 서버가 "이 사람은 OOO 회원이 맞다"는 내용을 담은
// 위조 불가능한 증명서(토큰)를 발급합니다. 이후 요청마다 이 증명서를
// 확인해서 로그인 상태인지, 관리자인지 판단합니다.
//
// 증명서는 서버만 아는 비밀키(JWT_SECRET)로 서명되기 때문에
// 사용자가 내용을 몰래 바꾸면 검증 단계에서 바로 걸러집니다.
// ====================================

// 토큰 서명에 사용할 비밀 키 (.env 파일의 JWT_SECRET 값)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-change-this"
);

// 토큰 유효 기간 (.env 의 JWT_EXPIRES_IN, 미설정 시 7일)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/** 토큰 안에 담기는 사용자 정보 */
export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

/**
 * 로그인 증명서(토큰) 발급
 * 로그인에 성공했을 때 호출합니다.
 *
 * @param payload - 토큰에 담을 사용자 정보
 * @returns 서명이 완료된 토큰 문자열
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()                      // 발급 시각 기록
    .setExpirationTime(JWT_EXPIRES_IN)  // 만료 시각 지정 (예: 7d = 7일 뒤)
    .sign(JWT_SECRET);
}

/**
 * 증명서(토큰) 검증
 * 위조되었거나 기간이 지난 토큰이면 null 을 돌려줍니다.
 *
 * @param token - 확인할 토큰 문자열
 * @returns 토큰에 담긴 사용자 정보, 실패 시 null
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    // 토큰이 만료되었거나 위조된 경우
    return null;
  }
}
