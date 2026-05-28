"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// ====================================
// 비밀번호 재설정 페이지
// /reset-password?token=xxx
// ====================================

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!token) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">올바르지 않은 링크입니다.</p>
          <Link href="/login" className="text-accent hover:underline">로그인으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 8) {
      setMessage("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setStatus("error");
        setMessage(data.message);
      }
    } catch {
      setStatus("error");
      setMessage("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-accent font-black text-3xl">ICL</span>
            <span className="font-light text-2xl text-gray-700">MAG-J</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">비밀번호 변경 완료!</h2>
              <p className="text-gray-500 text-sm">{message}</p>
              <p className="text-gray-400 text-xs mt-3">잠시 후 로그인 페이지로 이동합니다...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">새 비밀번호 설정</h1>
              <p className="text-sm text-gray-500 mb-6">8자 이상의 새 비밀번호를 입력해주세요.</p>

              {message && (
                <div className={`text-sm rounded-lg px-4 py-3 mb-5 ${
                  status === "error"
                    ? "bg-red-50 border border-red-200 text-red-700"
                    : "bg-yellow-50 border border-yellow-200 text-yellow-700"
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8자 이상 입력"
                    required
                    className="input-field"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="비밀번호 재입력"
                    required
                    className="input-field"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full btn-primary mt-2"
                >
                  {status === "loading" ? "변경 중..." : "비밀번호 변경"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
            ← 로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
