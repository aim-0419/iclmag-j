"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ====================================
// 기사 삭제 버튼
// ------------------------------------
// 기사 상세 화면 아래쪽에 표시되며, 관리자에게만 보입니다.
// 실수로 지우는 일이 없도록 버튼을 누르면 곧바로 삭제하지 않고
// "정말 삭제할까요?" 확인 창을 먼저 띄웁니다.
// 삭제가 끝나면 홈으로 이동합니다.
// ====================================

export default function DeleteArticleButton({ articleId }: { articleId: number }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /** 확인 창에서 삭제를 누르면 서버에 삭제를 요청합니다. */
  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/articles/${articleId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "삭제에 실패했습니다.");
        return;
      }

      // 삭제 성공 → 홈으로 이동하고 목록을 최신 상태로 새로 고침
      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  /** 확인 창 닫기 (입력했던 오류 문구도 함께 정리) */
  const closeConfirm = () => {
    setShowConfirm(false);
    setErrorMessage("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="text-sm text-red-500 hover:text-red-700 transition-colors"
      >
        삭제
      </button>

      {/* 삭제 확인 창 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* 어두운 배경 (눌러도 닫힘) */}
          <div className="absolute inset-0 bg-black/50" onClick={closeConfirm} />

          {/* 확인 상자 */}
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-2">기사 삭제</h2>
            <p className="text-sm text-gray-500 mb-5 break-keep">
              정말 이 기사를 삭제하시겠습니까? 삭제한 기사는 복구할 수 없습니다.
            </p>

            {errorMessage && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {errorMessage}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
