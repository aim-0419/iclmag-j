"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// ====================================
// 로그인 페이지
// 이메일 + 비밀번호로 로그인 처리
// 아이디 찾기 / 비밀번호 찾기 모달 포함
// ====================================

// ---------- 아이디 찾기 모달 ----------
function FindEmailModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [result, setResult] = useState<{ email: string; createdAt: string }[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/find-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (data.success) {
        setResult(data.accounts);
      } else {
        setError(data.message);
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">아이디(이메일) 찾기</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가입 시 입력한 이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름 입력"
                required
                className="input-field"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? "조회 중..." : "아이디 찾기"}
            </button>
          </form>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">해당 이름으로 가입된 계정입니다:</p>
            <ul className="space-y-2 mb-5">
              {result.map((acc, i) => (
                <li key={i} className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="font-mono font-semibold text-gray-900">{acc.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">가입일: {acc.createdAt}</p>
                </li>
              ))}
            </ul>
            <button onClick={onClose} className="w-full btn-primary">확인</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- 비밀번호 찾기 모달 ----------
function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setSent(true);
      } else {
        setError(data.message);
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">비밀번호 찾기</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-500">
              가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 입력"
                required
                className="input-field"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? "발송 중..." : "재설정 링크 발송"}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-1">이메일을 발송했습니다!</p>
            <p className="text-sm text-gray-400 mb-5">
              받은 편지함을 확인해주세요.<br/>링크는 30분 후 만료됩니다.
            </p>
            <button onClick={onClose} className="w-full btn-primary">확인</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- 로그인 폼 ----------
function LoginForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<"find-email" | "forgot-password" | null>(null);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setNotice("이메일 인증이 완료되었습니다! 이제 로그인하세요.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setError("이메일 인증이 완료되지 않았습니다. 가입 시 발송된 인증 메일을 확인해주세요.");
        } else {
          setError(data.message || "로그인에 실패했습니다.");
        }
        return;
      }

      window.location.href = "/";
    } catch {
      setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 모달 */}
      {modal === "find-email" && <FindEmailModal onClose={() => setModal(null)} />}
      {modal === "forgot-password" && <ForgotPasswordModal onClose={() => setModal(null)} />}

      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* 로고 */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="text-accent font-black text-3xl">ICL</span>
              <span className="font-light text-2xl text-gray-700">MAG-J</span>
            </Link>
            <p className="text-gray-500 text-sm mt-2">계속하려면 로그인하세요</p>
          </div>

          {/* 로그인 카드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">로그인</h1>

            {notice && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-5">
                ✅ {notice}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">아이디 또는 이메일</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="아이디 또는 이메일을 입력하세요"
                  required
                  className="input-field"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="input-field"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary mt-2"
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </button>
            </form>

            {/* 아이디/비밀번호 찾기 */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
              <button
                onClick={() => setModal("find-email")}
                className="hover:text-gray-600 transition-colors"
              >
                아이디 찾기
              </button>
              <span>|</span>
              <button
                onClick={() => setModal("forgot-password")}
                className="hover:text-gray-600 transition-colors"
              >
                비밀번호 찾기
              </button>
            </div>

            {/* 회원가입 비활성화 */}
          </div>

          <p className="text-center mt-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
              ← 홈으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center" />}>
      <LoginForm />
    </Suspense>
  );
}
