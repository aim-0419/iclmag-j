import Link from "next/link";

// ====================================
// 페이지 번호 이동 버튼 (공용)
// ------------------------------------
// 기사가 많아지면 여러 페이지로 나눠서 보여 주는데,
// 그때 아래쪽에 표시되는 "이전 1 2 3 … 다음" 버튼 묶음입니다.
//
// 중요한 점:
// 페이지가 100개여도 번호를 100개 전부 그리면 화면 밖으로 넘쳐 버립니다.
// 그래서 현재 페이지 주변 번호만 보여 주고, 사이는 "…" 로 줄여서 표시합니다.
// ====================================

interface PaginationProps {
  currentPage: number;                  // 지금 보고 있는 페이지
  totalPages: number;                   // 전체 페이지 수
  buildHref: (page: number) => string;  // 각 번호를 눌렀을 때 이동할 주소 만드는 방법
}

/** 현재 페이지 주변 번호만 골라내고, 건너뛴 구간은 "…"("dots")로 표시 */
function buildPageItems(currentPage: number, totalPages: number): (number | "dots")[] {
  // 페이지가 7개 이하면 전부 그대로 보여 줍니다.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | "dots")[] = [1];

  // 현재 페이지 앞뒤로 1개씩만 표시
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) items.push("dots");
  for (let page = start; page <= end; page++) items.push(page);
  if (end < totalPages - 1) items.push("dots");

  items.push(totalPages);
  return items;
}

export default function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  // 페이지가 하나뿐이면 버튼을 보여 줄 필요가 없습니다.
  if (totalPages <= 1) return null;

  const items = buildPageItems(currentPage, totalPages);

  return (
    <nav
      aria-label="페이지 이동"
      className="flex flex-wrap items-center justify-center gap-1.5 mt-10"
    >
      {/* 이전 페이지 */}
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors"
        >
          이전
        </Link>
      )}

      {/* 페이지 번호들 */}
      {items.map((item, index) =>
        item === "dots" ? (
          <span key={`dots-${index}`} className="px-1.5 text-gray-400 text-sm select-none">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(item)}
            aria-current={item === currentPage ? "page" : undefined}
            className={`min-w-[2.5rem] text-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              item === currentPage
                ? "bg-primary text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {item}
          </Link>
        )
      )}

      {/* 다음 페이지 */}
      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors"
        >
          다음
        </Link>
      )}
    </nav>
  );
}
