import type { NextConfig } from "next";
import path from "path";

// ====================================
// Next.js 설정 파일
// ------------------------------------
// 사이트 전체 동작 방식에 대한 설정입니다.
// 기사 이미지는 서버 안(public/uploads 폴더)에 저장되므로
// 외부 이미지 주소를 따로 허용할 필요가 없습니다.
// ====================================

const nextConfig: NextConfig = {
  // 이 프로젝트 폴더를 기준으로 빌드하도록 명시합니다.
  // (상위 폴더에 다른 프로젝트 파일이 있을 때 엉뚱한 폴더를 기준으로 잡는 것을 방지)
  outputFileTracingRoot: path.join(__dirname),

  images: {
    // 업로드된 이미지를 용량이 작은 형식으로 변환해 화면이 더 빨리 뜨게 합니다.
    formats: ["image/webp"],
  },

  // 응답 정보에서 사용 중인 프레임워크 이름을 숨깁니다 (보안 권장 사항)
  poweredByHeader: false,
};

export default nextConfig;
