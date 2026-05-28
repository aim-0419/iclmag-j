"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ====================================
// 이메일 인증 완료 페이지
// /verify-email?token=xxx
// ====================================

type Status = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("올바르지 않은 인증 링크입니다.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("서버 오류가 발생했습니다.");
      });
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <div>
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-600">이메일 인증 중...</p>
          </div>
        )}
        {status === "success" && (
          <div>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">인증 완료!</h1>
            <p className="text-gray-600 mb-8">{message}</p>
            <Link href="/login" className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              로그인하러 가기
            </Link>
          </div>
        )}
        {status === "error" && (
          <div>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">인증 실패</h1>
            <p className="text-gray-600 mb-8">{message}</p>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">홈으로 돌아가기</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
