import { NextResponse } from "next/server";

// ====================================
// API 응답 형식 통일 담당 파일
// ------------------------------------
// 서버가 화면에 답을 돌려줄 때 항상 같은 모양을 쓰도록 모아 둔 도구입니다.
//
//   성공: { success: true,  message?, data? }
//   실패: { success: false, message,  errors? }
//
// 모양이 통일되어 있으면 화면 쪽 코드가 단순해지고,
// 같은 문구를 여러 파일에 반복해서 쓰지 않아도 됩니다.
// ====================================

/** 자주 쓰는 실패 안내 문구 모음 */
export const MESSAGES = {
  loginRequired: "로그인이 필요합니다.",
  adminOnly: "관리자만 사용할 수 있는 기능입니다.",
  serverError: "서버 오류가 발생했습니다.",
  invalidArticleId: "올바르지 않은 기사 ID입니다.",
  tooManyAttempts: "시도 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.",
  articleNotFound: "기사를 찾을 수 없습니다.",
  userNotFound: "사용자를 찾을 수 없습니다.",
} as const;

/** 성공 응답 만들기 */
export function ok<T>(data?: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, ...(message && { message }), ...(data !== undefined && { data }) }, { status });
}

/** 실패 응답 만들기 */
export function fail(message: string, status = 400, errors?: string[]) {
  return NextResponse.json({ success: false, message, ...(errors && { errors }) }, { status });
}

/**
 * 짧은 시간에 너무 많이 시도했을 때의 응답 만들기 (429)
 *
 * Retry-After 헤더에 "몇 초 뒤에 다시 시도하면 되는지"를 담아 보냅니다.
 *
 * @param retryAfterSec - 다시 시도 가능해질 때까지 남은 시간(초)
 */
export function tooManyRequests(retryAfterSec: number) {
  const minutes = Math.ceil(retryAfterSec / 60);
  return NextResponse.json(
    {
      success: false,
      message: `시도 횟수가 너무 많습니다. 약 ${minutes}분 후에 다시 시도해주세요.`,
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
  );
}

/**
 * 예상하지 못한 오류가 났을 때의 응답 만들기
 * 자세한 내용은 서버 기록(콘솔)에만 남기고,
 * 사용자에게는 내부 정보가 새지 않도록 일반적인 문구만 보여 줍니다.
 *
 * @param label - 서버 기록에 남길 상황 이름 (예: "기사 저장")
 */
export function serverError(label: string, error: unknown) {
  console.error(`[${label} 오류]`, error);
  return fail(MESSAGES.serverError, 500);
}
