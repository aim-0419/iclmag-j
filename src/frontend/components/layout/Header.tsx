"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CATEGORY_LABELS, Category } from "@/types";

// ====================================
// 사이트 헤더 컴포넌트
// 로고, 카테고리 네비게이션, 로그인/로그아웃 버튼 포함
// ====================================

// 카테고리 네비게이션 목록
const CATEGORIES: { label: string; slug: string; value: Category }[] = [
  { label: "정치", slug: "politics", value: "POLITICS" },
  { label: "경제", slug: "economy", value: "ECONOMY" },
  { label: "사회", slug: "society", value: "SOCIETY" },
  { label: "생활/문화", slug: "culture", value: "CULTURE" },
  { label: "IT/과학", slug: "tech", value: "TECH" },
  { label: "세계", slug: "world", value: "WORLD" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // 현재 로그인한 사용자 정보
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * 현재 로그인 상태 확인
   * /api/auth/me 엔드포인트로 현재 사용자 정보 가져옴
   */
  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      }
    } catch {
      // 로그인 안 된 상태이므로 무시
    }
  };

  /**
   * 로그아웃 처리
   * 서버에 로그아웃 요청 후 홈으로 이동
   */
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="bg-primary text-white">
      {/* 상단 바 - 로고 + 로그인 */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* 매거진 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-accent font-black text-3xl tracking-tighter">
              ICL
            </span>
            <span className="font-light text-xl tracking-widest text-gray-300">
              MAG-J
            </span>
          </Link>

          {/* 오른쪽: 로그인/사용자 메뉴 */}
          <div className="flex items-center gap-4">
            {user ? (
              // 로그인 된 경우
              <div className="flex items-center gap-3">
                {/* 기사 쓰기 버튼 (WRITER, ADMIN만) */}
                {(user.role === "WRITER" || user.role === "ADMIN") && (
                  <Link
                    href="/write"
                    className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded transition-colors"
                  >
                    ✏️ 기사 쓰기
                  </Link>
                )}
                {/* 이름 클릭 → 마이페이지 이동 */}
                <Link
                  href="/mypage"
                  className="text-gray-400 hover:text-white text-sm hidden sm:block transition-colors"
                >
                  {user.name}님
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              // 로그인 안 된 경우
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  로그인
                </Link>
                {/* 회원가입 비활성화 */}
              </div>
            )}

            {/* 모바일 햄버거 메뉴 */}
            <button
              className="sm:hidden text-gray-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 카테고리 네비게이션 바 */}
      <nav className="bg-primary border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {/* 전체 탭 */}
            <li>
              <Link
                href="/"
                className={`block px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  pathname === "/"
                    ? "text-accent border-accent"
                    : "text-gray-400 hover:text-white border-transparent"
                }`}
              >
                전체
              </Link>
            </li>

            {/* 카테고리 탭들 */}
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className={`block px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    pathname === `/category/${cat.slug}`
                      ? "text-accent border-accent"
                      : "text-gray-400 hover:text-white border-transparent"
                  }`}
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 모바일 메뉴 (햄버거 열렸을 때) */}
      {isMenuOpen && (
        <div className="sm:hidden bg-gray-900 border-b border-gray-800 px-4 py-3">
          {user ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/mypage"
                className="text-gray-300 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                {user.name}님 (마이페이지)
              </Link>
              {(user.role === "WRITER" || user.role === "ADMIN") && (
                <Link href="/write" className="text-accent text-sm" onClick={() => setIsMenuOpen(false)}>
                  ✏️ 기사 쓰기
                </Link>
              )}
              <button onClick={handleLogout} className="text-gray-400 text-sm text-left">
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" className="text-gray-300 text-sm" onClick={() => setIsMenuOpen(false)}>
                로그인
              </Link>
              {/* 회원가입 비활성화 */}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
