import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 로컬 업로드 이미지 허용
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
