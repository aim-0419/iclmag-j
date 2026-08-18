import { NextRequest } from "next/server";

// ====================================
// 반복 시도 차단 (무차별 대입 공격 방어)
// ------------------------------------
// 왜 필요한가요?
// 로그인 화면에 비밀번호를 자동으로 초당 수백 번씩 넣어 보는 프로그램이 있습니다.
// 아무 제한이 없으면 언젠가는 비밀번호가 뚫립니다.
// 이메일 인증코드도 마찬가지입니다. 6자리 숫자는 100만 가지뿐이라
// 제한이 없으면 기계가 금방 맞춰 버립니다.
//
// 그래서 "같은 곳에서 정해진 시간 안에 몇 번까지만 시도할 수 있다"는
// 제한을 걸어 둡니다. 예: 로그인은 10분에 10번까지.
//
// [알아두실 점]
// 시도 기록을 서버 메모리에 보관하므로, 서버를 다시 시작하면 기록이 초기화됩니다.
// 서버를 여러 대로 늘릴 경우에는 Redis 같은 공용 저장소로 옮겨야 합니다.
// 지금처럼 서버 한 대로 운영하는 규모에서는 충분히 효과가 있습니다.
// ====================================

/** 시도 기록 한 건 */
interface AttemptRecord {
  count: number;      // 시도 횟수
  resetAt: number;    // 이 시각이 지나면 횟수가 0으로 초기화됨
}

/** 시도 기록 보관소 (열쇠: "기능이름:접속자") */
const attempts = new Map<string, AttemptRecord>();

/** 기록이 무한정 쌓이지 않도록 정리하는 주기 (10분) */
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

/** 시간이 지난 기록을 지웁니다. (메모리 낭비 방지) */
function cleanupExpired(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  for (const [key, record] of attempts) {
    if (record.resetAt <= now) attempts.delete(key);
  }
  lastCleanup = now;
}

/**
 * 요청을 보낸 곳을 구분할 값(주로 IP 주소)을 알아냅니다.
 * 서버 앞에 nginx 같은 중계 서버가 있으면 원래 접속자 IP가
 * x-forwarded-for 헤더에 담겨 옵니다.
 */
export function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return request.headers.get("x-real-ip") || "unknown";
}

/** 제한에 걸렸는지 여부와, 얼마나 기다려야 하는지 */
export interface RateLimitResult {
  allowed: boolean;      // 시도해도 되는지
  retryAfterSec: number; // 막혔을 때 몇 초 뒤에 다시 시도 가능한지
}

/**
 * 시도 횟수를 1 올리고, 제한을 넘었는지 확인합니다.
 *
 * @param key      - 구분값 (예: "login:1.2.3.4")
 * @param limit    - 허용 횟수
 * @param windowMs - 기준 시간 (밀리초). 이 시간이 지나면 횟수가 초기화됩니다.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  cleanupExpired(now);

  const record = attempts.get(key);

  // 첫 시도이거나, 기준 시간이 지나 초기화된 경우
  if (!record || record.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  // 이미 허용 횟수를 다 쓴 경우
  if (record.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    };
  }

  record.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

/**
 * 로그인 성공처럼 "정상 이용"이 확인되면 그동안의 시도 횟수를 지웁니다.
 * 비밀번호를 몇 번 틀렸다가 제대로 로그인한 사용자가
 * 계속 제한에 걸리는 일을 막아 줍니다.
 */
export function resetRateLimit(key: string) {
  attempts.delete(key);
}

/**
 * 기능별 제한 기준
 * (횟수 / 기준 시간)
 */
export const RATE_LIMITS = {
  /** 로그인: 10분에 10번 */
  login: { limit: 10, windowMs: 10 * 60 * 1000 },
  /** 이메일 인증코드 확인: 10분에 10번 (6자리 숫자 추측 방지) */
  verifyEmail: { limit: 10, windowMs: 10 * 60 * 1000 },
  /** 메일 발송 요청(인증코드 재발송·비밀번호 찾기): 10분에 5번 (메일 폭탄 방지) */
  sendMail: { limit: 5, windowMs: 10 * 60 * 1000 },
  /** 아이디 찾기: 10분에 10번 (가입자 이름 무작위 조회 방지) */
  findEmail: { limit: 10, windowMs: 10 * 60 * 1000 },
  /** 회원가입: 1시간에 5번 (자동 가입 프로그램 방지) */
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  /** 비밀번호 재설정 실행: 10분에 10번 */
  resetPassword: { limit: 10, windowMs: 10 * 60 * 1000 },
} as const;

/**
 * 위 기준을 적용해 한 번에 확인합니다.
 *
 * @param request - 들어온 요청 (접속자 구분용)
 * @param action  - RATE_LIMITS 에 정의된 기능 이름
 */
export function limitByIp(request: NextRequest, action: keyof typeof RATE_LIMITS): RateLimitResult {
  const { limit, windowMs } = RATE_LIMITS[action];
  return checkRateLimit(`${action}:${getClientKey(request)}`, limit, windowMs);
}
