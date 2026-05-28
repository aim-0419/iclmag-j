import nodemailer from "nodemailer";

// ====================================
// 이메일 발송 유틸리티
// nodemailer + Gmail SMTP 사용
// ====================================

/**
 * nodemailer 트랜스포터 생성 (싱글톤)
 * .env.local의 EMAIL_* 환경변수 사용
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true, // SSL (port 465)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * 이메일 인증 코드 발송
 * 회원가입 직후 호출하여 6자리 숫자 코드를 전송
 *
 * @param to   - 수신자 이메일
 * @param name - 수신자 이름
 * @param code - 6자리 숫자 인증 코드
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  code: string
) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "이끌림필라테스매거진 <noreply@example.com>",
    to,
    subject: "[이끌림필라테스매거진] 이메일 인증 코드",
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 20px; font-weight: bold; color: #0a0a0a; margin: 0;">
            이끌림필라테스매거진
          </h1>
        </div>

        <h2 style="font-size: 17px; font-weight: 600; color: #111; margin-bottom: 10px;">
          안녕하세요, ${name}님!
        </h2>
        <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 28px;">
          아래 인증 코드를 회원가입 화면에 입력해주세요.<br/>
          코드는 <strong>10분</strong> 동안 유효합니다.
        </p>

        <!-- 인증 코드 박스 -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: #f5f5f5; border-radius: 12px; padding: 20px 40px;">
            <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #0a0a0a; font-family: monospace;">
              ${code}
            </span>
          </div>
        </div>

        <p style="font-size: 12px; color: #aaa; line-height: 1.6; text-align: center;">
          본인이 요청하지 않은 경우 이 메일을 무시해주세요.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="font-size: 11px; color: #bbb; text-align: center;">
          본 메일은 발신 전용입니다. 문의: 062-671-8650<br/>
          COPYRIGHT(C) 이끌림필라테스매거진. ALL RIGHTS RESERVED.
        </p>
      </div>
    `,
  });
}

/**
 * 비밀번호 재설정 링크 발송
 *
 * @param to    - 수신자 이메일
 * @param name  - 수신자 이름
 * @param token - 재설정 토큰
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "이끌림필라테스매거진 <noreply@example.com>",
    to,
    subject: "[이끌림필라테스매거진] 비밀번호 재설정",
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 20px; font-weight: bold; color: #0a0a0a; margin: 0;">
            이끌림필라테스매거진
          </h1>
        </div>

        <h2 style="font-size: 17px; font-weight: 600; color: #111; margin-bottom: 10px;">
          안녕하세요, ${name}님!
        </h2>
        <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 28px;">
          비밀번호 재설정 요청이 접수되었습니다.<br/>
          아래 버튼을 클릭하여 새 비밀번호를 설정해주세요.<br/>
          링크는 <strong>30분</strong> 동안 유효합니다.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${resetUrl}"
            style="display: inline-block; background: #c8102e; color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none;">
            비밀번호 재설정하기
          </a>
        </div>

        <p style="font-size: 12px; color: #aaa; line-height: 1.6; text-align: center;">
          본인이 요청하지 않은 경우 이 메일을 무시해주세요.<br/>
          링크: ${resetUrl}
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="font-size: 11px; color: #bbb; text-align: center;">
          본 메일은 발신 전용입니다. 문의: 062-671-8650<br/>
          COPYRIGHT(C) 이끌림필라테스매거진. ALL RIGHTS RESERVED.
        </p>
      </div>
    `,
  });
}
