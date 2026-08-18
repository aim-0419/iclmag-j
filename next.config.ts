import type { NextConfig } from "next";
import path from "path";

// ====================================
// Next.js 설정 파일
// ------------------------------------
// 사이트 전체 동작 방식과 보안 설정을 정합니다.
// 기사 이미지는 서버 안(public/uploads 폴더)에 저장되므로
// 외부 이미지 주소를 따로 허용할 필요가 없습니다.
// ====================================

/**
 * 보안 응답 헤더
 * ------------------------------------
 * 브라우저에게 "이 사이트는 이런 규칙으로 다뤄 달라"고 알려 주는 설정입니다.
 * 대부분의 공격은 브라우저에서 일어나기 때문에, 브라우저에 규칙을 미리 알려 주면
 * 서버 코드에 실수가 있어도 피해를 크게 줄일 수 있습니다.
 */
const SECURITY_HEADERS = [
  {
    // 다른 사이트가 우리 페이지를 몰래 투명하게 덮어씌워
    // 사용자가 엉뚱한 버튼을 누르게 만드는 공격(클릭재킹)을 막습니다.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // 파일 종류를 브라우저가 멋대로 추측하지 못하게 합니다.
    // (이미지인 줄 알았는데 스크립트로 실행되는 상황 방지)
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // 다른 사이트로 이동할 때 "어느 페이지에서 왔는지" 주소를 통째로 넘기지 않습니다.
    // 주소에 담긴 비밀번호 재설정 열쇠 등이 새어 나가는 것을 막습니다.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // 이 사이트는 카메라·마이크·위치정보를 쓰지 않으므로 아예 차단합니다.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    // 한 번 https 로 접속한 브라우저는 이후 항상 https 로만 접속하게 합니다.
    // (http 로 연결을 가로채는 공격 방지 / https 사이트에서만 효과가 있습니다)
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // 이 프로젝트 폴더를 기준으로 빌드하도록 명시합니다.
  // (상위 폴더에 다른 프로젝트 파일이 있을 때 엉뚱한 폴더를 기준으로 잡는 것을 방지)
  outputFileTracingRoot: path.join(__dirname),

  images: {
    // 업로드된 이미지를 용량이 작은 형식으로 변환해 화면이 더 빨리 뜨게 합니다.
    formats: ["image/webp"],

    // 업로드 폴더의 SVG 는 처리하지 않습니다.
    // SVG 는 그림 파일이지만 그 안에 실행 코드를 숨길 수 있어 위험합니다.
    dangerouslyAllowSVG: false,
  },

  // 응답 정보에서 사용 중인 프레임워크 이름을 숨깁니다.
  // 어떤 기술을 쓰는지 알려 주면 그에 맞는 공격을 시도하기 쉬워집니다.
  poweredByHeader: false,

  /** 모든 주소에 위 보안 헤더를 적용합니다. */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
