import Link from "next/link";
import { SITE } from "@/constants/site";

// ====================================
// 로그인 계열 화면의 공통 틀
// ------------------------------------
// 로그인, 회원가입, 이메일 인증, 비밀번호 재설정 화면은 모양이 똑같습니다.
//   가운데 로고 → 흰색 카드 → 카드 아래 보조 링크
// 매 화면마다 같은 코드를 반복하지 않도록 이 틀 하나로 모았습니다.
// ====================================

interface AuthCardProps {
  title: string;         // 카드 안 큰 제목 (예: "로그인")
  subtitle?: string;     // 로고 아래 작은 안내 문구
  children: React.ReactNode;
  footer?: React.ReactNode; // 카드 아래에 붙일 보조 링크
}

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="auth-page">
      <div className="w-full max-w-md">
        {/* 로고 (누르면 홈으로) */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-accent font-black text-3xl">{SITE.logo.primary}</span>
            <span className="font-light text-2xl text-gray-700">{SITE.logo.secondary}</span>
          </Link>
          {subtitle && <p className="text-gray-500 text-sm mt-2 break-keep">{subtitle}</p>}
        </div>

        {/* 흰색 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
          {children}
        </div>

        {/* 카드 아래 보조 링크 */}
        {footer && <div className="text-center mt-4">{footer}</div>}
      </div>
    </div>
  );
}
