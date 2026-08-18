"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/frontend/components/auth/AuthCard";
import VerificationCodeForm from "@/frontend/components/auth/VerificationCodeForm";

// ====================================
// 이메일 인증 화면 (회원가입 도중 창을 닫았을 때 사용)
// 주소: /verify-email  또는  /verify-email?email=주소
// ------------------------------------
// 회원가입은 마쳤지만 이메일 인증을 끝내지 못한 사람이
// 나중에 다시 들어와 인증을 마칠 수 있는 화면입니다.
//
// 로그인 화면에서 "이메일 인증하러 가기"를 누르면
// 이메일 주소가 자동으로 채워진 상태로 이 화면이 열립니다.
// ====================================

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  // 주소에 이메일이 함께 넘어왔으면 미리 채워 둡니다.
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [isVerified, setIsVerified] = useState(false);

  return (
    <AuthCard
      title="이메일 인증"
      footer={
        <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
          로그인으로 돌아가기
        </Link>
      }
    >
      {isVerified ? (
        // 인증 완료
        <>
          <div className="alert-success mb-5">이메일 인증이 완료되었습니다.</div>
          <Link href="/login?verified=1" className="block w-full text-center btn-primary">
            로그인하러 가기
          </Link>
        </>
      ) : (
        <>
          {/* 이메일 입력 (인증 코드를 받은 주소) */}
          <div className="mb-4">
            <label htmlFor="verify-email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="verify-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="가입한 이메일을 입력하세요"
              required
              autoComplete="email"
              className="input-field"
            />
          </div>

          {/* 인증 코드 입력 + 재발송 (회원가입 화면과 같은 부품을 사용) */}
          <VerificationCodeForm email={email} onVerified={() => setIsVerified(true)} />
        </>
      )}
    </AuthCard>
  );
}

// useSearchParams 를 쓰는 화면은 Suspense 로 감싸야 한다는 Next.js 규칙에 따른 처리입니다.
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="auth-page min-h-[50vh]" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
