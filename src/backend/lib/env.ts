// ====================================
// 환경변수 안전성 검사
// ------------------------------------
// 서버가 켜질 때 "보안에 꼭 필요한 값이 제대로 설정되어 있는지"를 확인합니다.
//
// 왜 필요한가요?
// 예전 코드에는 JWT_SECRET(로그인 증명서에 도장을 찍는 비밀 열쇠)이 없을 때
// 미리 정해 둔 문자열을 대신 쓰도록 되어 있었습니다.
// 그런데 그 문자열은 소스코드에 그대로 적혀 있었고, 소스코드는 GitHub에 공개되어 있습니다.
// 즉 열쇠를 잃어버린 게 아니라 "열쇠 복사본을 대문 앞에 붙여 둔" 상태였습니다.
// 누구나 그 열쇠로 "나는 관리자다"라는 가짜 증명서를 만들어
// 기사를 마음대로 삭제할 수 있었습니다.
//
// 그래서 이제는 열쇠가 없거나, 공개된 예시값 그대로라면
// 조용히 넘어가지 않고 즉시 오류를 내서 알립니다. (안전하게 멈추는 방식)
// ====================================

/**
 * 절대 쓰면 안 되는 JWT 비밀 열쇠 목록
 * 소스코드나 예시 파일에 적혀 있어 외부에 공개된 값들입니다.
 */
const PUBLICLY_KNOWN_SECRETS = [
  "fallback-secret-key-change-this",                    // 예전 소스코드에 있던 기본값
  "your-super-secret-jwt-key-change-this-in-production", // .env.example 예시값
  "secret",
  "changeme",
];

/** 비밀 열쇠 최소 길이 */
const MIN_SECRET_LENGTH = 32;

/** 설정 방법 안내 (오류 메시지에 함께 출력) */
const HOW_TO_FIX = `
  해결 방법
  ------------------------------------
  1) 아래 명령으로 무작위 열쇠를 하나 만듭니다.
       node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  2) 서버의 .env.local 파일에 붙여넣습니다.
       JWT_SECRET="1번에서 만든 값"
  3) 서버를 다시 시작합니다.
       pm2 restart iclmag-j

  주의: 열쇠를 바꾸면 기존 로그인은 모두 풀립니다. (다시 로그인하면 됩니다)
`;

/**
 * JWT 비밀 열쇠를 가져오면서 안전한 값인지 확인합니다.
 * 문제가 있으면 서버를 그대로 두지 않고 오류를 발생시킵니다.
 */
function readJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  // 1) 아예 설정하지 않은 경우
  if (!secret) {
    throw new Error(
      `[보안 설정 오류] JWT_SECRET 환경변수가 설정되지 않았습니다.\n` +
        `로그인 기능을 안전하게 쓸 수 없어 서버를 시작하지 않습니다.\n${HOW_TO_FIX}`
    );
  }

  // 2) 외부에 공개된 예시값을 그대로 쓴 경우 (가장 위험)
  if (PUBLICLY_KNOWN_SECRETS.includes(secret)) {
    throw new Error(
      `[보안 설정 오류] JWT_SECRET 이 공개된 예시값 그대로입니다.\n` +
        `이 값은 소스코드에 적혀 있어 누구나 알 수 있으므로,\n` +
        `제3자가 관리자 권한을 위조할 수 있습니다. 반드시 교체해야 합니다.\n${HOW_TO_FIX}`
    );
  }

  // 3) 너무 짧은 경우
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `[보안 설정 오류] JWT_SECRET 이 너무 짧습니다. (현재 ${secret.length}자 / 최소 ${MIN_SECRET_LENGTH}자)\n` +
        `짧은 열쇠는 추측당할 수 있습니다.\n${HOW_TO_FIX}`
    );
  }

  return secret;
}

/** 검증을 마친 JWT 비밀 열쇠 */
export const JWT_SECRET = readJwtSecret();

/** 로그인 유지 기간 (.env 의 JWT_EXPIRES_IN, 기본 7일) */
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/** 실제 서비스 중인지 여부 (개발 중이면 false) */
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * 로그인 쿠키에 보안 옵션(secure)을 켤지 여부
 *
 * secure 를 켜면 https 연결에서만 쿠키가 오갑니다.
 * 다만 http 로 접속하는 환경에서 이 옵션을 켜면 쿠키가 아예 저장되지 않아
 * 로그인 자체가 되지 않습니다.
 * 그래서 실제 사이트 주소(NEXT_PUBLIC_APP_URL)가 https 일 때만 켭니다.
 */
export const USE_SECURE_COOKIE =
  process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") === true;

// 실제 서비스인데 아직 https 를 쓰지 않는다면 서버 기록에 경고를 남깁니다.
// (http 로는 로그인 정보가 암호화되지 않은 채 오가므로 도메인 + SSL 적용을 권장합니다)
if (IS_PRODUCTION && !USE_SECURE_COOKIE) {
  console.warn(
    "[보안 경고] 사이트가 https 가 아닙니다. 로그인 쿠키에 secure 옵션을 켤 수 없습니다.\n" +
      "  도메인 연결 후 .env.local 의 NEXT_PUBLIC_APP_URL 을 https 주소로 바꿔 주세요."
  );
}
