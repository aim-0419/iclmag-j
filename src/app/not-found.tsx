import Link from "next/link";

// ====================================
// 404 화면 (페이지를 찾을 수 없음)
// ------------------------------------
// 없는 주소로 들어오거나, 삭제된 기사를 열려고 할 때 표시됩니다.
// 막다른 길이 되지 않도록 홈으로 돌아가는 버튼을 함께 보여 줍니다.
// ====================================

export default function NotFound() {
  return (
    <div className="flex items-center justify-center px-4 py-24 sm:py-32">
      <div className="text-center">
        <p className="text-7xl sm:text-8xl font-black text-gray-200 mb-4">404</p>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-keep">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-500 mb-8 break-keep">
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
