// ====================================
// 공통 타입 정의
// 프론트엔드 / 백엔드 공통으로 사용하는 타입
// ====================================

// 카테고리 enum
export type Category = "POLITICS" | "ECONOMY" | "SOCIETY" | "CULTURE" | "TECH" | "WORLD";

// 기사 상태 enum
export type Status = "DRAFT" | "PUBLISHED";

// 사용자 역할 enum
export type Role = "USER" | "WRITER" | "ADMIN";

// ====================================
// 카테고리 한국어 매핑
// ====================================
export const CATEGORY_LABELS: Record<Category, string> = {
  POLITICS: "정치",
  ECONOMY: "경제",
  SOCIETY: "사회",
  CULTURE: "생활/문화",
  TECH: "IT/과학",
  WORLD: "세계",
};

// 카테고리 URL 슬러그 매핑
export const CATEGORY_SLUGS: Record<string, Category> = {
  politics: "POLITICS",
  economy: "ECONOMY",
  society: "SOCIETY",
  culture: "CULTURE",
  tech: "TECH",
  world: "WORLD",
};

// 카테고리 색상 매핑 (배지 색상)
export const CATEGORY_COLORS: Record<Category, string> = {
  POLITICS: "bg-red-100 text-red-700",
  ECONOMY: "bg-blue-100 text-blue-700",
  SOCIETY: "bg-green-100 text-green-700",
  CULTURE: "bg-purple-100 text-purple-700",
  TECH: "bg-cyan-100 text-cyan-700",
  WORLD: "bg-orange-100 text-orange-700",
};

// ====================================
// API 응답 타입
// ====================================

// 기사 목록 아이템 타입 (카드에서 사용)
export interface ArticleListItem {
  id: number;
  title: string;
  summary: string | null;
  thumbnail: string | null;
  category: Category;
  views: number;
  createdAt: string;
  author: {
    id: number;
    name: string;
  };
}

// 기사 상세 타입
export interface ArticleDetail extends ArticleListItem {
  content: string;
  status: Status;
  updatedAt: string;
}

// 로그인한 사용자 타입
export interface AuthUser {
  userId: number;
  email: string;
  name: string;
  role: Role;
}

// API 공통 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}
