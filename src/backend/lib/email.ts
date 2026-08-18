import nodemailer from "nodemailer";
import { SITE } from "@/constants/site";

// ====================================
// 안내 메일 발송 담당 파일
// ------------------------------------
// 회원가입 인증 코드, 비밀번호 재설정 링크를 사용자 메일로 보냅니다.
// 실제 발송에는 Gmail 같은 메일 서버(SMTP)를 사용하며,
// 계정 정보는 .env.local 파일의 EMAIL_ 로 시작하는 값들로 설정합니다.
// ====================================

/**
 * 메일 발송기 (한 번만 만들어 재사용)
 * .env.local 에 EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS 설정 필요
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true, // 암호화 연결 사용 (465 포트)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/** 보내는 사람 표시 이름 */
const FROM = process.env.EMAIL_FROM || `${SITE.name} <noreply@example.com>`;

/**
 * 모든 안내 메일에 공통으로 쓰이는 디자인 틀
 * 상단 매체명 → 인사말 → 본문 → 하단 안내 순서로 구성됩니다.
 *
 * @param name - 받는 사람 이름
 * @param body - 가운데에 들어갈 내용 (HTML)
 */
function renderEmailLayout(name: string, body: string): string {
  return `
    <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 20px; font-weight: bold; color: #0a0a0a; margin: 0;">${SITE.name}</h1>
      </div>

      <h2 style="font-size: 17px; font-weight: 600; color: #111; margin-bottom: 10px;">
        안녕하세요, ${name}님!
      </h2>

      ${body}

      <p style="font-size: 12px; color: #aaa; line-height: 1.6; text-align: center;">
        본인이 요청하지 않은 경우 이 메일을 무시해주세요.
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
      <p style="font-size: 11px; color: #bbb; text-align: center;">
        본 메일은 발신 전용입니다. 문의: ${SITE.tel}<br/>
        ${SITE.copyright}
      </p>
    </div>
  `;
}

/**
 * 회원가입 인증 코드 메일 보내기
 * 회원가입 직후 호출되며, 6자리 숫자 코드를 크게 표시합니다.
 *
 * @param to   - 받는 사람 이메일
 * @param name - 받는 사람 이름
 * @param code - 6자리 인증 코드
 */
export async function sendVerificationEmail(to: string, name: string, code: string) {
  const body = `
    <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 28px;">
      아래 인증 코드를 회원가입 화면에 입력해주세요.<br/>
      코드는 <strong>10분</strong> 동안 유효합니다.
    </p>

    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: #f5f5f5; border-radius: 12px; padding: 20px 40px;">
        <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #0a0a0a; font-family: monospace;">${code}</span>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `[${SITE.name}] 이메일 인증 코드`,
    html: renderEmailLayout(name, body),
  });
}

/**
 * 비밀번호 재설정 링크 메일 보내기
 *
 * @param to    - 받는 사람 이메일
 * @param name  - 받는 사람 이름
 * @param token - 재설정용 임시 열쇠 (링크에 포함됨)
 */
export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const body = `
    <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 28px;">
      비밀번호 재설정 요청이 접수되었습니다.<br/>
      아래 버튼을 클릭하여 새 비밀번호를 설정해주세요.<br/>
      링크는 <strong>30분</strong> 동안 유효합니다.
    </p>

    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${resetUrl}" style="display: inline-block; background: #c8102e; color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none;">
        비밀번호 재설정하기
      </a>
    </div>

    <p style="font-size: 12px; color: #aaa; line-height: 1.6; text-align: center; word-break: break-all;">
      버튼이 눌리지 않으면 아래 주소를 복사해 브라우저에 붙여넣어 주세요.<br/>${resetUrl}
    </p>
  `;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `[${SITE.name}] 비밀번호 재설정`,
    html: renderEmailLayout(name, body),
  });
}
