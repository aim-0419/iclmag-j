"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CATEGORIES } from "@/constants/categories";
import { SITE } from "@/constants/site";
import { useAuth } from "@/frontend/hooks/useAuth";

// ====================================
// 사이트 상단 머리말 (헤더)
// ------------------------------------
// 모든 화면 맨 위에 항상 표시되며 세 부분으로 되어 있습니다.
//   1) 로고        : 누르면 홈으로 이동
//   2) 사용자 메뉴 : 로그인/회원가입 또는 이름·기사쓰기·로그아웃
//   3) 카테고리 줄 : 전체 / 정치 / 경제 ... (좁은 화면에서는 옆으로 밀어서 봄)
//
// 좁은 화면(휴대폰)에서는 사용자 메뉴가 자리를 많이 차지해 로고와 겹치므로,
// 사용자 메뉴를 숨기고 오른쪽 햄버거 버튼을 눌러 펼치도록 했습니다.
// ====================================

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAdmin, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 다른 화면으로 이동하면 열려 있던 모바일 메뉴를 자동으로 닫습니다.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  /** 로그아웃 후 홈으로 이동하고 화면을 최신 상태로 새로 고칩니다. */
  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  /** 카테고리 줄에서 지금 보고 있는 메뉴에 밑줄을 칠지 결정합니다. */
  const navLinkClass = (isActive: boolean) =>
    `block px-3 sm:px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
      isActive ? "text-accent border-accent" : "text-gray-400 hover:text-white border-transparent"
    }`;

  return (
    <header className="bg-primary text-white">
      {/* ============ 1) 로고 + 사용자 메뉴 ============ */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-accent font-black text-2xl sm:text-3xl tracking-tighter">
              {SITE.logo.primary}
            </span>
            <span className="font-light text-lg sm:text-xl tracking-widest text-gray-300">
              {SITE.logo.secondary}
            </span>
          </Link>

          {/* 사용자 메뉴 (넓은 화면 전용) */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                {/* 기사 쓰기 버튼은 관리자에게만 보입니다 */}
                {isAdmin && (
                  <Link
                    href="/write"
                    className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded transition-colors"
                  >
                    기사 쓰기
                  </Link>
                )}
                <Link
                  href="/mypage"
                  className="text-gray-400 hover:text-white text-sm transition-colors truncate max-w-[10rem]"
                >
                  {user.name}님
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white text-sm transition-colors">
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* 햄버거 버튼 (좁은 화면 전용) */}
          <button
            type="button"
            className="sm:hidden text-gray-400 hover:text-white p-1 -mr-1"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ============ 2) 카테고리 줄 ============ */}
      {/* overflow-x-auto: 카테고리가 화면 너비를 넘치면 옆으로 밀어서 볼 수 있습니다 */}
      <nav className="bg-primary border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <li>
              <Link href="/" className={navLinkClass(pathname === "/")}>
                전체
              </Link>
            </li>
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className={navLinkClass(pathname === `/category/${category.slug}`)}
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ============ 3) 펼쳐진 모바일 메뉴 ============ */}
      {isMenuOpen && (
        <div className="sm:hidden bg-gray-900 border-b border-gray-800 px-4 py-3">
          {user ? (
            <div className="flex flex-col gap-3">
              <Link href="/mypage" className="text-gray-300 text-sm">
                {user.name}님 · 마이페이지
              </Link>
              {isAdmin && (
                <Link href="/write" className="text-accent text-sm">
                  기사 쓰기
                </Link>
              )}
              <button onClick={handleLogout} className="text-gray-400 text-sm text-left">
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" className="text-gray-300 text-sm">
                로그인
              </Link>
              <Link href="/register" className="text-accent text-sm">
                회원가입
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
