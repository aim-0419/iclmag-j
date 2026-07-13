"use client";

import { useState } from "react";
import Link from "next/link";

type RegisterStep = "form" | "verify" | "done";
type FormMessage = { type: "success" | "error"; text: string };

export default function RegisterPage() {
  const [step, setStep] = useState<RegisterStep>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== passwordConfirm) {
      setMessage({ type: "error", text: "비밀번호 확인이 일치하지 않습니다." });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        const text = data.errors?.join("\n") || data.message || "회원가입에 실패했습니다.";
        setMessage({ type: "error", text });
        return;
      }

      setStep("verify");
      setMessage({
        type: "success",
        text: "회원가입이 완료되었습니다. 이메일로 받은 인증 코드를 입력해주세요.",
      });
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
    } finally {
      setIsSubmitting(false);
    }
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

      setStep("done");
      setMessage({ type: "success", text: "이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다." });
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

  const updateCode = (value: string) => {
    setCode(value.replace(/\D/g, "").slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-accent font-black text-3xl">ICL</span>
            <span className="font-light text-2xl text-gray-700">MAG-J</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">계정을 만들고 매거진을 이용하세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {step === "form" ? "회원가입" : step === "verify" ? "이메일 인증" : "가입 완료"}
          </h1>

          {message && (
            <div
              className={`whitespace-pre-line text-sm rounded-lg px-4 py-3 mb-5 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  required
                  minLength={2}
                  maxLength={50}
                  className="input-field"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  required
                  className="input-field"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8자 이상 입력하세요"
                  required
                  minLength={8}
                  className="input-field"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  minLength={8}
                  className="input-field"
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full btn-primary mt-2">
                {isSubmitting ? "가입 처리 중..." : "회원가입"}
              </button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-gray-500 leading-6">
                {email} 주소로 발송된 6자리 인증 코드를 입력해주세요.
              </p>

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
                disabled={isResending}
                className="w-full btn-secondary"
              >
                {isResending ? "재발송 중..." : "인증 코드 다시 받기"}
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="space-y-4">
              <Link href="/login?verified=1" className="block w-full text-center btn-primary">
                로그인하러 가기
              </Link>
            </div>
          )}

          <div className="text-center mt-6 text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
