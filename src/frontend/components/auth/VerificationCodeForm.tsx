"use client";

import { useState } from "react";
import FormMessage, { type Message } from "./FormMessage";

// ====================================
// 이메일 인증 코드 입력 폼
// ------------------------------------
// 메일로 받은 6자리 숫자를 입력해 본인 확인을 마치는 화면 조각입니다.
// 회원가입 마지막 단계와 별도의 이메일 인증 화면에서 똑같이 쓰이므로
// 한 곳에 만들어 두고 두 화면이 함께 사용합니다.
//
// 담당하는 일
//   1) 숫자만 6자리까지 입력받기 (문자를 눌러도 무시)
//   2) 인증 확인 요청 보내기
//   3) 코드가 오지 않았을 때 다시 받기 요청 보내기
// ====================================

interface VerificationCodeFormProps {
  /** 인증할 이메일 주소 */
  email: string;
  /** 인증이 완료되었을 때 실행할 동작 */
  onVerified: () => void;
  /** 입력창 위에 보여 줄 안내 문구 (선택) */
  description?: React.ReactNode;
}

export default function VerificationCodeForm({
  email,
  onVerified,
  description,
}: VerificationCodeFormProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  /** 숫자가 아닌 글자는 지우고 최대 6자리까지만 받습니다. */
  const updateCode = (value: string) => {
    setCode(value.replace(/\D/g, "").slice(0, 6));
  };

  /** 입력한 코드가 맞는지 서버에 확인 요청 */
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (code.length !== 6) {
      setMessage({ type: "error", text: "6자리 인증 코드를 입력해주세요." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "이메일 인증에 실패했습니다." });
        return;
      }

      onVerified();
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
    } finally {
      setIsSubmitting(false);
    }
  };

  /** 코드를 못 받았거나 만료되었을 때 다시 보내 달라고 요청 */
  const handleResend = async () => {
    setMessage(null);
    setIsResending(true);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "인증 코드 재발송에 실패했습니다." });
        return;
      }

      setMessage({ type: "success", text: "인증 코드를 다시 발송했습니다." });
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <FormMessage message={message} />

      {description}

      <div>
        <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">
          인증 코드
        </label>
        <input
          id="verification-code"
          type="text"
          value={code}
          onChange={(e) => updateCode(e.target.value)}
          placeholder="000000"
          required
          inputMode="numeric"          // 휴대폰에서 숫자 자판이 바로 뜨게 함
          autoComplete="one-time-code" // 문자로 온 인증번호 자동 채우기 지원
          className="input-field text-center text-2xl font-bold tracking-[0.35em]"
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full btn-primary">
        {isSubmitting ? "인증 확인 중..." : "인증 완료"}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={isResending || !email.trim()}
        className="w-full btn-secondary"
      >
        {isResending ? "재발송 중..." : "인증 코드 다시 받기"}
      </button>
    </form>
  );
}
