import Link from "next/link";
import { POLICY_TABS } from "@/content/policies";
import { SITE } from "@/constants/site";

// ====================================
// 사이트 하단 꼬리말 (푸터)
// ------------------------------------
// 모든 화면 맨 아래에 표시되며 두 부분으로 되어 있습니다.
//   1) 약관 링크 줄 : 개인정보 취급방침, 청소년보호정책 등
//   2) 매체 정보    : 발행인, 주소, 대표번호, 저작권 표시
//
// 표시되는 값들을 여기에 직접 적지 않고
//   - 약관 목록 → src/content/policies.ts
//   - 매체 정보 → src/constants/site.ts
// 에서 가져옵니다. 담당자나 주소가 바뀌면 그 파일만 고치면 됩니다.
// ====================================

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16">
      {/* ---------- 1) 약관 링크 줄 ---------- */}
      {/* flex-wrap: 좁은 화면에서는 링크가 자동으로 다음 줄로 넘어갑니다 */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-3">
        <ul className="flex flex-wrap justify-center items-center gap-y-1">
          {POLICY_TABS.map((policy, index) => (
            <li key={policy.slug} className="flex items-center">
              {index > 0 && (
                <span className="text-gray-300 mx-2 select-none text-xs" aria-hidden>|</span>
              )}
              <Link
                href={`/policy/${policy.slug}`}
                className="text-xs text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap"
              >
                {policy.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------- 2) 매체 정보 ---------- */}
      <div className="max-w-7xl mx-auto px-6 py-4 text-center">
        <Link href="/" className="inline-block mb-2">
          <span className="text-xs font-bold text-gray-600">{SITE.name}</span>
        </Link>

        <div className="space-y-1 text-xs text-gray-400 leading-5 break-keep">
          <p>
            신문사업 등록번호 {SITE.registrationNo}
            <span className="text-gray-300 mx-1.5" aria-hidden>|</span>
            발행인 {SITE.publisher}
            <span className="text-gray-300 mx-1.5" aria-hidden>|</span>
            편집인 {SITE.editor}
            <span className="text-gray-300 mx-1.5" aria-hidden>|</span>
            개인정보관리책임자 {SITE.privacyOfficer}
            <span className="text-gray-300 mx-1.5" aria-hidden>|</span>
            청소년보호책임자 {SITE.youthOfficer}
          </p>
          <p>
            발행 {SITE.address}
            <span className="text-gray-300 mx-1.5" aria-hidden>|</span>
            대표번호 {SITE.tel}
          </p>
          <p>{SITE.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
