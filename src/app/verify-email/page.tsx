"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type FormMessage = { type: "success" | "error"; text: string };

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);

  const updateCode = (value: string) => {
    setCode(value.replace(/\D/g, "").slice(0, 6));
  };

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

      setIsVerified(true);
      setMessage({ type: "success", text: "이메일 인증이 완료되었습니다." });
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
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
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">이메일 인증</h1>

          {message && (
            <div
              className={`text-sm rounded-lg px-4 py-3 mb-5 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {isVerified ? (
            <Link href="/login?verified=1" className="block w-full text-center btn-primary">
              로그인하러 가기
            </Link>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="가입한 이메일을 입력하세요"
                  required
                  className="input-field"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">인증 코드</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => updateCode(e.target.value)}
                  placeholder="000000"
                  required
                  inputMode="numeric"
                  pattern="\d{6}"
                  className="input-field text-center text-2xl font-bold tracking-[0.35em]"
                  autoComplete="one-time-code"
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full btn-primary">
                {isSubmitting ? "인증 확인 중..." : "인증 완료"}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending || !email.trim()}
                className="w-full btn-secondary"
              >
                {isResending ? "재발송 중..." : "인증 코드 다시 받기"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
