import Link from "next/link";

// ====================================
// 404 페이지
// 존재하지 않는 페이지 접근 시 표시
// ====================================

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-gray-100 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-500 mb-8">
          요청하신 페이지가 삭제되었거나 주소가 변경되었습니다.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
