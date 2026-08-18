"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/frontend/components/auth/AuthCard";
import FormMessage, { type Message } from "@/frontend/components/auth/FormMessage";
import FindEmailModal from "@/frontend/components/auth/FindEmailModal";
import ForgotPasswordModal from "@/frontend/components/auth/ForgotPasswordModal";

// ====================================
// 로그인 화면
// 주소: /login
// ------------------------------------
// 아이디(또는 이메일)와 비밀번호로 로그인합니다.
// 아래쪽 "아이디 찾기 / 비밀번호 찾기"를 누르면 작은 팝업 창이 열립니다.
//
// 이메일 인증을 아직 마치지 않은 계정으로 로그인하면
// 안내 문구와 함께 "이메일 인증하러 가기" 링크를 보여 줍니다.
// ====================================

function LoginForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 지금 열려 있는 팝업 (없으면 null)
  const [modal, setModal] = useState<"find-email" | "forgot-password" | null>(null);

  // 이메일 인증을 마치고 넘어온 경우(?verified=1) 축하 문구를 보여 줍니다.
  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setMessage({ type: "success", text: "이메일 인증이 완료되었습니다! 이제 로그인하세요." });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setUnverifiedEmail("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        // 이메일 인증을 마치지 않은 계정
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(email.trim());
        }
        setMessage({ type: "error", text: data.message || "로그인에 실패했습니다." });
        return;
      }

      // 로그인 성공 → 홈으로 이동
      // (화면 전체를 새로 불러와 헤더의 로그인 정보까지 확실히 갱신합니다)
      window.location.href = "/";
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 팝업 창 */}
      {modal === "find-email" && <FindEmailModal onClose={() => setModal(null)} />}
      {modal === "forgot-password" && <ForgotPasswordModal onClose={() => setModal(null)} />}

      <AuthCard
        title="로그인"
        subtitle="계속하려면 로그인하세요"
        footer={
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            홈으로 돌아가기
          </Link>
        }
      >
        <FormMessage message={message} />

        {/* 미인증 계정 안내 링크 */}
        {unverifiedEmail && (
          <Link
            href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
            className="block -mt-3 mb-5 text-sm font-medium text-red-700 underline underline-offset-2"
          >
            이메일 인증하러 가기
          </Link>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
              아이디 또는 이메일
            </label>
            <input
              id="login-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="아이디 또는 이메일을 입력하세요"
              required
              autoComplete="username"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              autoComplete="current-password"
              className="input-field"
            />
          </div>

          <button type="submit" disabled={isLoading} className="w-full btn-primary mt-2">
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 아이디 / 비밀번호 찾기 */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
          <button
            type="button"
            onClick={() => setModal("find-email")}
            className="hover:text-gray-600 transition-colors"
          >
            아이디 찾기
          </button>
          <span aria-hidden>|</span>
          <button
            type="button"
            onClick={() => setModal("forgot-password")}
            className="hover:text-gray-600 transition-colors"
          >
            비밀번호 찾기
          </button>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          아직 계정이 없으신가요?{" "}
          <Link href="/register" className="text-accent hover:text-accent-hover font-medium">
            회원가입
          </Link>
        </div>
      </AuthCard>
    </>
  );
}

// useSearchParams 를 쓰는 화면은 Suspense 로 감싸야 한다는 Next.js 규칙에 따른 처리입니다.
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-page min-h-[50vh]" />}>
      <LoginForm />
    </Suspense>
  );
}
