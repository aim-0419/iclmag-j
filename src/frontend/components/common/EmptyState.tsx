import Link from "next/link";

// ====================================
// "보여 줄 내용이 없습니다" 안내 화면 (공용)
// ------------------------------------
// 기사가 아직 하나도 없을 때 빈 화면만 덩그러니 보이면 오류처럼 느껴집니다.
// 그래서 아이콘 + 안내 문구 + (필요하면) 돌아가기 링크를 보여 줍니다.
// 홈 · 카테고리 · 전체 기사 화면에서 같은 모양으로 재사용합니다.
// ====================================

interface EmptyStateProps {
  icon?: string;        // 큰 아이콘 (이모지)
  title: string;        // 굵은 안내 문구
  description?: string; // 보조 설명
  action?: {            // 아래에 표시할 링크 (선택)
    label: string;
    href: string;
  };
}

export default function EmptyState({
  icon = "📰",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 sm:py-20 px-4">
      <p className="text-5xl mb-4" aria-hidden>{icon}</p>
      <p className="text-gray-500 text-base sm:text-lg break-keep">{title}</p>
      {description && (
        <p className="text-gray-400 text-sm mt-2 break-keep">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="inline-block mt-6 text-accent hover:underline text-sm"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
