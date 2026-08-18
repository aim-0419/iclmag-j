import { SignJWT, jwtVerify } from "jose";
import { JWT_SECRET, JWT_EXPIRES_IN } from "@/backend/lib/env";

// ====================================
// 로그인 증명서(JWT 토큰) 발급 · 검증
// ------------------------------------
// 로그인에 성공하면 서버가 "이 사람은 OOO 회원이 맞다"는 내용을 담은
// 위조 불가능한 증명서(토큰)를 발급합니다. 이후 요청마다 이 증명서를
// 확인해서 로그인 상태인지, 관리자인지 판단합니다.
//
// 증명서에는 서버만 아는 비밀 열쇠(JWT_SECRET)로 도장이 찍히기 때문에
// 사용자가 내용을 몰래 바꾸면 검증 단계에서 바로 걸러집니다.
//
// 비밀 열쇠가 안전한 값인지는 env.ts 에서 서버 시작 시 확인합니다.
// ====================================

/** 도장 찍는 데 쓰는 비밀 열쇠 (검증을 마친 값) */
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

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
 * @returns 도장이 찍힌 토큰 문자열
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()                      // 발급 시각 기록
    .setExpirationTime(JWT_EXPIRES_IN)  // 만료 시각 지정 (예: 7d = 7일 뒤)
    .sign(SECRET_KEY);
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
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      // 도장 방식을 HS256 으로 못 박습니다.
      // 이렇게 하지 않으면 "도장을 아예 찍지 않았다(alg: none)"고 우기는
      // 가짜 토큰을 통과시키는 공격에 당할 수 있습니다.
      algorithms: ["HS256"],
    });
    return payload as unknown as JWTPayload;
  } catch {
    // 토큰이 만료되었거나 위조된 경우
    return null;
  }
}
