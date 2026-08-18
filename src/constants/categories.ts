// ====================================
// 기사 카테고리 단일 관리 파일
// ------------------------------------
// 카테고리(정치·경제·사회…)와 관련된 모든 정보를 이 파일 한 곳에서 관리합니다.
// 헤더 메뉴, 기사 작성 화면의 선택 목록, 카드의 색상 배지, 주소(URL) 변환,
// 서버의 입력값 검사까지 전부 여기 있는 CATEGORIES 목록을 기준으로 동작합니다.
//
// [비개발자용 안내]
// 카테고리를 추가·삭제·이름 변경하려면 아래 CATEGORIES 목록만 고치면
// 사이트 전체에 한 번에 반영됩니다.
// (단, 카테고리를 추가할 때는 prisma/schema.prisma 의 Category 목록에도
//  같은 영문 코드를 추가한 뒤 npm run db:push 를 실행해야 합니다.)
// ====================================

/** 카테고리 영문 코드 (데이터베이스에 저장되는 실제 값) */
export type Category = "POLITICS" | "ECONOMY" | "SOCIETY" | "CULTURE" | "TECH" | "WORLD";

/** 카테고리 하나의 정보 */
export interface CategoryInfo {
  value: Category; // 데이터베이스 저장값
  slug: string;    // 주소창에 쓰이는 이름 (예: /category/politics)
  label: string;   // 화면에 보여줄 한글 이름
  color: string;   // 카드 위 배지 색상 (Tailwind 클래스)
}

/**
 * 사이트에서 사용하는 카테고리 전체 목록 (표시 순서 = 배열 순서)
 */
export const CATEGORIES: CategoryInfo[] = [
  { value: "POLITICS", slug: "politics", label: "정치",      color: "bg-red-100 text-red-700" },
  { value: "ECONOMY",  slug: "economy",  label: "경제",      color: "bg-blue-100 text-blue-700" },
  { value: "SOCIETY",  slug: "society",  label: "사회",      color: "bg-green-100 text-green-700" },
  { value: "CULTURE",  slug: "culture",  label: "생활/문화", color: "bg-purple-100 text-purple-700" },
  { value: "TECH",     slug: "tech",     label: "IT/과학",   color: "bg-cyan-100 text-cyan-700" },
  { value: "WORLD",    slug: "world",    label: "세계",      color: "bg-orange-100 text-orange-700" },
];

// ------------------------------------
// 아래 값들은 위 CATEGORIES 목록에서 자동으로 만들어집니다.
// 직접 수정할 필요가 없습니다.
// ------------------------------------

/** 영문 코드 → 한글 이름 (예: POLITICS → 정치) */
export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
) as Record<Category, string>;

/** 영문 코드 → 배지 색상 */
export const CATEGORY_COLORS = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.color])
) as Record<Category, string>;

/** 영문 코드 → 주소 이름 (예: POLITICS → politics) */
export const CATEGORY_SLUGS_BY_VALUE = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.slug])
) as Record<Category, string>;

/** 주소 이름 → 영문 코드 (예: politics → POLITICS) */
export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.value])
) as Record<string, Category | undefined>;

/**
 * 사용자가 보낸 카테고리 값이 실제로 존재하는 카테고리인지 확인합니다.
 * 잘못된 값이 데이터베이스에 저장되는 것을 막아 줍니다.
 */
export function isValidCategory(value: unknown): value is Category {
  return typeof value === "string" && CATEGORIES.some((c) => c.value === value);
}
