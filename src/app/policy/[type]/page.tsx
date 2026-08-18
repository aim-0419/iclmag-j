import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { POLICY_TABS, POLICY_CONTENT } from "@/content/policies";
import { SITE, YOUTH_PROTECTION_CONTACTS } from "@/constants/site";

// ====================================
// 약관 / 법적고지 화면
// 주소: /policy/privacy, /policy/youth-protection ...
// ------------------------------------
// 위쪽에 약관 종류를 고르는 탭이 있고, 아래에 선택한 문서의 내용이 나옵니다.
//
// 이 파일에는 "화면을 어떻게 그릴지"만 들어 있고,
// 실제 약관 문구는 src/content/policies.ts 에 따로 보관되어 있습니다.
// 그래서 약관을 고칠 때 이 파일을 건드릴 필요가 없습니다.
// ====================================

/** 약관 화면 8개를 배포 시점에 미리 만들어 두어 빠르게 열리도록 합니다 */
export function generateStaticParams() {
  return POLICY_TABS.map((tab) => ({ type: tab.slug }));
}

interface PolicyPageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { type } = await params;
  const policy = POLICY_CONTENT[type];

  if (!policy) return { title: "페이지를 찾을 수 없습니다" };

  return {
    title: policy.title,
    description: `${SITE.name} ${policy.title}`,
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { type } = await params;
  const policy = POLICY_CONTENT[type];

  // 존재하지 않는 약관 주소로 들어오면 404 화면
  if (!policy) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
      <h1 className="text-xl font-bold text-gray-900 mb-6">{SITE.name} 법적고지</h1>

      {/* ---------- 약관 종류 선택 탭 ---------- */}
      {/* 좁은 화면에서는 탭이 여러 줄로 자연스럽게 넘어갑니다 */}
      <nav aria-label="약관 종류" className="flex flex-wrap gap-1.5 mb-8">
        {POLICY_TABS.map((tab) => (
          <Link
            key={tab.slug}
            href={`/policy/${tab.slug}`}
            aria-current={tab.slug === type ? "page" : undefined}
            className={`px-4 py-2.5 text-sm font-medium rounded border transition-colors ${
              tab.slug === type
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* ---------- 선택한 약관 내용 ---------- */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-8 min-h-64">
        <h2 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
          {policy.title}
        </h2>

        {/* whitespace-pre-wrap: 원문의 줄바꿈을 그대로 보여 줌
            break-keep + break-words: 한글은 자연스럽게, 긴 영문은 화면 안에서 줄바꿈 */}
        <div className="text-gray-700 leading-8 whitespace-pre-wrap break-keep break-words text-sm">
          {policy.content}
        </div>

        {/* 청소년보호정책 화면에만 추가로 표시되는 담당자 안내 */}
        {type === "youth-protection" && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {YOUTH_PROTECTION_CONTACTS.map((contact) => (
              <div key={contact.role} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                  {contact.role}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-gray-600">
                  <span>이름 : {contact.name}</span>
                  <span>소속 : {contact.team}</span>
                  <span>전화 : {contact.tel}</span>
                  <span>직위 : {contact.position}</span>
                  <span className="sm:col-span-2 break-words">
                    메일 :{" "}
                    <a href={`mailto:${contact.email}`} className="text-blue-500 hover:underline">
                      {contact.email}
                    </a>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
