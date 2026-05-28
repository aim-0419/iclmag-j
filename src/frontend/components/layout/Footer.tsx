import Link from "next/link";

// ====================================
// 사이트 푸터 컴포넌트
// 약관 링크, 법인 정보, 저작권 표시
// ====================================

const POLICY_LINKS = [
  { label: "회사소개",          href: "/policy/about" },
  { label: "개인정보 취급방침", href: "/policy/privacy" },
  { label: "유료서비스이용약관", href: "/policy/paid-service" },
  { label: "이메일 수집거부",   href: "/policy/email-refusal" },
  { label: "청소년보호정책",    href: "/policy/youth-protection" },
  { label: "게시판 운영원칙",   href: "/policy/board-rules" },
  { label: "사이트 이용약관",   href: "/policy/terms" },
  { label: "기타",              href: "/policy/etc" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16">

      {/* 약관 링크 바 */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-3">
        <ul className="flex flex-wrap justify-center items-center gap-y-1">
          {POLICY_LINKS.map((link, index) => (
            <li key={link.href} className="flex items-center">
              {index > 0 && (
                <span className="text-gray-300 mx-2 select-none text-xs">|</span>
              )}
              <Link
                href={link.href}
                className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 법인 정보 */}
      <div className="max-w-7xl mx-auto px-6 py-4 text-center">
        <Link href="/">
          <span className="text-xs font-bold text-gray-600 block mb-2">
            이끌림필라테스매거진
          </span>
        </Link>

        <div className="space-y-1 text-xs text-gray-400 leading-5">
          <p>
            신문사업 등록번호 창간 준비 중&nbsp;
            <span className="text-gray-300">|</span>&nbsp;
            발행인 정지윤&nbsp;
            <span className="text-gray-300">|</span>&nbsp;
            편집인 정지윤&nbsp;
            <span className="text-gray-300">|</span>&nbsp;
            개인정보관리책임자 정지윤&nbsp;
            <span className="text-gray-300">|</span>&nbsp;
            청소년보호책임자 정지윤
          </p>
          <p>
            발행 광주광역시 광산구 풍영로189, 2층&nbsp;
            <span className="text-gray-300">|</span>&nbsp;
            대표번호 062-671-8650
          </p>
          <p>
            COPYRIGHT(C) 이끌림필라테스매거진. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>

    </footer>
  );
}
