"use client";

import { useState } from "react";
import Modal from "@/frontend/components/common/Modal";

// ====================================
// 비밀번호 찾기 팝업
// ------------------------------------
// 가입한 이메일을 입력하면 "새 비밀번호 설정하기" 링크를 메일로 보냅니다.
// 링크는 30분 동안만 사용할 수 있습니다.
//
// 참고: 가입되지 않은 이메일을 입력해도 똑같이 "발송했다"고 안내합니다.
// 어떤 이메일이 우리 사이트에 가입되어 있는지 외부에서 알아내지 못하게 하기 위함입니다.
// ====================================

export default function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "발송에 실패했습니다.");
        return;
      }

      setIsSent(true);
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title="비밀번호 찾기" onClose={onClose}>
      {!isSent ? (
        // 1단계: 이메일 입력
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 break-keep">
            가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.
          </p>

          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 입력"
              required
              autoFocus
              autoComplete="email"
              className="input-field"
            />
          </div>

          {error && <p className="alert-error">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full btn-primary">
            {isLoading ? "발송 중..." : "재설정 링크 발송"}
          </button>
        </form>
      ) : (
        // 2단계: 발송 완료 안내
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium mb-1">이메일을 발송했습니다!</p>
          <p className="text-sm text-gray-400 mb-5 break-keep">
            받은 편지함을 확인해주세요.
            <br />
            링크는 30분 후 만료됩니다.
          </p>
          <button type="button" onClick={onClose} className="w-full btn-primary">
            확인
          </button>
        </div>
      )}
    </Modal>
  );
}
