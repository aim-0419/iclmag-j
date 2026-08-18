"use client";

import { useEffect } from "react";

// ====================================
// 팝업 창 공통 틀 (모달)
// ------------------------------------
// 화면 위에 겹쳐서 뜨는 작은 창의 공통 모양입니다.
// 아이디 찾기, 비밀번호 찾기 등 여러 곳에서 재사용합니다.
//
// 사용 편의를 위해 아래 동작이 기본으로 들어 있습니다.
//   - 어두운 배경을 누르면 닫힘
//   - 키보드 ESC 키를 누르면 닫힘
//   - 창이 떠 있는 동안 뒤 화면이 스크롤되지 않음
// ====================================

interface ModalProps {
  title: string;                // 창 제목
  onClose: () => void;          // 닫기 버튼을 눌렀을 때 실행할 동작
  children: React.ReactNode;    // 창 안에 들어갈 내용
}

export default function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    // ESC 키로 닫기
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    // 창이 떠 있는 동안 뒤 화면 스크롤 잠그기
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      {/* 어두운 배경 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 실제 창 (내용이 길면 창 안에서만 스크롤됨) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 max-h-full overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5 gap-3">
          <h2 className="text-lg font-bold text-gray-900 break-keep">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0"
          >
            &times;
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
