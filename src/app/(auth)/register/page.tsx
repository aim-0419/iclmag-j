"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/frontend/components/auth/AuthCard";
import FormMessage, { type Message } from "@/frontend/components/auth/FormMessage";
import VerificationCodeForm from "@/frontend/components/auth/VerificationCodeForm";

// ====================================
// 회원가입 화면
// 주소: /register
// ------------------------------------
// 세 단계로 진행됩니다.
//   1단계(form)   : 이름·이메일·비밀번호 입력 → 계정 생성 + 인증 메일 발송
//   2단계(verify) : 메일로 받은 6자리 코드 입력 → 이메일 인증 완료
//   3단계(done)   : 로그인 화면으로 이동
//
// 이메일 인증을 마쳐야 로그인할 수 있습니다.
// ====================================

type RegisterStep = "form" | "verify" | "done";

/** 단계별 카드 제목 */
const STEP_TITLES: Record<RegisterStep, string> = {
  form: "회원가입",
  verify: "이메일 인증",
  done: "가입 완료",
};

export default function RegisterPage() {
  const [step, setStep] = useState<RegisterStep>("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [message, setMessage] = useState<Message | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** 1단계: 계정 만들기 */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // 서버에 보내기 전에 화면에서 먼저 확인
    if (password !== passwordConfirm) {
      setMessage({ type: "error", text: "비밀번호 확인이 일치하지 않습니다." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        // 여러 항목이 잘못된 경우 줄바꿈으로 모두 보여 줍니다.
        setMessage({
          type: "error",
          text: data.errors?.join("\n") || data.message || "회원가입에 실패했습니다.",
        });
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

  /** 2단계 완료: 인증이 끝나면 마지막 단계로 이동 */
  const handleVerified = () => {
    setStep("done");
    setMessage({ type: "success", text: "이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다." });
  };

  return (
    <AuthCard title={STEP_TITLES[step]} subtitle="계정을 만들고 매거진을 이용하세요">
      {/* 인증 단계에서는 VerificationCodeForm 이 자체 안내 문구를 표시합니다 */}
      {step !== "verify" && <FormMessage message={message} />}

      {/* ---------- 1단계: 가입 정보 입력 ---------- */}
      {step === "form" && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              required
              minLength={2}
              maxLength={50}
              autoComplete="name"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              autoComplete="email"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상 입력하세요"
              required
              minLength={8}
              autoComplete="new-password"
              className="input-field"
            />
          </div>

          <div>
            <label
              htmlFor="register-password-confirm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호 확인
            </label>
            <input
              id="register-password-confirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
              minLength={8}
              autoComplete="new-password"
              className="input-field"
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full btn-primary mt-2">
            {isSubmitting ? "가입 처리 중..." : "회원가입"}
          </button>
        </form>
      )}

      {/* ---------- 2단계: 이메일 인증 ---------- */}
      {step === "verify" && (
        <VerificationCodeForm
          email={email}
          onVerified={handleVerified}
          description={
            <p className="text-sm text-gray-500 leading-6 break-all">
              {email} 주소로 발송된 6자리 인증 코드를 입력해주세요.
            </p>
          }
        />
      )}

      {/* ---------- 3단계: 가입 완료 ---------- */}
      {step === "done" && (
        <Link href="/login?verified=1" className="block w-full text-center btn-primary">
          로그인하러 가기
        </Link>
      )}

      <div className="text-center mt-6 text-sm text-gray-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
          로그인
        </Link>
      </div>
    </AuthCard>
  );
}
