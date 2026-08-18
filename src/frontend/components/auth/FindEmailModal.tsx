"use client";

import { useState } from "react";
import Modal from "@/frontend/components/common/Modal";

// ====================================
// 아이디(이메일) 찾기 팝업
// ------------------------------------
// 가입할 때 쓴 "이름"으로 가입된 계정을 찾아 줍니다.
// 개인정보 보호를 위해 이메일 전체가 아니라
// 앞 3글자만 보이고 나머지는 *** 로 가려서 표시합니다.
// ====================================

/** 서버가 돌려주는 계정 한 건 (가려진 이메일 + 가입일) */
interface MaskedAccount {
  email: string;
  createdAt: string;
}

export default function FindEmailModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [accounts, setAccounts] = useState<MaskedAccount[] | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAccounts(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/find-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "조회에 실패했습니다.");
        return;
      }

      setAccounts(data.data);
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title="아이디(이메일) 찾기" onClose={onClose}>
      {!accounts ? (
        // 1단계: 이름 입력
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="find-email-name" className="block text-sm font-medium text-gray-700 mb-1">
              가입 시 입력한 이름
            </label>
            <input
              id="find-email-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 입력"
              required
              autoFocus
              className="input-field"
            />
          </div>

          {error && <p className="alert-error">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full btn-primary">
            {isLoading ? "조회 중..." : "아이디 찾기"}
          </button>
        </form>
      ) : (
        // 2단계: 찾은 계정 보여 주기
        <div>
          <p className="text-sm text-gray-600 mb-4">해당 이름으로 가입된 계정입니다.</p>
          <ul className="space-y-2 mb-5">
            {accounts.map((account) => (
              <li key={account.email} className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="font-mono font-semibold text-gray-900 break-all">{account.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">가입일: {account.createdAt}</p>
              </li>
            ))}
          </ul>
          <button type="button" onClick={onClose} className="w-full btn-primary">
            확인
          </button>
        </div>
      )}
    </Modal>
  );
}
