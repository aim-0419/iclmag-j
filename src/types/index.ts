// ====================================
// 프론트엔드 / 백엔드 공통 타입 정의
// ------------------------------------
// "이 데이터는 어떤 모양이어야 한다"를 미리 약속해 두는 파일입니다.
// 덕분에 오타나 빠뜨린 값이 있으면 코드를 실행하기 전에 바로 잡아낼 수 있습니다.
//
// 카테고리 관련 값(한글 이름·색상·주소)은 src/constants/categories.ts 에 있습니다.
// ====================================

// 카테고리 타입은 상수 파일에서 관리하며, 편의를 위해 여기서도 다시 내보냅니다.
export type { Category } from "@/constants/categories";
import type { Category } from "@/constants/categories";

/** 기사 발행 상태 (임시저장 / 발행) */
export type Status = "DRAFT" | "PUBLISHED";

/** 사용자 권한 (일반회원 / 기자(구버전 호환) / 관리자) */
export type Role = "USER" | "WRITER" | "ADMIN";

/**
 * 목록 화면(홈·카테고리·전체 기사)에 표시되는 기사 한 건의 정보
 * 본문(content)은 목록에서 필요 없으므로 포함하지 않습니다.
 */
export interface ArticleListItem {
  id: number;
  title: string;
  summary: string | null;
  thumbnail: string | null;
  category: Category;
  views: number;
  createdAt: Date | string;
  author: {
    id: number;
    name: string;
  };
}

/** 로그인한 사용자 정보 (화면에서 사용) */
export interface AuthUser {
  userId: number;
  email: string;
  name: string;
  role: Role;
}
