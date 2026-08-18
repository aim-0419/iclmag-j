"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AuthCard from "@/frontend/components/auth/AuthCard";
import FormMessage, { type Message } from "@/frontend/components/auth/FormMessage";

// ====================================
// 새 비밀번호 설정 화면
// 주소: /reset-password?token=임시열쇠
// ------------------------------------
// 비밀번호 찾기 메일 속 링크를 누르면 이 화면이 열립니다.
// 주소 뒤에 붙은 임시 열쇠(token)가 있어야만 비밀번호를 바꿀 수 있고,
// 그 열쇠는 발급 후 30분이 지나면 사용할 수 없습니다.
// ====================================

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // 링크 없이 주소를 직접 입력해 들어온 경우
  if (!token) {
    return (
      <AuthCard title="잘못된 접근">
        <p className="text-sm text-gray-500 mb-5 break-keep">
          올바르지 않은 링크입니다. 비밀번호 찾기를 다시 요청해주세요.
        </p>
        <Link href="/login" className="block w-full text-center btn-primary">
          로그인으로 돌아가기
        </Link>
      </AuthCard>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // 보내기 전에 화면에서 먼저 확인
    if (password.length < 8) {
      setMessage({ type: "error", text: "비밀번호는 8자 이상이어야 합니다." });
      return;
    }
    if (password !== passwordConfirm) {
      setMessage({ type: "error", text: "비밀번호가 일치하지 않습니다." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "비밀번호 변경에 실패했습니다." });
        return;
      }

      setIsDone(true);
      // 잠시 안내를 보여 준 뒤 로그인 화면으로 이동
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  // 변경 완료 화면
  if (isDone) {
    return (
      <AuthCard title="비밀번호 변경 완료">
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm break-keep">
            비밀번호가 성공적으로 변경되었습니다.
          </p>
          <p className="text-gray-400 text-xs mt-3">잠시 후 로그인 화면으로 이동합니다...</p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="새 비밀번호 설정"
      footer={
        <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
          로그인으로 돌아가기
        </Link>
      }
    >
      <p className="text-sm text-gray-500 -mt-3 mb-5 break-keep">
        8자 이상의 새 비밀번호를 입력해주세요.
      </p>

      <FormMessage message={message} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
            새 비밀번호
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8자 이상 입력"
            required
            minLength={8}
            autoFocus
            autoComplete="new-password"
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="new-password-confirm" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호 확인
          </label>
          <input
            id="new-password-confirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="비밀번호 재입력"
            required
            minLength={8}
            autoComplete="new-password"
            className="input-field"
          />
        </div>

        <button type="submit" disabled={isLoading} className="w-full btn-primary mt-2">
          {isLoading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
    </AuthCard>
  );
}

// useSearchParams 를 쓰는 화면은 Suspense 로 감싸야 한다는 Next.js 규칙에 따른 처리입니다.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="auth-page min-h-[50vh]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
